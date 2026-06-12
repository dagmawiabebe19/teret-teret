"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProgress } from "@/types";
import type { UITranslations } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import { startStripeCheckout } from "@/lib/stripeCheckout";
import {
  trackPremiumConversion,
  trackSignupComplete,
  trackSignupCompletedFromPrompt,
  trackSignupStarted,
} from "@/lib/analytics";

function markSignupFromPromptIfNeeded() {
  try {
    if (sessionStorage.getItem("signup_from_prompt") === "1") {
      trackSignupCompletedFromPrompt();
      sessionStorage.removeItem("signup_from_prompt");
    }
  } catch {
    // ignore
  }
}

function formatBillingDate(iso: string, lang: "am" | "en" | "es"): string {
  try {
    const locale = lang === "am" ? "am-ET" : lang === "es" ? "es" : "en-US";
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getFriendlyAuthError(
  error: { message?: string; status?: number; code?: string },
  t: UITranslations
): string {
  const msg = (error?.message ?? "").toLowerCase();
  const code = (error?.code ?? "").toLowerCase();
  if (msg.includes("invalid login") || msg.includes("invalid_credentials")) {
    return t.authErrorInvalidLogin;
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("6"))) {
    return t.authErrorWeakPassword;
  }
  if (msg.includes("already registered") || msg.includes("user already exists")) {
    return t.authErrorDuplicate;
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed") || msg.includes("confirm your email")) {
    return t.authErrorEmailNotConfirmed;
  }
  return t.authErrorGeneric;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"free" | "premium" | null>(null);
  const [isEthiopiaFree, setIsEthiopiaFree] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [lang] = useState<"am" | "en" | "es">(() => {
    if (typeof window === "undefined") return "en";
    const s = localStorage.getItem("teret_lang");
    return s === "am" || s === "en" || s === "es" ? s : "en";
  });
  const { t } = useTranslation(lang);

  const authConfigured = isAuthConfigured();

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { stripeEnabled: false }))
      .then((d) => setStripeEnabled(d.stripeEnabled ?? false))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    const params = typeof window !== "undefined" ? Object.fromEntries(new URLSearchParams(window.location.search)) : {};
    setSearchParams(params);
    if (params.mode === "signup" || params.signup === "1") {
      setIsSignUp(true);
    } else if (params.mode === "signin" || params.signin === "1") {
      setIsSignUp(false);
    } else if (!params.mode && !params.signin && !params.signup) {
      setIsSignUp(true);
    }
    if (params.from === "prompt") {
      try {
        sessionStorage.setItem("signup_from_prompt", "1");
      } catch {
        // ignore
      }
    }
    if (params.mode === "signup" || params.signup === "1" || params.from === "prompt") {
      trackSignupStarted(params.from === "prompt" ? "post_story_prompt" : "account_page");
    }
  }, []);

  useEffect(() => {
    if (!authConfigured) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      if (u) markSignupFromPromptIfNeeded();
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) markSignupFromPromptIfNeeded();
    });
    return () => subscription.unsubscribe();
  }, [authConfigured]);

  const refreshProfileRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false));
  const refreshProfile = useCallback(() => {
    if (!user?.id) return Promise.resolve(false);
    return fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { progress: null, subscriptionStatus: null }))
      .then((d) => {
        setProgress(d.progress ?? null);
        const sub = d.subscriptionStatus ?? null;
        const isPremium = sub === "premium" || sub === "active";
        const ethiopiaFree = d.isEthiopiaFree === true;
        setStatus(isPremium ? "premium" : "free");
        setIsEthiopiaFree(ethiopiaFree);
        setNextBillingDate(d.nextBillingDate ?? null);
        return isPremium;
      })
      .catch(() => {
        setProgress(null);
        return false;
      });
  }, [user?.id]);
  refreshProfileRef.current = refreshProfile;

  useEffect(() => {
    if (!user?.id) return;
    refreshProfile();
  }, [user?.id, refreshProfile]);

  useEffect(() => {
    if (searchParams.cancel === "1") {
      setMessage(t.checkoutCancelled);
      setMessageType("info");
    }
    if (searchParams.signin === "1") {
      setMessage(t.signInToSubscribe);
      setMessageType("info");
    }
    if (searchParams.error === "no_subscription") {
      setMessage(t.noSubscriptionFound);
      setMessageType("info");
    }
    if (searchParams.error === "auth") {
      const detail = searchParams.error_message?.trim();
      setMessage(detail || t.authErrorGeneric);
      setMessageType("error");
      if (detail) {
        console.error("[account] Auth callback error:", detail);
      }
    }
  }, [searchParams, t]);

  useEffect(() => {
    const checkoutComplete =
      searchParams.upgraded === "true" || searchParams.success === "1";
    if (!checkoutComplete || !user?.id) return;
    setMessage(t.subscriptionSuccessMessage);
    setMessageType("success");
    let intervalId: ReturnType<typeof setInterval> | null = null;
    refreshProfile().then((isPremium) => {
      if (isPremium) {
        trackPremiumConversion();
        return;
      }
      setMessage(t.premiumActivating);
      let attempts = 0;
      const maxAttempts = 5;
      intervalId = setInterval(() => {
        attempts += 1;
        refreshProfileRef.current().then((premium) => {
          if (premium) {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
            trackPremiumConversion();
            setMessage(t.subscriptionSuccessMessage);
            setMessageType("success");
          } else if (attempts >= maxAttempts && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        });
      }, 2000);
    });
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searchParams.upgraded, searchParams.success, user?.id, t, refreshProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("info");
    const supabase = createClient();
    if (!supabase) {
      setMessage(t.authErrorGeneric);
      setMessageType("error");
      return;
    }
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setAuthLoading(false);
      if (error) {
        setMessage(getFriendlyAuthError(error, t));
        setMessageType("error");
      } else {
        trackSignupComplete();
        markSignupFromPromptIfNeeded();
        setMessage(t.signUpSuccess);
        setMessageType("success");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setAuthLoading(false);
      if (error) {
        setMessage(getFriendlyAuthError(error, t));
        setMessageType("error");
      } else {
        const returnTo = searchParams.returnTo;
        if (returnTo) {
          try {
            const path = decodeURIComponent(returnTo);
            if (path.startsWith("/") && !path.startsWith("//")) {
              window.location.href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
              return;
            }
          } catch {
            // fall through to success message
          }
        }
        setMessage(t.signInSuccess);
        setMessageType("success");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage(t.authErrorInvalidLogin);
      setMessageType("error");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setMessage(t.authErrorGeneric);
      setMessageType("error");
      return;
    }
    setMessage("");
    setForgotPasswordLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/account`,
    });
    setForgotPasswordLoading(false);
    if (error) {
      setMessage(getFriendlyAuthError(error, t));
      setMessageType("error");
    } else {
      setMessage(t.forgotPasswordSent);
      setMessageType("success");
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) {
      setMessage(t.authErrorGeneric);
      setMessageType("error");
      return;
    }
    setMessage("");
    setGoogleLoading(true);
    if (isSignUp || searchParams.from === "prompt") {
      trackSignupStarted(searchParams.from === "prompt" ? "post_story_prompt" : "google_oauth");
      try {
        sessionStorage.setItem("signup_from_prompt", "1");
      } catch {
        // ignore
      }
    }
    try {
      let next = "/account";
      if (typeof window !== "undefined" && searchParams.returnTo) {
        try {
          const path = decodeURIComponent(searchParams.returnTo);
          if (path.startsWith("/") && !path.startsWith("//")) {
            next = path;
          }
        } catch {
          // use default
        }
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setMessage(getFriendlyAuthError(error, t));
        setMessageType("error");
        setGoogleLoading(false);
      }
    } catch {
      setMessage(t.authErrorGeneric);
      setMessageType("error");
      setGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStatus(null);
    setProgress(null);
    setSignOutLoading(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0d0d2b]"
        style={{ fontFamily: "'Nunito',sans-serif" }}
      >
        <p className="text-[#c9b8e8]">{t.authLoading}</p>
      </div>
    );
  }

  const messageStyles =
    messageType === "error"
      ? "bg-[rgba(255,120,120,0.12)] border-[rgba(255,150,150,0.35)] text-[#f0b0b0]"
      : messageType === "success"
        ? "bg-[rgba(100,220,140,0.12)] border-[rgba(100,220,140,0.35)] text-[#a0e0b0]"
        : "bg-[rgba(255,215,0,0.1)] border-[rgba(255,215,0,0.3)] text-[#e8e0ff]";

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
          href={
            searchParams.returnTo
              ? (() => {
                  try {
                    const path = decodeURIComponent(searchParams.returnTo);
                    if (path.startsWith("/") && !path.startsWith("//")) return path;
                  } catch {}
                  return "/";
                })()
              : "/"
          }
          className="inline-flex items-center gap-1 mb-8 text-[#c9b8e8] font-bold text-sm hover:text-[#FFD700] transition-colors duration-200"
        >
          {t.backToApp}
        </Link>

        <h1 className="font-fredoka text-[28px] text-[#FFD700] mb-1" style={{ textShadow: "0 2px 12px rgba(255,215,0,0.2)" }}>
          {t.accountTitle}
        </h1>
        <p className="text-[13px] text-[rgba(200,180,255,0.65)] mb-3">
          {t.accountSubtitle}
        </p>
        <ul className="mb-6 space-y-1.5 text-[12px] text-[rgba(200,180,255,0.75)]" style={{ listStyle: "none", paddingLeft: 0 }}>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700]" aria-hidden>✓</span>
            {t.accountBenefit1}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700]" aria-hidden>✓</span>
            {t.accountBenefit2}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700]" aria-hidden>✓</span>
            {t.accountBenefit3}
          </li>
        </ul>

        {message && (
          <div
            className={`mb-4 p-4 rounded-xl border text-sm ${messageStyles} ${messageType === "success" ? "shadow-[0_4px_20px_rgba(100,220,140,0.15)]" : ""}`}
            role="alert"
          >
            {searchParams.success === "1" && messageType === "success" && (
              <span className="text-[20px] mr-2" aria-hidden>✨</span>
            )}
            {message}
          </div>
        )}

        {!authConfigured ? (
          <div
            className="p-5 rounded-xl border border-[rgba(255,215,0,0.2)] bg-[rgba(255,255,255,0.05)]"
            style={{ fontFamily: "'Nunito',sans-serif" }}
          >
            <p className="text-[#FFD700] font-bold text-base mb-2">
              {t.authNotConfiguredTitle}
            </p>
            <p className="text-[13px] text-[rgba(200,180,255,0.8)] leading-relaxed">
              {t.authNotConfiguredSub}
            </p>
          </div>
        ) : user ? (
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
            <div
              className="p-5 rounded-[14px] border"
              style={{
                background:
                  status === "premium"
                    ? "linear-gradient(135deg,rgba(255,140,0,0.12),rgba(255,215,0,0.08))"
                    : "rgba(255,255,255,0.05)",
                borderColor:
                  status === "premium"
                    ? "rgba(255,215,0,0.45)"
                    : "rgba(255,215,0,0.2)",
                boxShadow:
                  status === "premium"
                    ? "0 4px 24px rgba(255,215,0,0.12)"
                    : undefined,
              }}
            >
              <p className="text-[11px] font-bold text-[rgba(200,180,255,0.5)] uppercase tracking-wide mb-2">
                {t.subscriptionLabel}
              </p>
              {isEthiopiaFree ? (
                <>
                  <span
                    className="inline-block px-3.5 py-1 rounded-full text-[12px] font-black tracking-wide"
                    style={{
                      background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                      color: "#1a1a4e",
                      boxShadow: "0 2px 12px rgba(255,215,0,0.35)",
                    }}
                  >
                    {t.ethiopiaFreeBadge}
                  </span>
                  <p className="text-sm text-[#c9b8e8] mt-3">{t.ethiopiaFreePlanLabel}</p>
                  <p className="text-[12px] text-[rgba(200,180,255,0.65)] mt-2">
                    {t.unlimitedStories} {t.unlimitedStoriesLabel}
                  </p>
                </>
              ) : status === "premium" ? (
                <>
                  <span
                    className="inline-block px-3.5 py-1 rounded-full text-[12px] font-black tracking-wide"
                    style={{
                      background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                      color: "#1a1a4e",
                      boxShadow: "0 2px 12px rgba(255,215,0,0.35)",
                    }}
                  >
                    {t.premiumBadgeShort}
                  </span>
                  <p className="text-sm text-[#c9b8e8] mt-3">
                    {t.planPremium} · {t.unlimitedStories} {t.unlimitedStoriesLabel}
                  </p>
                  {nextBillingDate && (
                    <p className="text-sm text-[#c9b8e8] mt-1">
                      {t.nextBilling}: {formatBillingDate(nextBillingDate, lang)}
                    </p>
                  )}
                  {stripeEnabled && (
                    <a
                      href="/api/stripe/portal"
                      className="inline-block mt-3 w-full text-center py-2.5 rounded-xl text-sm font-bold border text-[#FFD700] hover:bg-[rgba(255,215,0,0.08)] transition-colors"
                      style={{ borderColor: "rgba(255,215,0,0.3)" }}
                    >
                      {t.manageSubscription}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-fredoka text-[#c9b8e8]">{t.planFree}</p>
                  <p className="text-[12px] text-[rgba(200,180,255,0.65)] mt-1 mb-3">
                    {t.freeAccountLabel} · {t.upgradeUnlockFeatures}
                  </p>
                  {stripeEnabled ? (
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={async () => {
                        setCheckoutLoading(true);
                        const result = await startStripeCheckout("/account");
                        if (!result.ok && result.error) {
                          setMessage(result.error);
                          setMessageType("error");
                        }
                        setCheckoutLoading(false);
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-black bg-[linear-gradient(135deg,#FF8C00,#FFD700)] text-[#1a1a4e] disabled:opacity-70"
                    >
                      {checkoutLoading ? "…" : `${t.upgradeToPremium} — ${t.pricePerMonth}`}
                    </button>
                  ) : (
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">{t.subscriptionComingSoon}</p>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="w-full py-2 rounded-xl border border-[rgba(255,255,255,0.2)] text-sm font-bold text-[#c9b8e8] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-70"
            >
              {signOutLoading ? t.authLoading : t.signOut}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || authLoading}
              className="w-full py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] text-[#e8e0ff] hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                t.authLoading
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t.continueWithGoogle}
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-[rgba(200,180,255,0.5)]">{t.orSignInWithEmail}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#FFD700] mb-1">
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authLoading}
                className="w-full px-4 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#FFD700] mb-1">
                {t.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={authLoading}
                className="w-full px-4 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white outline-none disabled:opacity-70"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl font-bold bg-[linear-gradient(135deg,#7b2d8b,#c44dff)] text-white disabled:opacity-70"
            >
              {authLoading ? t.authLoading : isSignUp ? t.signUpBtn : t.signInBtn}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm text-[#c9b8e8] hover:underline disabled:opacity-70"
              disabled={authLoading}
            >
              {isSignUp ? t.alreadyHaveAccount : t.createAccount}
            </button>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading || authLoading}
                className="w-full text-sm text-[#c9b8e8] hover:underline disabled:opacity-70 mt-1"
              >
                {forgotPasswordLoading ? t.authLoading : t.forgotPasswordBtn}
              </button>
            )}
          </form>
          </div>
        )}

        <p className="mt-6 text-xs text-[rgba(255,255,255,0.4)]">
          {t.accountGuestNote}
        </p>
      </div>
    </div>
  );
}
