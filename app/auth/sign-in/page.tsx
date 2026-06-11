"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import { PhoneAuthShell, NalaDateLogo } from "@/components/auth/PhoneAuthShell";
import {
  DEFAULT_COUNTRY,
  PHONE_COUNTRIES,
  stripPhoneInput,
  toE164,
  validateNationalNumber,
  type CountryCode,
} from "@/lib/phoneCountries";
import {
  trackPhoneOtpSent,
  trackPhoneRateLimited,
  trackPhoneSignupFailed,
  trackPhoneSignupStarted,
} from "@/lib/analytics";

import { PHONE_SESSION_KEY } from "@/lib/phoneAuthConstants";

export default function PhoneSignInPage() {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [national, setNational] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const digits = stripPhoneInput(national);
  const isValid = validateNationalNumber(country, digits);
  const e164 = isValid ? toE164(country, digits) : "";

  const handleSendCode = async () => {
    if (!isValid) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    trackPhoneSignupStarted();

    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164 }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.code) trackPhoneRateLimited(data.code);
        trackPhoneSignupFailed(data.code ?? "send_failed");
        setError(data.error ?? "Couldn't send code. Please try again or use Google sign-in.");
        setLoading(false);
        return;
      }

      trackPhoneOtpSent();
      sessionStorage.setItem(PHONE_SESSION_KEY, e164);
      router.push("/auth/verify");
    } catch {
      trackPhoneSignupFailed("network");
      setError("Connection issue. Please check your internet and try again.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    if (!supabase) {
      setError("Sign-in is not configured.");
      return;
    }
    setGoogleLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/discover")}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setError("Could not start Google sign-in.");
      setGoogleLoading(false);
    }
  };

  if (!isAuthConfigured()) {
    return (
      <PhoneAuthShell>
        <NalaDateLogo />
        <p className="text-center text-[#c9a0b0]">Sign-in is not configured yet.</p>
      </PhoneAuthShell>
    );
  }

  return (
    <PhoneAuthShell>
      <NalaDateLogo />

      <h2 className="text-xl font-bold text-white text-center mb-1">Welcome to NalaDate</h2>
      <p className="text-center text-[#c9a0b0] mb-8 text-sm">Enter your phone number to continue</p>

      <div className="space-y-4 flex-1">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="country-code">
            Country code
          </label>
          <select
            id="country-code"
            value={country.dial}
            onChange={(e) => {
              const next = PHONE_COUNTRIES.find((c) => c.dial === e.target.value);
              if (next) setCountry(next);
            }}
            className="h-16 px-2 rounded-xl border border-[rgba(212,175,55,0.35)] bg-[rgba(255,255,255,0.08)] text-white text-base outline-none focus:border-[#D4AF37] min-w-[7.5rem]"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.dial} value={c.dial} className="bg-[#2d0f1f]">
                {c.flag} {c.dial}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="phone-national">
            Phone number
          </label>
          <input
            id="phone-national"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={country.dial === "+251" ? "9XX XXX XXX" : "Phone number"}
            value={national}
            onChange={(e) => {
              setNational(e.target.value);
              setError("");
            }}
            className="flex-1 h-16 px-4 rounded-xl border border-[rgba(212,175,55,0.35)] bg-[rgba(255,255,255,0.08)] text-white text-lg outline-none focus:border-[#D4AF37] placeholder:text-[rgba(255,255,255,0.35)]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-300 text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSendCode}
          disabled={!isValid || loading}
          className="w-full h-16 rounded-xl font-bold text-lg text-[#1a0a12] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ background: "linear-gradient(135deg, #E8C547, #D4AF37)" }}
        >
          {loading ? "Sending…" : "Send code"}
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full h-14 rounded-xl font-semibold border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] text-white flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {googleLoading ? (
            "Connecting…"
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Or sign in with Google
            </>
          )}
        </button>

        <p className="text-center">
          <Link href="/account" className="text-sm text-[#D4AF37] hover:underline">
            Sign in with email
          </Link>
        </p>
      </div>

      <p className="text-[10px] text-center text-[rgba(255,255,255,0.35)] mt-8 leading-relaxed">
        By continuing you agree to our{" "}
        <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>
      </p>
    </PhoneAuthShell>
  );
}
