export type AnalyticsEvent =
  | "story_generated"
  | "story_saved"
  | "paywall_shown"
  | "subscription_started"
  | "story_opened"
  | "story_copied";

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  try {
    if (typeof (window as unknown as { gtag?: (a: string, b: string, c: Record<string, unknown>) => void }).gtag === "function") {
      (window as unknown as { gtag: (a: string, b: string, c: Record<string, unknown>) => void }).gtag("event", event, props ?? {});
    }
  } catch {
    // no-op
  }
}
