"use client";

import { track } from "@vercel/analytics";

type AnalyticsProps = Record<string, string | number | boolean | null>;

export function trackGenerateStoryCta(source: string) {
  track("generate_story_cta_click", { source });
}

export function trackFirstStoryComplete() {
  track("first_story_complete");
}

export function trackSignupComplete() {
  track("signup_complete");
}

export function trackSignupPromptShown() {
  track("signup_prompt_shown");
}

export function trackSignupPromptClickedGoogle() {
  track("signup_prompt_clicked_google");
}

export function trackSignupPromptDismissed() {
  track("signup_prompt_dismissed");
}

export function trackSignupCompletedFromPrompt() {
  track("signup_completed_from_prompt");
}

export function trackPremiumUpgradeClick(source: string) {
  track("premium_upgrade_click", { source });
}

export function trackPremiumConversion() {
  track("premium_conversion");
}

export function trackPageView(name: string, props?: AnalyticsProps) {
  track(name, props);
}
