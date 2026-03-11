/**
 * Daily free-story usage: server truth for guests (by IP) and signed-in users (usage_tracking).
 * FREE_STORIES_PER_DAY applies to both guests and signed-in free users.
 * Premium users are unlimited (no check).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_STORIES_PER_DAY = 3;

const GUEST_DAILY_KEY_PREFIX = "guest_daily:";
const GUEST_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Start of today and start of tomorrow in UTC (for daily reset). */
export function getTodayPeriodUTC(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const periodEnd = new Date(periodStart);
  periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);
  return { periodStart, periodEnd };
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
