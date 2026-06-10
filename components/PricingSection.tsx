"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { startStripeCheckout } from "@/lib/stripeCheckout";
import { trackGenerateStoryCta, trackPremiumUpgradeClick } from "@/lib/analytics";
import type { Lang } from "@/types";

interface PricingSectionProps {
  lang: Lang;
  isSignedIn: boolean;
  stripeEnabled: boolean;
}

export function PricingSection({ lang, isSignedIn, stripeEnabled }: PricingSectionProps) {
  const { t } = useTranslation(lang);
  const [loading, setLoading] = useState(false);

  const handleCta = async () => {
    trackGenerateStoryCta("pricing");
    if (!isSignedIn) {
      document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!stripeEnabled) return;
    trackPremiumUpgradeClick("pricing");
    setLoading(true);
    await startStripeCheckout("/");
    setLoading(false);
  };

  return (
    <section className="mb-12">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="rounded-[22px] border p-4 min-h-[120px] flex flex-col justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <p className="text-[13px] font-medium text-[#c9b8e8] mb-1">{t.planFree}</p>
          <p className="text-[15px] font-medium text-[#e8e0ff] leading-snug">
            {t.pricingFreeShort}
          </p>
        </div>
        <div
          className="rounded-[22px] border p-4 min-h-[120px] flex flex-col justify-center"
          style={{
            background: "linear-gradient(145deg, rgba(255,215,0,0.1), rgba(255,176,136,0.08))",
            borderColor: "rgba(255,215,0,0.35)",
          }}
        >
          <p className="text-[13px] font-medium text-[#FFD700] mb-1">{t.pricePerMonth}</p>
          <p className="text-[15px] font-medium text-[#e8e0ff] leading-snug">
            {t.pricingPremiumShort}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCta}
        disabled={loading}
        className="w-full min-h-[64px] py-3.5 px-6 rounded-[20px] text-[17px] font-medium text-[#1a0533] disabled:opacity-70"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          boxShadow: "0 4px 20px rgba(255,140,0,0.3)",
        }}
      >
        {loading ? "…" : t.pricingCta}
      </button>
      <p className="mt-3 text-center text-[14px] font-medium text-[#c9b8e8]">
        {t.pricingCancelNote}
      </p>
    </section>
  );
}
