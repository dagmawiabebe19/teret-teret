import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";
import { getTodayDateKey } from "@/lib/dailyTeret";
import { XP_DAILY_TERET, buildUserProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to complete Daily Teret" }, { status: 401 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const dateKey = getTodayDateKey();
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_daily_teret_viewed_at, completed_daily_teret_dates, xp")
    .eq("id", user.id)
    .single();

  const completed: string[] = Array.isArray(profile?.completed_daily_teret_dates)
    ? profile.completed_daily_teret_dates
    : [];
  if (completed.includes(dateKey)) {
    return NextResponse.json({
      ok: true,
      alreadyCompleted: true,
      progress: buildUserProgress(
        profile?.streak_count ?? 0,
        profile?.last_daily_teret_viewed_at ?? null,
        completed,
        profile?.xp ?? 0
      ),
    });
  }

  const lastViewed = profile?.last_daily_teret_viewed_at
    ? new Date(profile.last_daily_teret_viewed_at)
    : null;
  const lastDateKey = lastViewed
    ? `${lastViewed.getUTCFullYear()}-${String(lastViewed.getUTCMonth() + 1).padStart(2, "0")}-${String(lastViewed.getUTCDate()).padStart(2, "0")}`
    : null;
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;
  const prevStreak = profile?.streak_count ?? 0;
  const streakCount = lastDateKey === yesterdayKey ? prevStreak + 1 : 1;
  const newCompleted = [...completed, dateKey];
  const newXp = (profile?.xp ?? 0) + XP_DAILY_TERET;

  const { error } = await supabase
    .from("profiles")
    .update({
      streak_count: streakCount,
      last_daily_teret_viewed_at: new Date().toISOString(),
      completed_daily_teret_dates: newCompleted,
      xp: newXp,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[daily-teret/complete]", error);
    return NextResponse.json({ error: "Failed to save completion" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    alreadyCompleted: false,
    progress: buildUserProgress(streakCount, new Date().toISOString(), newCompleted, newXp),
  });
}
