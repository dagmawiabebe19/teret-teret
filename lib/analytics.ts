"use client";

import { track } from "@vercel/analytics";
import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analyticsEvents";
import { getOrCreateSessionId } from "@/lib/sessionId";

type AnalyticsProps = Record<string, string | number | boolean | null>;

function trackBoth(eventName: AnalyticsEventName, vercelName: string, props?: AnalyticsProps) {
  track(vercelName, props);
  const sessionId = getOrCreateSessionId();
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: eventName,
      session_id: sessionId || undefined,
      properties: props ?? {},
    }),
    keepalive: true,
  }).catch(() => {});
}

export function trackHomepageView() {
  trackBoth(ANALYTICS_EVENTS.HOMEPAGE_VIEW, "homepage_view");
}

export function trackGenerateStoryCta(source: string) {
  trackBoth(ANALYTICS_EVENTS.CTA_CLICK, "generate_story_cta_click", { source });
}

export function trackStoryStarted() {
  trackBoth(ANALYTICS_EVENTS.STORY_STARTED, "story_started");
}

export function trackStoryGenerated() {
  trackBoth(ANALYTICS_EVENTS.STORY_GENERATED, "story_generated");
}

/** @deprecated Use trackStoryGenerated — kept for Vercel dashboard continuity */
export function trackFirstStoryComplete() {
  trackStoryGenerated();
}

export function trackSignupStarted(source: string) {
  trackBoth(ANALYTICS_EVENTS.SIGNUP_STARTED, "signup_started", { source });
}

export function trackSignupComplete() {
  trackBoth(ANALYTICS_EVENTS.SIGNUP_COMPLETED, "signup_complete");
}

export function trackSignupPromptShown() {
  track("signup_prompt_shown");
  trackBoth(ANALYTICS_EVENTS.SIGNUP_STARTED, "signup_prompt_shown", { source: "post_story_prompt" });
}

export function trackSignupPromptClickedGoogle() {
  track("signup_prompt_clicked_google");
  trackBoth(ANALYTICS_EVENTS.SIGNUP_STARTED, "signup_prompt_clicked_google", { source: "post_story_prompt" });
}

export function trackSignupPromptDismissed() {
  track("signup_prompt_dismissed");
}

export function trackSignupCompletedFromPrompt() {
  trackBoth(ANALYTICS_EVENTS.SIGNUP_COMPLETED, "signup_completed_from_prompt", { source: "post_story_prompt" });
}

export function trackCheckoutStarted(source: string) {
  trackBoth(ANALYTICS_EVENTS.CHECKOUT_STARTED, "checkout_started", { source });
}

export function trackPremiumUpgradeClick(source: string) {
  track("premium_upgrade_click", { source });
  trackCheckoutStarted(source);
}

export function trackPremiumConversion() {
  trackBoth(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, "premium_conversion");
}

export function trackPageView(name: string, props?: AnalyticsProps) {
  track(name, props);
}
