/**
 * Daily free-story usage: server truth for guests (by IP) and signed-in users (usage_tracking).
 * FREE_STORIES_PER_DAY applies to both guests and signed-in free users.
 * Premium users are unlimited (no check).
 *
 * Signed-in users: rolling 24-hour window from first_story_at (resets 24h after first story in window).
 * Guests: 24h window from first use (rate_limits table).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_STORIES_PER_DAY = 3;

/** Rolling window length in ms (24 hours). */
export const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;

const GUEST_DAILY_KEY_PREFIX = "guest_daily:";
const GUEST_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type UsageTrackingRow = {
  generation_count?: number | null;
  first_story_at?: string | null;
  billing_period_end?: string | null;
};

/**
 * Compute signed-in usage from a usage_tracking row (rolling 24h window).
 * If first_story_at is null or more than 24h ago, the window is expired → 0 used, full allowance.
 */
export function getSignedInUsageFromRow(
  row: UsageTrackingRow | null,
  now: Date = new Date()
): { storiesUsed: number; remaining: number; windowExpired: boolean } {
  if (!row) {
    return { storiesUsed: 0, remaining: FREE_STORIES_PER_DAY, windowExpired: true };
  }
  const firstAt = row.first_story_at ? new Date(row.first_story_at).getTime() : null;
  const nowMs = now.getTime();
  const windowExpired = firstAt == null || nowMs >= firstAt + ROLLING_WINDOW_MS;
  if (windowExpired) {
    return { storiesUsed: 0, remaining: FREE_STORIES_PER_DAY, windowExpired: true };
  }
  const count = Math.max(0, row.generation_count ?? 0);
  const remaining = Math.max(0, FREE_STORIES_PER_DAY - count);
  return { storiesUsed: count, remaining, windowExpired: false };
}

/** Get guest daily usage count (by IP). Uses rate_limits table with 24h window. Admin client required. */
export async function getGuestDailyUsage(
  admin: SupabaseClient | null,
  ip: string
): Promise<{ count: number }> {
  if (!admin) return { count: 0 };
  const key = `${GUEST_DAILY_KEY_PREFIX}${ip}`;
  const { data } = await admin.from("rate_limits").select("count, window_start").eq("key", key).single();
  const now = Date.now();
  const windowStart = data?.window_start ? new Date(data.window_start).getTime() : 0;
  if (!data || now - windowStart >= GUEST_DAILY_WINDOW_MS) return { count: 0 };
  return { count: data.count ?? 0 };
}

/** Check if guest is under daily limit; does not increment. */
export async function checkGuestDailyLimit(
  admin: SupabaseClient | null,
  ip: string
): Promise<{ allowed: boolean; storiesUsedToday: number }> {
  const { count } = await getGuestDailyUsage(admin, ip);
  return { allowed: count < FREE_STORIES_PER_DAY, storiesUsedToday: count };
}

/** Increment guest daily usage (call after successful story generation). */
export async function incrementGuestDaily(admin: SupabaseClient | null, ip: string): Promise<void> {
  if (!admin) return;
  const key = `${GUEST_DAILY_KEY_PREFIX}${ip}`;
  const { data } = await admin.from("rate_limits").select("count, window_start").eq("key", key).single();
  const now = new Date();
  const windowStart = data?.window_start ? new Date(data.window_start) : null;
  const windowExpired = !windowStart || now.getTime() - windowStart.getTime() >= GUEST_DAILY_WINDOW_MS;

  if (windowExpired || !data) {
    await admin.from("rate_limits").upsert(
      { key, count: 1, window_start: now.toISOString() },
      { onConflict: "key" }
    );
  } else {
    await admin.from("rate_limits").update({ count: (data.count ?? 0) + 1 }).eq("key", key);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}
