import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({
      userId: null,
      subscriptionStatus: null,
      usageCount: null,
      billingPeriodEnd: null,
      isGuest: true,
    });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({
      userId: user.id,
      subscriptionStatus: null,
      usageCount: null,
      billingPeriodEnd: null,
      error: "Supabase not configured",
    });
  }
  const [profileRes, usageRes] = await Promise.all([
    supabase.from("profiles").select("subscription_status").eq("id", user.id).single(),
    supabase.from("usage_tracking").select("generation_count, billing_period_end").eq("user_id", user.id).single(),
  ]);
  return NextResponse.json({
    userId: user.id,
    subscriptionStatus: profileRes.data?.subscription_status ?? null,
    usageCount: usageRes.data?.generation_count ?? null,
    billingPeriodEnd: usageRes.data?.billing_period_end ?? null,
    isGuest: false,
  });
}
