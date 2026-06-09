/** YYYY-MM-DD in UTC */
export function toDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Consecutive calendar days with at least one generation, counting back from today (or yesterday if none today). */
export function computeGenerationStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort();
  const today = toDateKey();
  const yesterday = toDateKey(new Date(Date.now() - 86400000));

  let start = unique.includes(today) ? today : unique.includes(yesterday) ? yesterday : null;
  if (!start) return 0;

  const set = new Set(unique);
  let streak = 0;
  let cursor = new Date(start + "T12:00:00Z");

  while (set.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export function appendGenerationDate(existing: string[] | null | undefined): string[] {
  const today = toDateKey();
  const list = Array.isArray(existing) ? [...existing] : [];
  if (!list.includes(today)) list.push(today);
  return list.slice(-120);
}
