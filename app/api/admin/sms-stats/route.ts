import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === expected) {
    return true;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  return querySecret === expected;
}

export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return unauthorized();
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase admin client not configured" },
      { status: 503 }
    );
  }

  const cap = parseInt(process.env.DAILY_SMS_CAP ?? "50", 10);
  const today = new Date().toISOString().slice(0, 10);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const { data: history, error } = await admin
    .from("global_sms_stats")
    .select("date, sms_sent_count")
    .gte("date", fromDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("[admin/sms-stats]", error);
    return NextResponse.json({ error: "Failed to load SMS stats" }, { status: 500 });
  }

  const todayRow = history?.find((r) => r.date === today);
  const todayCount = todayRow?.sms_sent_count ?? 0;

  return NextResponse.json({
    dailyCap: Number.isNaN(cap) ? 50 : cap,
    today: {
      date: today,
      sms_sent_count: todayCount,
      remaining: Math.max(0, (Number.isNaN(cap) ? 50 : cap) - todayCount),
      capReached: todayCount >= (Number.isNaN(cap) ? 50 : cap),
    },
    last30Days: history ?? [],
  });
}
