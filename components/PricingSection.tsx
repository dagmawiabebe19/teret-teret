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
    <section className="mb-14">
      <h2 className="text-center font-fredoka text-[#FFD700] text-xl sm:text-2xl mb-6">
        {t.pricingHeading}
      </h2>
      <div className="flex flex-col gap-4">
        {/* Premium first on mobile */}
        <div
          className="rounded-[20px] border p-5 relative overflow-hidden order-1"
          style={{
            background: "linear-gradient(145deg, rgba(255,215,0,0.1) 0%, rgba(196,77,255,0.08) 100%)",
            borderColor: "rgba(255,215,0,0.4)",
          }}
        >
          <span
            className="absolute top-0 right-0 text-[10px] font-black px-3 py-1 rounded-bl-xl"
            style={{
              background: "linear-gradient(135deg,#FF8C00,#FFD700)",
              color: "#1a0533",
            }}
          >
            {t.pricingPremiumRibbon}
          </span>
          <p className="font-fredoka text-[#FFD700] text-lg mb-0.5">{t.pricingPremiumTitle}</p>
          <p className="text-[28px] font-black text-[#FFD700] mb-4">{t.pricePerMonth}</p>
          <ul className="space-y-2 text-[13px] text-[rgba(200,180,255,0.9)]">
            {t.pricingPremiumFeatures.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#FFD700]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-[20px] border p-5 order-2"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <p className="font-fredoka text-[#c9b8e8] text-lg mb-0.5">{t.pricingFreeCardTitle}</p>
          <p className="text-[22px] font-black text-[#c9b8e8] mb-4">{t.planFree}</p>
          <ul className="space-y-2 text-[13px] text-[rgba(200,180,255,0.8)]">
            {t.pricingFreeFeatures.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#FFD700]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={handleCta}
          disabled={loading}
          className="w-full min-h-[56px] py-3.5 px-6 rounded-[14px] font-black font-fredoka text-[16px] text-[#1a0533] disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700)",
            boxShadow: "0 4px 20px rgba(255,140,0,0.35)",
          }}
        >
          {loading ? "…" : t.pricingCta}
        </button>
        <p className="mt-3 text-[13px] font-bold text-[#FFD700]">{t.pricingNoCard}</p>
      </div>
    </section>
  );
}
