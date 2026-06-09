import { NextResponse } from "next/server";
import { buildUserProgress } from "@/lib/progress";
import { getOptionalUser } from "@/lib/supabase/server";
import { computeGenerationStreak } from "@/lib/streaks";
import { computeStoryStats } from "@/lib/storyStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ user: null, progress: null, stats: null }, { status: 200 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      },
      progress: null,
      stats: null,
    }, { status: 200 });
  }

  const [{ data: profile }, { data: stories }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status, streak_count, last_daily_teret_viewed_at, completed_daily_teret_dates, xp, story_generation_dates")
      .eq("id", user.id)
      .single(),
    supabase
      .from("stories")
      .select("region, category, created_at")
      .eq("user_id", user.id),
  ]);

  const progress = profile
    ? buildUserProgress(
        profile.streak_count ?? 0,
        profile.last_daily_teret_viewed_at ?? null,
        (profile.completed_daily_teret_dates as string[]) ?? [],
        profile.xp ?? 0
      )
    : null;

  const storyStats = computeStoryStats(stories ?? []);
  const generationDates = (profile?.story_generation_dates as string[] | null) ?? [];
  const generationStreak = computeGenerationStreak(generationDates);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    },
    subscriptionStatus: profile?.subscription_status ?? "free",
    progress,
    stats: {
      ...storyStats,
      generationStreak,
    },
  });
}
