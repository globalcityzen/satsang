import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const timeOfDay: "morning" | "evening" = body.timeOfDay ?? "morning";
    const personalChunks: string[] = body.personalChunks ?? [];

    const systemPrompt = buildSystemPrompt({ timeOfDay, personalChunks });
    const userMessage = buildUserMessage({ timeOfDay, personalChunks });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse the JSON response
    const text = content.text.trim();
    const teaching = JSON.parse(text);

    return NextResponse.json({ teaching });
  } catch (error) {
    console.error("Teaching API error:", error);

    // Fallback to a random seed teaching
    const { getRandomTeaching } = await import("@/lib/teachings");
    const teaching = getRandomTeaching();
    return NextResponse.json({ teaching, fallback: true });
  }
}
