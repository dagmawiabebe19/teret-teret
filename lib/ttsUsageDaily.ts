import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export const FREE_TTS_CHARS_PER_DAY = 10_000;

function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function isMissingTtsUsageTable(error: PostgrestError | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /daily_tts_usage/i.test(error.message ?? "")
  );
}

export async function getTtsCharsUsedToday(
  admin: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await admin
    .from("daily_tts_usage")
    .select("characters_used")
    .eq("user_id", userId)
    .eq("usage_date", utcDateString())
    .maybeSingle();

  if (error) {
    if (isMissingTtsUsageTable(error)) {
      console.warn("[tts] daily_tts_usage table missing — skipping budget read");
      return 0;
    }
    console.error("[tts] budget read failed", error);
    return 0;
  }
  return data?.characters_used ?? 0;
}

export async function checkTtsBudget(
  admin: SupabaseClient,
  userId: string,
  textLength: number,
  unlimited: boolean
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number; skipped?: boolean }> {
  if (unlimited) {
    return {
      allowed: true,
      used: 0,
      limit: FREE_TTS_CHARS_PER_DAY,
      remaining: FREE_TTS_CHARS_PER_DAY,
    };
  }
  try {
    const used = await getTtsCharsUsedToday(admin, userId);
    const remaining = Math.max(0, FREE_TTS_CHARS_PER_DAY - used);
    return {
      allowed: textLength <= remaining,
      used,
      limit: FREE_TTS_CHARS_PER_DAY,
      remaining,
    };
  } catch (err) {
    console.warn("[tts] budget check failed — allowing request", err);
    return {
      allowed: true,
      used: 0,
      limit: FREE_TTS_CHARS_PER_DAY,
      remaining: FREE_TTS_CHARS_PER_DAY,
      skipped: true,
    };
  }
}

export async function recordTtsUsage(
  admin: SupabaseClient,
  userId: string,
  characters: number
): Promise<void> {
  if (characters <= 0) return;
  const usageDate = utcDateString();
  const { data: existing, error: readError } = await admin
    .from("daily_tts_usage")
    .select("characters_used")
    .eq("user_id", userId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (readError) {
    if (isMissingTtsUsageTable(readError)) {
      console.warn("[tts] daily_tts_usage table missing — skipping usage write");
      return;
    }
    console.error("[tts] usage read failed", readError);
    return;
  }

  if (existing) {
    const { error } = await admin
      .from("daily_tts_usage")
      .update({ characters_used: (existing.characters_used ?? 0) + characters })
      .eq("user_id", userId)
      .eq("usage_date", usageDate);
    if (error) console.error("[tts] usage update failed", error);
  } else {
    const { error } = await admin.from("daily_tts_usage").insert({
      user_id: userId,
      usage_date: usageDate,
      characters_used: characters,
    });
    if (error && !isMissingTtsUsageTable(error)) {
      console.error("[tts] usage insert failed", error);
    } else if (error) {
      console.warn("[tts] daily_tts_usage table missing — skipping usage write");
    }
  }
}
