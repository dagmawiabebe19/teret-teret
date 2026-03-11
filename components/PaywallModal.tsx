"use client";

import { UI } from "@/lib/constants";
import type { Lang } from "@/types";

interface PaywallModalProps {
  onClose: () => void;
  lang: Lang;
  onSubscribe?: () => void;
  stripeEnabled?: boolean;
}

export function PaywallModal({ onClose, lang, onSubscribe, stripeEnabled = false }: PaywallModalProps) {
  const t = UI[lang];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-5"
      style={{ background: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="w-full max-w-[340px] rounded-[28px] p-9 border-2 border-[rgba(255,215,0,0.45)] text-center"
        style={{
          background: "linear-gradient(135deg,#1a1a4e,#2d1b69)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        <div className="text-[52px] mb-3" aria-hidden>⭐</div>
        <h2
          id="paywall-title"
          className="font-fredoka text-[#FFD700] text-[22px] mb-2"
        >
          {t.paywallTitle}
        </h2>
        <p
          className="text-[#c9b8e8] text-sm leading-relaxed mb-2"
          style={{ lineHeight: 1.6 }}
        >
          {stripeEnabled ? t.paywallSub : t.paywallSubSoon}
        </p>
        {stripeEnabled && (
          <p className="text-[rgba(255,215,0,0.8)] text-xs mb-5">
            {t.paywallValueLine}
          </p>
        )}
        {stripeEnabled && (
          <>
            <div
              className="rounded-[14px] p-4 mb-5 border border-[rgba(255,215,0,0.3)]"
              style={{ background: "rgba(255,215,0,0.08)" }}
            >
              <p className="text-[#FFD700] text-[22px] font-black m-0 font-fredoka">
                $4.99 / {t.paywallPriceUnit}
              </p>
              <p className="text-[#c9b8e8] text-xs mt-1">{t.paywallPriceSub}</p>
            </div>
            <button
              type="button"
              onClick={onSubscribe}
              className="w-full py-4 rounded-[14px] border-none text-[#1a1a4e] text-base font-black cursor-pointer font-fredoka mb-2"
              style={{
                background: "linear-gradient(135deg,#FF8C00,#FFD700)",
              }}
            >
              🌙 {t.paywallSubscribeBtn}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border-none text-[rgba(255,255,255,0.35)] text-[13px] cursor-pointer underline"
        >
          {t.paywallLaterBtn}
        </button>
      </div>
    </div>
  );
}
