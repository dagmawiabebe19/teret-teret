"use client";

import { useState } from "react";
import { getT } from "@/lib/constants";
import type { Lang } from "@/types";

interface PaywallModalProps {
  onClose: () => void;
  lang: Lang;
  onSubscribe?: () => void;
  stripeEnabled?: boolean;
  /** When true, show sign-in prompt and redirect to account instead of checkout */
  isGuest?: boolean;
}

export function PaywallModal({ onClose, lang, onSubscribe, stripeEnabled = false, isGuest = false }: PaywallModalProps) {
  const t = getT(lang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (isGuest) {
      const returnTo = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname || "/") : "";
      window.location.href = returnTo ? `/account?signin=1&returnTo=${returnTo}` : "/account?signin=1";
      return;
    }
    if (!stripeEnabled) {
      onClose();
      return;
    }
    setError("");
    setLoading(true);
    try {
      const returnTo = typeof window !== "undefined" ? window.location.pathname || "/" : "/";
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 401 && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (res.status === 503 && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setError(data.error || "Something went wrong. Try again.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-5"
      style={{ background: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="w-full max-w-[360px] rounded-[28px] p-8 border-2 border-[rgba(255,215,0,0.45)] text-center"
        style={{
          background: "linear-gradient(135deg,#1a1a4e,#2d1b69)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <div className="text-[48px] mb-2" aria-hidden>⭐</div>
        <h2
          id="paywall-title"
          className="font-fredoka text-[#FFD700] text-[22px] mb-2 leading-tight"
        >
          {t.paywallLimitTitle}
        </h2>
        <p className="text-[#c9b8e8] text-sm leading-relaxed mb-4">
          {t.paywallLimitSubtitle}
        </p>
        {isGuest && (
          <p className="text-[#FFD700]/90 text-sm leading-relaxed mb-4 font-medium">
            {t.signInToUpgrade}
          </p>
        )}

        <ul className="text-left mb-5 space-y-2 text-[13px] text-[rgba(200,180,255,0.9)]" style={{ listStyle: "none", paddingLeft: 0 }}>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700] flex-shrink-0" aria-hidden>✓</span>
            {t.paywallBenefit1}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700] flex-shrink-0" aria-hidden>✓</span>
            {t.paywallBenefit2}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700] flex-shrink-0" aria-hidden>✓</span>
            {t.paywallBenefit3}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#FFD700] flex-shrink-0" aria-hidden>✓</span>
            {t.paywallBenefit4}
          </li>
        </ul>

        {error && (
          <p className="mb-3 text-[13px] text-[rgba(255,160,160,0.95)]" role="alert">
            {error}
          </p>
        )}

        {process.env.NODE_ENV === "development" && (
          <p className="mb-2 text-[10px] text-[rgba(255,255,255,0.4)]" aria-hidden>
            Stripe: {stripeEnabled ? "configured" : "not configured"}
          </p>
        )}

        {stripeEnabled ? (
          <>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-[14px] border-none text-[#1a1a4e] text-base font-black cursor-pointer font-fredoka mb-3 disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                boxShadow: "0 4px 16px rgba(255,215,0,0.3)",
              }}
            >
              {loading ? "…" : `🌙 ${t.paywallUpgradeCta}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-transparent border-none text-[rgba(255,255,255,0.4)] text-[13px] cursor-pointer underline disabled:opacity-70"
            >
              {t.paywallMaybeLater}
            </button>
          </>
        ) : (
          <>
            <p className="text-[#c9b8e8] text-sm mb-4">{t.paywallSubSoon}</p>
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border-none text-[rgba(255,255,255,0.4)] text-[13px] cursor-pointer underline"
            >
              {t.paywallMaybeLater}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
