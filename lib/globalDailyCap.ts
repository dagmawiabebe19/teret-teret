import { createAdminClient } from "@/lib/supabase/admin";

export const GLOBAL_DAILY_STORY_CAP = 500;

export const GLOBAL_CAP_MESSAGE =
  "We're taking a short break — check back tomorrow! 🌙";

export async function reserveGlobalDailyStorySlot(): Promise<{
  allowed: boolean;
  count: number;
}> {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[global-daily-cap] admin client unavailable, skipping cap check");
    return { allowed: true, count: 0 };
  }

  const { data, error } = await admin.rpc("reserve_global_daily_story_slot", {
    p_cap: GLOBAL_DAILY_STORY_CAP,
  });

  if (error) {
    console.error("[global-daily-cap] rpc failed", error);
    return { allowed: true, count: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    count: typeof row?.story_count === "number" ? row.story_count : 0,
  };
}
