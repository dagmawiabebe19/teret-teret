"use client";

import { FloatingAnimals } from "./FloatingAnimals";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface LandingHeroProps {
  lang: Lang;
  onCreateClick: () => void;
  onSeeExample: () => void;
  remainingStories: number | null;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function LandingHero({
  lang,
  onCreateClick,
  onSeeExample,
  remainingStories,
  isPremium,
  onUpgrade,
}: LandingHeroProps) {
  const { t } = useTranslation(lang);

  const freeBanner = () => {
    if (isPremium) {
      return (
        <p className="text-[13px] font-bold text-[#FFD700] mt-4">
          ✨ {t.unlimitedStories}
        </p>
      );
    }
    if (remainingStories === null) return null;
    if (remainingStories <= 0) {
      return (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-4 w-full max-w-md mx-auto block py-2.5 px-4 rounded-full text-[13px] font-bold border transition-all hover:brightness-110"
          style={{
            background: "rgba(255,100,100,0.12)",
            borderColor: "rgba(255,150,150,0.35)",
            color: "#ffb0b0",
          }}
        >
          {t.freeBannerUpgrade}
        </button>
      );
    }
    if (remainingStories === 1) {
      return (
        <p
          className="mt-4 inline-block py-2 px-4 rounded-full text-[13px] font-bold"
          style={{
            background: "rgba(255,215,0,0.12)",
            border: "1px solid rgba(255,215,0,0.35)",
            color: "#FFD700",
          }}
        >
          ✨ {t.freeBannerOneLeft}
        </p>
      );
    }
    return (
      <p
        className="mt-4 inline-block py-2 px-4 rounded-full text-[13px] font-bold"
        style={{
          background: "rgba(255,215,0,0.12)",
          border: "1px solid rgba(255,215,0,0.35)",
          color: "#FFD700",
        }}
      >
        ✨ {t.freeBannerDefault}
      </p>
    );
  };

  return (
    <section className="relative text-center pt-8 pb-10 px-2 overflow-hidden">
      <FloatingAnimals />
      <div className="relative z-[1]">
        <h1
          className="font-fredoka text-[#FFD700] leading-[1.15] mb-4 mx-auto max-w-[520px]"
          style={{
            fontSize: "clamp(32px,8vw,48px)",
            textShadow: "0 4px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,215,0,0.3)",
          }}
        >
          {t.heroHeadline}
        </h1>
        <p className="text-[15px] text-[#c9b8e8] font-semibold leading-relaxed mb-6 max-w-[480px] mx-auto">
          {t.heroSubheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
          <button
            type="button"
            onClick={onCreateClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] font-black font-fredoka text-[16px] text-[#1a1a4e] transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg,#FF8C00,#FFD700)",
              boxShadow: "0 4px 24px rgba(255,140,0,0.4)",
            }}
          >
            {t.ctaCreateFree}
          </button>
          <button
            type="button"
            onClick={onSeeExample}
            className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] font-bold text-[15px] text-[#c9b8e8] border transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            {t.ctaSeeExample}
          </button>
        </div>

        {freeBanner()}

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 text-[11px] font-bold text-[rgba(200,180,255,0.65)]">
          <span>{t.trustTrilingual}</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>{t.trustEthiopian}</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span>{t.trustChildSafe}</span>
        </div>
      </div>
    </section>
  );
}
