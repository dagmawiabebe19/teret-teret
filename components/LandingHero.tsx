"use client";

import { FloatingAnimals } from "./FloatingAnimals";
import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang } from "@/types";

interface LandingHeroProps {
  lang: Lang;
  onCreateClick: () => void;
  onListenSample: () => void;
  remainingStories: number | null;
  storiesUsedToday: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function LandingHero({
  lang,
  onCreateClick,
  onListenSample,
  remainingStories,
  storiesUsedToday,
  isPremium,
  onUpgrade,
}: LandingHeroProps) {
  const { t } = useTranslation(lang);

  const showExhaustedBanner =
    !isPremium && remainingStories !== null && remainingStories <= 0 && storiesUsedToday > 0;

  return (
    <section className="relative text-center pt-6 pb-8 px-1 overflow-hidden">
      <FloatingAnimals />
      <div className="relative z-[1]">
        <h1
          className="font-fredoka text-[#FFD700] leading-[1.12] mb-4 mx-auto max-w-[560px]"
          style={{
            fontSize: "clamp(32px,8vw,56px)",
            textShadow: "0 4px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,215,0,0.3)",
          }}
        >
          {t.heroHeadline}
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#c9b8e8] font-semibold leading-relaxed mb-8 max-w-[520px] mx-auto">
          {t.heroSubheadline}
        </p>

        <button
          type="button"
          onClick={() => {
            trackGenerateStoryCta("hero");
            onCreateClick();
          }}
          className="w-full min-h-[56px] py-4 px-6 rounded-[14px] font-black font-fredoka text-[17px] text-[#1a0533] transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700)",
            boxShadow: "0 4px 28px rgba(255,140,0,0.45), 0 0 40px rgba(255,215,0,0.15)",
          }}
        >
          {t.ctaCreateFree}
        </button>

        <button
          type="button"
          onClick={onListenSample}
          className="mt-4 text-[14px] font-bold text-[#c9b8e8] underline underline-offset-4 hover:text-[#FFD700] transition-colors bg-transparent border-none cursor-pointer"
        >
          {t.ctaListenSample}
        </button>

        {showExhaustedBanner && (
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-5 w-full py-2.5 px-4 rounded-full text-[13px] font-bold border transition-all hover:brightness-110"
            style={{
              background: "rgba(255,100,100,0.12)",
              borderColor: "rgba(255,150,150,0.35)",
              color: "#ffb0b0",
            }}
          >
            {t.freeBannerUpgrade}
          </button>
        )}

        <p className="mt-6 text-[11px] sm:text-[12px] font-bold text-[rgba(200,180,255,0.65)] leading-relaxed px-2">
          {t.trustStrip}
        </p>
      </div>
    </section>
  );
}
