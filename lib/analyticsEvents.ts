/** Canonical funnel event names stored in Supabase analytics_events. */
export const ANALYTICS_EVENTS = {
  HOMEPAGE_VIEW: "homepage_view",
  CTA_CLICK: "cta_click",
  STORY_STARTED: "story_started",
  STORY_GENERATED: "story_generated",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

const ALLOWED = new Set<string>(Object.values(ANALYTICS_EVENTS));

export function isAllowedAnalyticsEvent(name: string): name is AnalyticsEventName {
  return ALLOWED.has(name);
}
