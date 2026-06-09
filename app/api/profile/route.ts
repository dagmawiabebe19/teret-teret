import { NextResponse } from "next/server";
import { buildUserProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { isPremiumStatus } from "@/lib/premium";
import { computeGenerationStreak } from "@/lib/streaks";
import { computeStoryStats } from "@/lib/storyStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ user: null, progress: null, stats: null }, { status: 200 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ user: null, progress: null, stats: null }, { status: 200 });
  }

  const [
    { data: subscriptionProfile, error: subscriptionError },
    { data: profile, error: profileError },
    { data: stories, error: storiesError },
    { data: usage },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select(
        "subscription_status, streak_count, last_daily_teret_viewed_at, completed_daily_teret_dates, xp, story_generation_dates"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("stories")
      .select("region, category, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_tracking")
      .select("generation_count")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("current_period_end, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const rawSubscriptionStatus =
    subscriptionProfile?.subscription_status ??
    profile?.subscription_status ??
    "free";

  if (subscriptionError) {
    console.error("[profile] subscription_status query failed", {
      userId: user.id,
      code: subscriptionError.code,
      message: subscriptionError.message,
      details: subscriptionError.details,
    });
  }
  if (profileError) {
    console.error("[profile] full profile query failed", {
      userId: user.id,
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
    });
  }
  if (storiesError) {
    console.error("[profile] stories query failed", storiesError);
  }

  console.log("[profile] subscription status", {
    userId: user.id,
    rawSubscriptionStatus,
    isPremium: isPremiumStatus(rawSubscriptionStatus),
    subscriptionQueryOk: !subscriptionError,
    profileQueryOk: !profileError,
  });

  const progress = profile
    ? buildUserProgress(
        profile.streak_count ?? 0,
        profile.last_daily_teret_viewed_at ?? null,
        (profile.completed_daily_teret_dates as string[]) ?? [],
        profile.xp ?? 0
      )
    : null;

  const storyStats = computeStoryStats(stories ?? []);
  const generationCount = usage?.generation_count ?? 0;
  if (storyStats.totalStories < generationCount) {
    storyStats.totalStories = generationCount;
  }
  const generationDates = (profile?.story_generation_dates as string[] | null) ?? [];
  const generationStreak = computeGenerationStreak(generationDates);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    },
    subscriptionStatus: rawSubscriptionStatus,
    nextBillingDate: subscription?.current_period_end ?? null,
    progress,
    stats: {
      ...storyStats,
      generationStreak,
    },
  });
}
