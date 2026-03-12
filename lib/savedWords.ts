import type { VocabWord } from "@/types";

const STORAGE_KEY = "teret_saved_words";

export function getSavedWords(): VocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWord(word: VocabWord): void {
  const list = getSavedWords();
  if (list.some((w) => w.word.toLowerCase() === word.word.toLowerCase())) return;
  list.push(word);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function removeSavedWord(word: string): void {
  const list = getSavedWords().filter(
    (w) => w.word.toLowerCase() !== word.toLowerCase()
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
