import type { SavedStoryItem } from "@/components/SavedStoriesPanel";

const STORAGE_KEY = "teret_saved";
const TTL_MS = 24 * 60 * 60 * 1000;

type StoredStory = SavedStoryItem & { savedAt?: number };

function prune(stories: StoredStory[]): StoredStory[] {
  const now = Date.now();
  return stories.filter((s) => {
    const at = s.savedAt ?? 0;
    return at > 0 && now - at < TTL_MS;
  });
}

export function getLocalSavedStories(): SavedStoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fresh = prune(parsed as StoredStory[]);
    if (fresh.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

export function setLocalSavedStories(stories: SavedStoryItem[]): void {
  if (typeof window === "undefined") return;
  const stamped: StoredStory[] = stories.map((s) => ({
    ...s,
    savedAt: Date.now(),
  }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped.slice(0, 10)));
  } catch {
    // ignore
  }
}
