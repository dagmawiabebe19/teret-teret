import type { StoryCategory } from "@/types";

export type StoryRow = {
  region?: string | null;
  category?: string | null;
  created_at?: string;
};

export function mostFrequent(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v?.trim()) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let max = 0;
  for (const [k, n] of counts) {
    if (n > max) {
      max = n;
      best = k;
    }
  }
  return best;
}

export function computeStoryStats(stories: StoryRow[]) {
  return {
    totalStories: stories.length,
    favoriteLocation: mostFrequent(stories.map((s) => s.region)),
    favoriteCategory: mostFrequent(stories.map((s) => s.category)) as StoryCategory | null,
  };
}
