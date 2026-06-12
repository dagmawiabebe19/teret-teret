import { NextResponse } from "next/server";
import { buildUserProgress } from "@/lib/progress";
import { resolveProfileAccess } from "@/lib/profileAccess";
import { createClient } from "@/lib/supabase/server";
import { computeGenerationStreak } from "@/lib/streaks";
import { computeStoryStats } from "@/lib/storyStats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const access = await resolveProfileAccess(user.id, request);

  const [
    { data: profile, error: profileError },
    { data: stories, error: storiesError },
    { data: usage },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "subscription_status, is_ethiopia_free, signup_country, streak_count, last_daily_teret_viewed_at, completed_daily_teret_dates, xp, story_generation_dates"
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
    profile?.subscription_status ?? access.subscription_status ?? "free";

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
    hasFullAccess: access.hasFullAccess,
    isEthiopiaFree: access.is_ethiopia_free,
    signupCountry: access.signup_country,
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
    isEthiopiaFree: access.is_ethiopia_free,
    signupCountry: access.signup_country,
    hasFullAccess: access.hasFullAccess,
    nextBillingDate: subscription?.current_period_end ?? null,
    progress,
    stats: {
      ...storyStats,
      generationStreak,
    },
  });
}
