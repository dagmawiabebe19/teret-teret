import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_STORIES_PER_DAY, getSignedInUsageFromRow, getGuestDailyUsage, getClientIp } from "@/lib/usageDaily";

export const dynamic = "force-dynamic";

/**
 * Returns server-side usage for the current user or guest (by IP).
 * Use for badge and paywall: storiesUsedToday, freeStoriesPerDay, remainingStoriesToday, subscriptionStatus.
 */
export async function GET(request: Request) {
  const { user } = await getOptionalUser();
  const supabase = user ? await import("@/lib/supabase/server").then((m) => m.createClient()) : null;
  const admin = createAdminClient();

  if (user && supabase) {
    const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("id", user.id).single();
    const subscriptionStatus = profile?.subscription_status ?? "free";
    const isPremium = subscriptionStatus === "premium" || subscriptionStatus === "active";

    if (isPremium) {
      return NextResponse.json({
        subscriptionStatus: "premium",
        freeStoriesPerDay: FREE_STORIES_PER_DAY,
        storiesUsedToday: 0,
        remainingStoriesToday: null,
      });
    }

    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("generation_count, first_story_at")
      .eq("user_id", user.id)
      .single();

    const { storiesUsed, remaining } = getSignedInUsageFromRow(usage ?? null);
    return NextResponse.json({
      subscriptionStatus: "free",
      freeStoriesPerDay: FREE_STORIES_PER_DAY,
      storiesUsedToday: storiesUsed,
      remainingStoriesToday: remaining,
    });
  }

  const ip = getClientIp(request);
  const { count } = await getGuestDailyUsage(admin, ip);
  const remaining = Math.max(0, FREE_STORIES_PER_DAY - count);
  return NextResponse.json({
    subscriptionStatus: null,
    freeStoriesPerDay: FREE_STORIES_PER_DAY,
    storiesUsedToday: count,
    remainingStoriesToday: remaining,
  });
}
