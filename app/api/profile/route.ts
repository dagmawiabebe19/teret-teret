import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/supabase/server";
import { buildUserProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ user: null, progress: null }, { status: 200 });
  }
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  if (!supabase) {
    return NextResponse.json({ user: { id: user.id, email: user.email ?? null }, progress: null }, { status: 200 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, streak_count, last_daily_teret_viewed_at, completed_daily_teret_dates, xp")
    .eq("id", user.id)
    .single();

  const progress = profile
    ? buildUserProgress(
        profile.streak_count ?? 0,
        profile.last_daily_teret_viewed_at ?? null,
        (profile.completed_daily_teret_dates as string[]) ?? [],
        profile.xp ?? 0
      )
    : null;

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? null },
    subscriptionStatus: profile?.subscription_status ?? "free",
    progress,
  });
}
