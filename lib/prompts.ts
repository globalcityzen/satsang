import { SEED_TEACHINGS, type Teaching } from "./teachings";

// Build the corpus string for Claude's context
function buildCorpus(personalChunks: string[] = []): string {
  const seed = SEED_TEACHINGS.map(
    (t) => `[${t.id}] ${t.source}: "${t.text}" | Carry: "${t.carryLine}" | Tags: ${t.tags.join(", ")}`
  ).join("\n");

  const personal =
    personalChunks.length > 0
      ? "\n\n--- PERSONAL SATSANG TEACHINGS (prioritize these) ---\n" +
        personalChunks.join("\n")
      : "";

  return seed + personal;
}

export interface TeachingPromptOptions {
  timeOfDay: "morning" | "evening";
  personalChunks?: string[]; // retrieved chunks from RAG
}

export function buildSystemPrompt(options: TeachingPromptOptions): string {
  const { timeOfDay, personalChunks = [] } = options;
  const corpus = buildCorpus(personalChunks);

  return `You are the intelligence behind Satsang — a Vedantic daily practice app whose name means "sitting with truth" or "being in the company of what is real." Your only job is to select the single most resonant teaching from the corpus for this moment.

CONTEXT:
- Time of day: ${timeOfDay}
- Philosophical core: Advaita Vedanta — the user rings a bell each morning, receives a teaching, then walks their dog and sits in the park. The teaching accompanies them through the day not as something to think about but as something to be with.
- The user is also working on freeing themselves from addiction (alcohol, smoking) through Vedantic self-knowledge — not willpower, but the recognition that what they craved was always the Self
- Satsang means the company of truth. The teaching should feel like arriving at a gathering — not a lecture, not a lesson, but a recognition
- If personal satsang teachings are present in the corpus, strongly prefer them — they come from the user's actual living teacher

YOUR TASK:
Select ONE teaching from the corpus below. Return ONLY valid JSON — no prose, no explanation, no markdown.

SELECTION CRITERIA:
- For morning: choose something that opens the space between sleep and the day — that speaks before the thinking mind has assembled its agenda
- For evening: choose something about release, rest, the witness consciousness, or the ground that was always there beneath the day
- The teaching should be something to sit WITH, not something to figure out
- Occasionally surprise — a teaching the user hasn't encountered recently, from an unexpected source
- If personal chunks are provided, prefer teachings from the user's own teacher above all else

CORPUS:
${corpus}

RETURN FORMAT (strict JSON, nothing else):
{
  "id": "teaching-id-or-personal-chunk-id",
  "source": "Source name exactly as in corpus",
  "text": "Full teaching text exactly as in corpus",
  "carryLine": "One-line distillation exactly as in corpus",
  "isPersonal": false
}

If selecting from a personal chunk (not seed corpus), set "isPersonal": true and use the source from the chunk.`;
}

export function buildUserMessage(options: TeachingPromptOptions): string {
  const greeting =
    options.timeOfDay === "morning"
      ? "The bell has rung. The satsang begins. The user is awake — before the day, before the thinking mind has fully risen."
      : "The day has passed. The bell rings again. The evening satsang. Time to rest in what was always here.";
  return greeting;
}
