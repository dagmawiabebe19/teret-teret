import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_TTS_CHARS_PER_DAY = 10_000;

function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function getTtsCharsUsedToday(
  admin: SupabaseClient,
  userId: string
): Promise<number> {
  const { data } = await admin
    .from("daily_tts_usage")
    .select("characters_used")
    .eq("user_id", userId)
    .eq("usage_date", utcDateString())
    .maybeSingle();
  return data?.characters_used ?? 0;
}

export async function checkTtsBudget(
  admin: SupabaseClient,
  userId: string,
  textLength: number,
  unlimited: boolean
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
  if (unlimited) {
    return {
      allowed: true,
      used: 0,
      limit: FREE_TTS_CHARS_PER_DAY,
      remaining: FREE_TTS_CHARS_PER_DAY,
    };
  }
  const used = await getTtsCharsUsedToday(admin, userId);
  const remaining = Math.max(0, FREE_TTS_CHARS_PER_DAY - used);
  return {
    allowed: textLength <= remaining,
    used,
    limit: FREE_TTS_CHARS_PER_DAY,
    remaining,
  };
}

export async function recordTtsUsage(
  admin: SupabaseClient,
  userId: string,
  characters: number
): Promise<void> {
  if (characters <= 0) return;
  const usageDate = utcDateString();
  const { data: existing } = await admin
    .from("daily_tts_usage")
    .select("characters_used")
    .eq("user_id", userId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (existing) {
    await admin
      .from("daily_tts_usage")
      .update({ characters_used: (existing.characters_used ?? 0) + characters })
      .eq("user_id", userId)
      .eq("usage_date", usageDate);
  } else {
    await admin.from("daily_tts_usage").insert({
      user_id: userId,
      usage_date: usageDate,
      characters_used: characters,
    });
  }
}
