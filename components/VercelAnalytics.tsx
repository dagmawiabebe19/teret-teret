"use client";

import { Analytics } from "@vercel/analytics/next";

/** Client wrapper so Web Analytics initializes on every route in the App Router. */
export function VercelAnalytics() {
  return <Analytics />;
}
