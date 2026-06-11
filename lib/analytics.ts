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

export function trackPremiumUpgradeClick(source: string) {
  track("premium_upgrade_click", { source });
}

export function trackPremiumConversion() {
  track("premium_conversion");
}

export function trackPageView(name: string, props?: AnalyticsProps) {
  track(name, props);
}

export function trackPhoneSignupStarted() {
  track("phone_signup_started");
}

export function trackPhoneOtpSent() {
  track("phone_otp_sent");
}

export function trackPhoneOtpVerified() {
  track("phone_otp_verified");
}

export function trackPhoneSignupComplete() {
  track("phone_signup_complete");
}

export function trackPhoneSignupFailed(reason: string) {
  track("phone_signup_failed", { reason });
}

export function trackPhoneRateLimited(code: string) {
  track("phone_rate_limited", { code });
}
