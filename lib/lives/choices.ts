import type { LifeChoice, VocabPair } from "./types";

/** Extract the English phrase the player "said" from a choices array. */
export function choiceEnglish(choices: unknown, index: number): string | null {
  if (!Array.isArray(choices)) return null;
  const item = choices[index];
  if (typeof item === "string") {
    const t = item.trim();
    return t || null;
  }
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  for (const key of ["english", "label", "text"] as const) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function normalizeStoredChoices(raw: unknown): LifeChoice[] {
  if (!Array.isArray(raw)) return [];
  const out: LifeChoice[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push({ english: t, amharic: "" });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const english =
      (typeof row.english === "string" && row.english.trim()) ||
      (typeof row.label === "string" && row.label.trim()) ||
      (typeof row.text === "string" && row.text.trim()) ||
      "";
    if (!english) continue;
    const amharic =
      (typeof row.amharic === "string" && row.amharic.trim()) ||
      (typeof row.translation === "string" && row.translation.trim()) ||
      "";
    out.push({ english, amharic });
  }
  return out;
}

export function vocabFromDeltasApplied(raw: unknown): VocabPair[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const vocab = (raw as { vocab?: unknown }).vocab;
  if (!Array.isArray(vocab)) return [];
  const out: VocabPair[] = [];
  for (const item of vocab) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const english = typeof row.english === "string" ? row.english.trim() : "";
    if (!english) continue;
    const amharic = typeof row.amharic === "string" ? row.amharic.trim() : "";
    out.push({ english, amharic });
  }
  return out;
}
