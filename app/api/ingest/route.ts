import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic();
const openai = new OpenAI();

// Max file size 25MB (Whisper limit)

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Text extraction ────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  // Plain text
  if (["txt", "md"].includes(ext)) {
    return await file.text();
  }

  // Audio/video — transcribe with Whisper
  if (["mp3", "mp4", "m4a", "wav", "ogg", "webm"].includes(ext)) {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });
    const transcribable = new File([blob], file.name, { type: file.type });

    const transcription = await openai.audio.transcriptions.create({
      file: transcribable,
      model: "whisper-1",
      language: "en",
    });
    return transcription.text;
  }

  // PDF — extract text via simple approach
  if (ext === "pdf") {
    // For MVP we read as text — works for text-based PDFs
    // For scanned PDFs, user can paste text manually
    const text = await file.text();
    return text;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

// ── Claude extraction prompt ───────────────────────────────

const EXTRACTION_SYSTEM = `You are extracting discrete spiritual teachings from a satsang transcript or class recording.

Your job is to identify the KEY TEACHING MOMENTS — the specific insights, direct pointings, verses explained, stories told, or moments of clarity that could serve as a morning teaching in a Vedantic practice app.

For each teaching, extract:
1. The core insight in 1-3 clear sentences (the user's own words or a close paraphrase)
2. A one-line carry line — the essence distilled to something a person can walk into the day with

Return ONLY valid JSON — no prose, no markdown, no explanation.

FORMAT:
{
  "teachings": [
    {
      "text": "The full teaching in clear sentences",
      "carryLine": "One line to carry into the day"
    }
  ]
}

Extract between 5 and 20 teachings depending on length. Quality over quantity. Only extract genuine teaching moments — not logistics, not greetings, not tangents.`;

async function extractTeachings(
  transcript: string,
  sourceLabel: string
): Promise<Array<{ id: string; sourceLabel: string; text: string; carryLine: string }>> {
  // Chunk if very long (>8000 chars) to avoid token limits
  const chunks =
    transcript.length > 8000
      ? [transcript.slice(0, 8000), transcript.slice(8000, 16000)].filter(Boolean)
      : [transcript];

  const allTeachings: Array<{ id: string; sourceLabel: string; text: string; carryLine: string }> = [];

  for (const chunk of chunks) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: EXTRACTION_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Source: ${sourceLabel}\n\nTranscript:\n${chunk}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") continue;

    try {
      const parsed = JSON.parse(content.text.trim());
      const teachings = parsed.teachings ?? [];

      for (const t of teachings) {
        allTeachings.push({
          id: generateId(),
          sourceLabel,
          text: t.text,
          carryLine: t.carryLine,
        });
      }
    } catch {
      console.error("Failed to parse extraction response");
    }
  }

  return allTeachings;
}

// ── Route handler ──────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const label = (formData.get("label") as string) ?? "Satsang";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Extract text
    const transcript = await extractTextFromFile(file);

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from this file" },
        { status: 400 }
      );
    }

    // 2. Extract teachings with Claude
    const chunks = await extractTeachings(transcript, label);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No teachings could be extracted" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sourceId: generateId(),
      label,
      chunks,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Processing failed. Try a text file for now." },
      { status: 500 }
    );
  }
}
