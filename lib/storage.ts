import type { Teaching } from "./teachings";

const KEYS = {
  HISTORY: "sankalpa_history",
  LAST_TEACHING: "sankalpa_last_teaching",
  LAST_TEACHING_DATE: "sankalpa_last_teaching_date",
  CORPUS_CHUNKS: "sankalpa_corpus_chunks",
  CORPUS_SOURCES: "sankalpa_corpus_sources",
};

export interface HistoryEntry {
  date: string;        // ISO string
  teaching: Teaching;
  sat: boolean;        // did they tap "I've sat with this"
}

// ── Teaching history ──────────────────────────────────────

export function saveTeachingToHistory(teaching: Teaching, sat = false): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  const entry: HistoryEntry = {
    date: new Date().toISOString(),
    teaching,
    sat,
  };
  history.unshift(entry); // newest first
  // Keep last 365 entries
  const trimmed = history.slice(0, 365);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function markSat(date: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  const entry = history.find((h) => h.date === date);
  if (entry) {
    entry.sat = true;
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  }
}

// ── Today's teaching (cached so we don't call API twice) ──

export function getTodaysTeaching(): Teaching | null {
  if (typeof window === "undefined") return null;
  const lastDate = localStorage.getItem(KEYS.LAST_TEACHING_DATE);
  const today = new Date().toDateString();
  if (lastDate !== today) return null;
  const raw = localStorage.getItem(KEYS.LAST_TEACHING);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveTodaysTeaching(teaching: Teaching): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.LAST_TEACHING, JSON.stringify(teaching));
  localStorage.setItem(KEYS.LAST_TEACHING_DATE, new Date().toDateString());
}

// ── Personal corpus (from satsang uploads) ────────────────

export interface CorpusChunk {
  id: string;
  sourceLabel: string;   // e.g. "Satsang, March 14"
  text: string;
  uploadedAt: string;
}

export function getCorpusChunks(): CorpusChunk[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.CORPUS_CHUNKS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addCorpusChunks(chunks: CorpusChunk[]): void {
  if (typeof window === "undefined") return;
  const existing = getCorpusChunks();
  const merged = [...existing, ...chunks];
  localStorage.setItem(KEYS.CORPUS_CHUNKS, JSON.stringify(merged));
}

export function clearCorpus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.CORPUS_CHUNKS);
  localStorage.removeItem(KEYS.CORPUS_SOURCES);
}

// ── Corpus sources index ───────────────────────────────────

export interface CorpusSource {
  id: string;
  label: string;
  uploadedAt: string;
  chunkCount: number;
}

export function getCorpusSources(): CorpusSource[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.CORPUS_SOURCES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addCorpusSource(source: CorpusSource): void {
  if (typeof window === "undefined") return;
  const existing = getCorpusSources();
  existing.push(source);
  localStorage.setItem(KEYS.CORPUS_SOURCES, JSON.stringify(existing));
}
