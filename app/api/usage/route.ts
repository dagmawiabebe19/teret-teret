import { NextResponse } from "next/server";
import { resolveProfileAccess } from "@/lib/profileAccess";
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
    const access = await resolveProfileAccess(user.id, request);
    const subscriptionStatus = access.subscription_status ?? "free";

    if (access.hasFullAccess) {
      return NextResponse.json({
        subscriptionStatus: access.is_ethiopia_free ? "free" : "premium",
        isEthiopiaFree: access.is_ethiopia_free,
        hasFullAccess: true,
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
      isEthiopiaFree: false,
      hasFullAccess: false,
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
    isEthiopiaFree: false,
    hasFullAccess: false,
    freeStoriesPerDay: FREE_STORIES_PER_DAY,
    storiesUsedToday: count,
    remainingStoriesToday: remaining,
  });
}
