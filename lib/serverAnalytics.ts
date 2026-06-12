import type { SupabaseClient } from "@supabase/supabase-js";
import { getCountryFromRequest } from "@/lib/geo";
import type { AnalyticsEventName } from "@/lib/analyticsEvents";

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) return "mobile";
  return "desktop";
}

export async function insertAnalyticsEvent(
  admin: SupabaseClient,
  params: {
    eventName: AnalyticsEventName;
    request?: Request;
    sessionId?: string | null;
    userId?: string | null;
    properties?: Record<string, unknown>;
  }
): Promise<void> {
  const userAgent = params.request?.headers.get("user-agent") ?? null;
  const country = params.request ? getCountryFromRequest(params.request) : null;

  const { error } = await admin.from("analytics_events").insert({
    event_name: params.eventName,
    session_id: params.sessionId ?? null,
    user_id: params.userId ?? null,
    properties: params.properties ?? {},
    device_type: detectDeviceType(userAgent),
    country,
  });

  if (error) {
    console.warn("[analytics] insert failed", params.eventName, error.message);
  }
}
