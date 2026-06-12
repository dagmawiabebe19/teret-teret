import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { ANALYTICS_EVENTS } from "@/lib/analyticsEvents";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type BreakdownRow = { key: string; count: number };

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

async function countEvents(
  admin: ReturnType<typeof createAdminClient>,
  eventName: string,
  sinceIso: string
): Promise<number> {
  if (!admin) return 0;
  const { count, error } = await admin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event_name", eventName)
    .gte("created_at", sinceIso);
  if (error) {
    if (error.code === "42P01") return 0;
    throw new Error(`${eventName}: ${error.message}`);
  }
  return count ?? 0;
}

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const now = new Date();
  const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rolling24hDate = ago24h.slice(0, 10);

  try {
    const [
      totalProfilesRes,
      profiles24hRes,
      profiles7dRes,
      premiumRes,
      stories24hRes,
      stories7dRes,
      globalStatsRes,
      countryRes,
      deviceEventsRes,
    ] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", ago24h),
      admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", ago7d),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("subscription_status", ["premium", "active"]),
      admin.from("stories").select("id", { count: "exact", head: true }).gte("created_at", ago24h),
      admin.from("stories").select("id", { count: "exact", head: true }).gte("created_at", ago7d),
      admin.from("global_daily_stats").select("date, story_count").gte("date", rolling24hDate),
      admin.from("profiles").select("signup_country"),
      admin
        .from("analytics_events")
        .select("device_type")
        .gte("created_at", ago7d),
    ]);

    const errors: string[] = [];
    for (const [label, res] of [
      ["profiles.total", totalProfilesRes],
      ["profiles.last24h", profiles24hRes],
      ["profiles.last7d", profiles7dRes],
      ["profiles.premium", premiumRes],
      ["stories.last24h", stories24hRes],
      ["stories.last7d", stories7dRes],
    ] as const) {
      if (res.error) errors.push(`${label}: ${res.error.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Failed to load stats", details: errors }, { status: 500 });
    }

    const globalStoryCount24h = (globalStatsRes.data ?? []).reduce(
      (sum, row) => sum + (row.story_count ?? 0),
      0
    );

    let storiesLast24h = globalStoryCount24h;
    let storiesLast7d = stories7dRes.count ?? 0;

    const analyticsProbe = await admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .limit(1);
    const analyticsAvailable = !analyticsProbe.error || analyticsProbe.error.code !== "42P01";

    if (analyticsAvailable) {
      const [
        analyticsStories24h,
        analyticsStories7d,
        homepageViews7d,
        storyStarted7d,
        storyGenerated7d,
        signups7d,
        subscriptions7d,
      ] = await Promise.all([
        countEvents(admin, ANALYTICS_EVENTS.STORY_GENERATED, ago24h),
        countEvents(admin, ANALYTICS_EVENTS.STORY_GENERATED, ago7d),
        countEvents(admin, ANALYTICS_EVENTS.HOMEPAGE_VIEW, ago7d),
        countEvents(admin, ANALYTICS_EVENTS.STORY_STARTED, ago7d),
        countEvents(admin, ANALYTICS_EVENTS.STORY_GENERATED, ago7d),
        countEvents(admin, ANALYTICS_EVENTS.SIGNUP_COMPLETED, ago7d),
        countEvents(admin, ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, ago7d),
      ]);

      if (analyticsStories24h > 0) storiesLast24h = analyticsStories24h;
      if (analyticsStories7d > 0) storiesLast7d = analyticsStories7d;

      const countryBreakdownMap: Record<string, number> = {};
      const deviceBreakdownMap: Record<string, number> = {};

      if (!countryRes.error) {
        for (const row of countryRes.data ?? []) {
          const key = (row as { signup_country: string | null }).signup_country?.trim() || "unknown";
          countryBreakdownMap[key] = (countryBreakdownMap[key] ?? 0) + 1;
        }
      }

      if (!deviceEventsRes.error && deviceEventsRes.data) {
        for (const row of deviceEventsRes.data) {
          const d = (row as { device_type?: string | null }).device_type?.trim() || "unknown";
          deviceBreakdownMap[d] = (deviceBreakdownMap[d] ?? 0) + 1;
        }
      }

      const country_breakdown: BreakdownRow[] = Object.entries(countryBreakdownMap)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

      const device_breakdown: BreakdownRow[] = Object.entries(deviceBreakdownMap)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

      const totalProfiles = totalProfilesRes.count ?? 0;

      return NextResponse.json({
        generated_at: now.toISOString(),
        total_profiles: totalProfiles,
        profiles_last_24h: profiles24hRes.count ?? 0,
        profiles_last_7d: profiles7dRes.count ?? 0,
        stories_last_24h: storiesLast24h,
        stories_last_7d: storiesLast7d,
        premium_subscribers: premiumRes.count ?? 0,
        signup_conversion_rate: pct(signups7d, homepageViews7d),
        story_completion_rate: pct(storyGenerated7d, storyStarted7d),
        subscriber_conversion_rate: pct(subscriptions7d, totalProfiles),
        country_breakdown,
        device_breakdown,
        funnel_7d: {
          homepage_views: homepageViews7d,
          story_started: storyStarted7d,
          story_generated: storyGenerated7d,
          signups: signups7d,
          subscriptions: subscriptions7d,
        },
      });
    }

    const countryBreakdownMap: Record<string, number> = {};
    if (!countryRes.error) {
      for (const row of countryRes.data ?? []) {
        const key = (row as { signup_country: string | null }).signup_country?.trim() || "unknown";
        countryBreakdownMap[key] = (countryBreakdownMap[key] ?? 0) + 1;
      }
    }

    return NextResponse.json({
      generated_at: now.toISOString(),
      total_profiles: totalProfilesRes.count ?? 0,
      profiles_last_24h: profiles24hRes.count ?? 0,
      profiles_last_7d: profiles7dRes.count ?? 0,
      stories_last_24h: storiesLast24h,
      stories_last_7d: storiesLast7d,
      premium_subscribers: premiumRes.count ?? 0,
      signup_conversion_rate: 0,
      story_completion_rate: 0,
      subscriber_conversion_rate: pct(premiumRes.count ?? 0, totalProfilesRes.count ?? 0),
      country_breakdown: Object.entries(countryBreakdownMap).map(([key, count]) => ({ key, count })),
      device_breakdown: [],
      note: "Run migration 021_analytics_events.sql for funnel conversion rates.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load stats", details: [message] }, { status: 500 });
  }
}
