import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedAnalyticsEvent } from "@/lib/analyticsEvents";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertAnalyticsEvent } from "@/lib/serverAnalytics";
import { getOptionalUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  event_name: z.string().min(1).max(64),
  session_id: z.string().max(128).optional().nullable(),
  properties: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success || !isAllowedAnalyticsEvent(parsed.data.event_name)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { user } = await getOptionalUser();

  await insertAnalyticsEvent(admin, {
    eventName: parsed.data.event_name,
    request,
    sessionId: parsed.data.session_id ?? null,
    userId: user?.id ?? null,
    properties: parsed.data.properties ?? {},
  });

  return NextResponse.json({ ok: true, stored: true });
}
