/**
 * Server-side rate limiting for generate-story API.
 * Limits: 10/hour for logged-in users, 3/hour for guests, per IP.
 */

const RATE_LIMIT_USER = 10;
const RATE_LIMIT_GUEST = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

type RateLimitEntry = { count: number; windowStart: number };

const memoryStore = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

function pruneWindow(entry: RateLimitEntry): RateLimitEntry {
  const now = Date.now();
  if (now - entry.windowStart >= WINDOW_MS) {
    return { count: 1, windowStart: now };
  }
  return { count: entry.count + 1, windowStart: entry.windowStart };
}

async function checkWithSupabase(ip: string, isGuest: boolean): Promise<{ allowed: boolean }> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    if (!supabase) return { allowed: true };

    const key = `ip:${ip}`;
    const limit = isGuest ? RATE_LIMIT_GUEST : RATE_LIMIT_USER;

    const { data } = await supabase
      .from("rate_limits")
      .select("count, window_start")
      .eq("key", key)
      .single();

    const now = new Date();
    const windowStart = data?.window_start ? new Date(data.window_start) : null;
    const count = data?.count ?? 0;
    const windowExpired = !windowStart || now.getTime() - windowStart.getTime() >= WINDOW_MS;

    if (windowExpired) {
      await supabase.from("rate_limits").upsert(
        { key, count: 1, window_start: now.toISOString() },
        { onConflict: "key" }
      );
      return { allowed: true };
    }

    if (count >= limit) {
      return { allowed: false };
    }

    await supabase
      .from("rate_limits")
      .update({ count: count + 1 })
      .eq("key", key);

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

function checkWithMemory(ip: string, isGuest: boolean): { allowed: boolean } {
  const key = `ip:${ip}`;
  const limit = isGuest ? RATE_LIMIT_GUEST : RATE_LIMIT_USER;

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { count: 0, windowStart: Date.now() };
  }
  entry = pruneWindow(entry);
  memoryStore.set(key, entry);

  if (entry.count > limit) {
    return { allowed: false };
  }
  return { allowed: true };
}

export async function checkRateLimit(request: Request, isGuest: boolean): Promise<{ allowed: boolean; ip: string }> {
  const ip = getClientIp(request);

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    if (supabase) {
      const result = await checkWithSupabase(ip, isGuest);
      return { ...result, ip };
    }
  } catch {}

  const result = checkWithMemory(ip, isGuest);
  return { ...result, ip };
}
