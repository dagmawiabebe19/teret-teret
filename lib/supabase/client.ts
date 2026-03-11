"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Required for auth to be available. Must be set in env (e.g. .env.local / Vercel). */
const AUTH_ENV = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

/**
 * Returns true only when Supabase auth can be used (both public env vars set).
 * Use to show sign-in/sign-up form only when auth is configured; otherwise show a friendly fallback.
 */
export function isAuthConfigured(): boolean {
  return !!(AUTH_ENV.url && AUTH_ENV.anon);
}

export function createClient() {
  if (!AUTH_ENV.url || !AUTH_ENV.anon) return null;
  return createBrowserClient(AUTH_ENV.url, AUTH_ENV.anon);
}
