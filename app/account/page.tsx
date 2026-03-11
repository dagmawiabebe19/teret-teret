"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProgress } from "@/types";
import { getT } from "@/lib/constants";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"free" | "premium" | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [lang] = useState<"am" | "en" | "es">("en");
  const t = getT(lang);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { stripeEnabled: false }))
      .then((d) => setStripeEnabled(d.stripeEnabled ?? false))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    const params = typeof window !== "undefined" ? Object.fromEntries(new URLSearchParams(window.location.search)) : {};
    setSearchParams(params);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.from("profiles").select("subscription_status").eq("id", user.id).single().then(({ data }) => {
      setStatus((data?.subscription_status === "premium" || data?.subscription_status === "active") ? "premium" : "free");
    });
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { progress: null }))
      .then((d) => setProgress(d.progress ?? null))
      .catch(() => setProgress(null));
  }, [user?.id]);

  useEffect(() => {
    if (searchParams.success === "1") setMessage("Subscription active. You have unlimited stories!");
    if (searchParams.cancel === "1") setMessage("Checkout cancelled.");
    if (searchParams.signin === "1") setMessage("Sign in to subscribe.");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Auth not configured.");
      return;
    }
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Check your email to confirm sign up.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Signed in.");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStatus(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d2b]">
        <p className="text-[#c9b8e8]">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 text-[#e8e0ff]"
      style={{
        background: "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 50%,#2d1b69 100%)",
        fontFamily: "'Nunito',sans-serif",
      }}
    >
      <div className="max-w-md mx-auto pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 mb-8 text-[#c9b8e8] font-bold text-sm hover:text-[#FFD700] transition-colors duration-200"
        >
          ← Back to Teret Teret
        </Link>

        <h1 className="font-fredoka text-[28px] text-[#FFD700] mb-1" style={{ textShadow: "0 2px 12px rgba(255,215,0,0.2)" }}>
          Account
        </h1>
        <p className="text-[13px] text-[rgba(200,180,255,0.65)] mb-6">
          Sign in to sync stories and manage your subscription
        </p>

        {message && (
          <p className="mb-4 p-3 rounded-xl bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] text-sm">
            {message}
          </p>
        )}

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-[#c9b8e8]">{user.email}</p>
            {progress != null && (
              <div className="p-4 rounded-xl border border-[rgba(255,215,0,0.2)] bg-[rgba(255,255,255,0.05)]">
                <p className="text-sm font-bold text-[#FFD700]">{t.levelLabel}: {progress.levelName}</p>
                {progress.streakCount > 0 && (
                  <p className="text-sm text-[#c9b8e8] mt-1">🔥 {t.streakDays(progress.streakCount)}</p>
                )}
                {progress.xpToNextLevel > 0 && (
                  <p className="text-xs text-[rgba(200,180,255,0.7)] mt-1">{t.xpToNext(progress.xpToNextLevel)}</p>
                )}
                <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#c44dff,#FFD700)] transition-[width] duration-300"
                    style={{
                      width: progress.xpToNextLevel > 0
                        ? `${Math.min(100, (progress.xp / (progress.xp + progress.xpToNextLevel)) * 100)}%`
                        : "100%",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl border border-[rgba(255,215,0,0.2)] bg-[rgba(255,255,255,0.05)]">
              <p className="text-sm font-bold text-[#FFD700]">Subscription</p>
              <p className="text-lg font-fredoka">
                {status === "premium" ? "Premium" : "Free"}
              </p>
              {stripeEnabled && status === "premium" && (
                <a
                  href="/api/stripe/portal"
                  className="inline-block mt-2 text-sm text-[#c44dff] hover:underline"
                >
                  Manage subscription →
                </a>
              )}
              {stripeEnabled && status !== "premium" && (
                <a
                  href="/api/stripe/checkout"
                  className="inline-block mt-2 px-4 py-2 rounded-xl text-sm font-bold bg-[linear-gradient(135deg,#FF8C00,#FFD700)] text-[#1a1a4e]"
                >
                  Subscribe — $4.99/month
                </a>
              )}
              {!stripeEnabled && status !== "premium" && (
                <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">Subscription coming soon</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 rounded-xl border border-[rgba(255,255,255,0.2)] text-sm font-bold text-[#c9b8e8] hover:bg-[rgba(255,255,255,0.05)]"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#FFD700] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#FFD700] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-[linear-gradient(135deg,#7b2d8b,#c44dff)] text-white"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm text-[#c9b8e8] hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Create an account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-[rgba(255,255,255,0.4)]">
          You can use the app as a guest; stories are saved in this browser. Sign in to sync across devices and subscribe for unlimited stories.
        </p>
      </div>
    </div>
  );
}
