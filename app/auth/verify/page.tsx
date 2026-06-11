"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OtpInput } from "@/components/auth/OtpInput";
import { PhoneAuthShell, NalaDateLogo } from "@/components/auth/PhoneAuthShell";
import { maskPhoneE164 } from "@/lib/phoneCountries";
import {
  trackPhoneOtpVerified,
  trackPhoneRateLimited,
  trackPhoneSignupComplete,
  trackPhoneSignupFailed,
} from "@/lib/analytics";

import { PHONE_SESSION_KEY } from "@/lib/phoneAuthConstants";
const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_SESSION_KEY);
    if (!stored) {
      router.replace("/auth/sign-in");
      return;
    }
    setPhone(stored);
  }, [router]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const verify = useCallback(
    async (otp: string) => {
      if (!phone || otp.length !== 6) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/phone/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code: otp }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429 && data.code) trackPhoneRateLimited(data.code);
          trackPhoneSignupFailed(data.code ?? "verify_failed");
          setError(data.error ?? "Code is incorrect or expired. Try again or resend.");
          setCode("");
          setLoading(false);
          return;
        }

        trackPhoneOtpVerified();
        if (data.isNewUser) trackPhoneSignupComplete();
        sessionStorage.removeItem(PHONE_SESSION_KEY);
        router.replace(data.isNewUser ? "/onboarding" : "/discover");
      } catch {
        trackPhoneSignupFailed("network");
        setError("Connection issue. Please check your internet and try again.");
        setCode("");
        setLoading(false);
      }
    },
    [phone, router]
  );

  const handleResend = async () => {
    if (resendSeconds > 0 || !phone) return;
    setResendLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/phone/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.code) trackPhoneRateLimited(data.code);
        setError(data.error ?? "Could not resend code.");
        setResendLoading(false);
        return;
      }

      setResendSeconds(RESEND_COOLDOWN);
      setCode("");
    } catch {
      setError("Connection issue. Please try again.");
    }
    setResendLoading(false);
  };

  if (!phone) {
    return (
      <PhoneAuthShell>
        <p className="text-center text-[#c9a0b0]">Loading…</p>
      </PhoneAuthShell>
    );
  }

  return (
    <PhoneAuthShell>
      <Link
        href="/auth/sign-in"
        className="text-sm text-[#D4AF37] mb-6 inline-block hover:underline"
      >
        ← Change number
      </Link>

      <NalaDateLogo />

      <h2 className="text-lg font-bold text-white text-center mb-2">Enter your code</h2>
      <p className="text-center text-[#c9a0b0] text-sm mb-8">
        Enter the code we sent to {maskPhoneE164(phone)}
      </p>

      <div className="space-y-6">
        <OtpInput
          value={code}
          onChange={setCode}
          disabled={loading}
          onComplete={(otp) => verify(otp)}
        />

        {error && (
          <p className="text-sm text-red-300 text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => verify(code)}
          disabled={code.length !== 6 || loading}
          className="w-full h-16 rounded-xl font-bold text-lg text-[#1a0a12] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #E8C547, #D4AF37)" }}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        <p className="text-center text-sm text-[#c9a0b0]">
          {resendSeconds > 0 ? (
            <>Didn&apos;t get the code? Resend in {resendSeconds}s</>
          ) : (
            <>
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-[#D4AF37] font-semibold hover:underline disabled:opacity-50"
              >
                Resend
              </button>
            </>
          )}
        </p>
      </div>
    </PhoneAuthShell>
  );
}
