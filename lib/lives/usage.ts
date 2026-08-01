import {
  ROLLING_WINDOW_MS,
  type UsageTrackingRow,
} from "@/lib/usageDaily";
import { FREE_LIVES_TURNS_PER_DAY } from "./constants";

/**
 * Lives free-tier usage from the shared usage_tracking row (rolling 24h window).
 * Same meter as bedtime stories — different daily cap.
 */
export function getLivesUsageFromRow(
  row: UsageTrackingRow | null,
  now: Date = new Date()
): { turnsUsed: number; remaining: number; windowExpired: boolean } {
  if (!row) {
    return {
      turnsUsed: 0,
      remaining: FREE_LIVES_TURNS_PER_DAY,
      windowExpired: true,
    };
  }
  const firstAt = row.first_story_at ? new Date(row.first_story_at).getTime() : null;
  const nowMs = now.getTime();
  const windowExpired = firstAt == null || nowMs >= firstAt + ROLLING_WINDOW_MS;
  if (windowExpired) {
    return {
      turnsUsed: 0,
      remaining: FREE_LIVES_TURNS_PER_DAY,
      windowExpired: true,
    };
  }
  const count = Math.max(0, row.generation_count ?? 0);
  const remaining = Math.max(0, FREE_LIVES_TURNS_PER_DAY - count);
  return { turnsUsed: count, remaining, windowExpired: false };
}

export const LIVES_DAILY_LIMIT_MESSAGE =
  "You've used today's decisions — come back tomorrow, or go Premium for unlimited";
