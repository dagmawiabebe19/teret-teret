"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { startStripeCheckout } from "@/lib/stripeCheckout";
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
    if (!isSignedIn) {
      document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!stripeEnabled) return;
    setLoading(true);
    await startStripeCheckout("/");
    setLoading(false);
  };

  return (
    <section className="mb-12 mt-8">
      <h2 className="text-center font-fredoka text-[#FFD700] text-xl mb-6">
        {t.pricingHeading}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div
          className="rounded-[20px] border p-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <p className="font-fredoka text-[#c9b8e8] text-lg mb-1">{t.pricingFreeTitle}</p>
          <p className="text-[28px] font-black text-[#FFD700] mb-4">{t.planFree}</p>
          <ul className="space-y-2 text-[13px] text-[rgba(200,180,255,0.8)]">
            {t.pricingFreeFeatures.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#FFD700]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-[20px] border p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(255,215,0,0.08) 0%, rgba(196,77,255,0.06) 100%)",
            borderColor: "rgba(255,215,0,0.35)",
          }}
        >
          <p className="font-fredoka text-[#FFD700] text-lg mb-1">{t.pricingPremiumTitle}</p>
          <p className="text-[28px] font-black text-[#FFD700] mb-4">
            {t.pricePerMonth}
          </p>
          <ul className="space-y-2 text-[13px] text-[rgba(200,180,255,0.9)] mb-4">
            {t.pricingPremiumFeatures.map((f, i) => (
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
          className="inline-block px-8 py-3 rounded-[14px] font-black font-fredoka text-[#1a1a4e] disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700)",
            boxShadow: "0 4px 20px rgba(255,140,0,0.35)",
          }}
        >
          {loading ? "…" : t.pricingCta}
        </button>
      </div>
    </section>
  );
}
