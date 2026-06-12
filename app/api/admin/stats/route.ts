import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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

  const [
    totalProfilesRes,
    profiles24hRes,
    profiles7dRes,
    premiumRes,
    stories24hRes,
    globalStatsRes,
    countryRes,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", ago24h),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", ago7d),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("subscription_status", ["premium", "active"]),
    admin
      .from("stories")
      .select("id", { count: "exact", head: true })
      .gte("created_at", ago24h),
    admin
      .from("global_daily_stats")
      .select("date, story_count")
      .gte("date", rolling24hDate),
    admin.from("profiles").select("signup_country"),
  ]);

  const errors: string[] = [];
  for (const [label, res] of [
    ["profiles.total", totalProfilesRes],
    ["profiles.last24h", profiles24hRes],
    ["profiles.last7d", profiles7dRes],
    ["profiles.premium", premiumRes],
    ["stories.last24h", stories24hRes],
    ["global_daily_stats", globalStatsRes],
  ] as const) {
    if (res.error) errors.push(`${label}: ${res.error.message}`);
  }

  let signupCountryBreakdown: Record<string, number> | null = null;
  if (countryRes.error) {
    if (countryRes.error.code === "42703") {
      signupCountryBreakdown = null;
    } else {
      errors.push(`profiles.signup_country: ${countryRes.error.message}`);
    }
  } else {
    const breakdown: Record<string, number> = {};
    for (const row of countryRes.data ?? []) {
      const key = (row as { signup_country: string | null }).signup_country?.trim() || "unknown";
      breakdown[key] = (breakdown[key] ?? 0) + 1;
    }
    signupCountryBreakdown = breakdown;
  }

  const globalStoryCount = (globalStatsRes.data ?? []).reduce(
    (sum, row) => sum + (row.story_count ?? 0),
    0
  );

  if (errors.length > 0) {
    return NextResponse.json({ error: "Failed to load stats", details: errors }, { status: 500 });
  }

  return NextResponse.json({
    generatedAt: now.toISOString(),
    profiles: {
      total: totalProfilesRes.count ?? 0,
      last24Hours: profiles24hRes.count ?? 0,
      last7Days: profiles7dRes.count ?? 0,
    },
    premiumSubscribers: premiumRes.count ?? 0,
    storiesGeneratedLast24Hours: globalStoryCount,
    storiesSavedLast24Hours: stories24hRes.count ?? 0,
    signupCountryBreakdown,
    notes: {
      storiesGeneratedLast24Hours:
        "Sum of global_daily_stats.story_count for calendar days touched in the last 24h (all generations that passed the global cap, including guests).",
      storiesSavedLast24Hours:
        "Rows in stories table created in the last 24h (persisted library stories only).",
      signupCountryBreakdown:
        signupCountryBreakdown === null
          ? "signup_country column not present — run migration 020_ethiopia_free_tier.sql"
          : null,
    },
  });
}
