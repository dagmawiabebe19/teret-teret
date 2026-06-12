"use client";

import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang } from "@/types";

interface LandingHeroProps {
  lang: Lang;
  onCreateClick: () => void;
  remainingStories: number | null;
  storiesUsedToday: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function LandingHero({
  lang,
  onCreateClick,
  remainingStories,
  storiesUsedToday,
  isPremium,
  onUpgrade,
}: LandingHeroProps) {
  const { t } = useTranslation(lang);

  const showExhaustedBanner =
    !isPremium && remainingStories !== null && remainingStories <= 0 && storiesUsedToday > 0;

  return (
    <section
      className="relative text-center flex flex-col justify-center px-1 pb-10"
      style={{ minHeight: "calc(100dvh - 56px)" }}
    >
      <div
        className="mx-auto mb-3 md:mb-6 w-[84px] h-[84px] md:w-[140px] md:h-[140px] rounded-[22px] md:rounded-[36px] flex items-center justify-center text-[43px] md:text-[72px]"
        style={{
          background: "linear-gradient(145deg, rgba(255,176,136,0.2), rgba(255,215,0,0.12))",
          border: "2px solid rgba(255,215,0,0.25)",
          boxShadow: "0 8px 32px rgba(255,140,0,0.15)",
        }}
        aria-hidden
      >
        🦁
      </div>

      <h1
        className="text-[#FFD700] font-bold leading-[1.2] mb-2 mx-auto max-w-[520px]"
        style={{
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontSize: "clamp(26px,6.5vw,42px)",
          textShadow: "0 2px 0 rgba(0,0,0,0.25), 0 0 24px rgba(255,215,0,0.2)",
        }}
      >
        {t.heroHeadline}
      </h1>
      <p
        className="text-[15px] sm:text-[16px] text-[rgba(200,180,230,0.85)] font-medium leading-relaxed mb-5 max-w-[400px] mx-auto"
        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
      >
        {t.heroSubheadline}
      </p>

      <button
        type="button"
        onClick={() => {
          trackGenerateStoryCta("hero");
          onCreateClick();
        }}
        className="w-full min-h-[72px] py-4 px-6 rounded-[22px] text-[18px] font-medium text-[#1a0533] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          boxShadow: "0 4px 28px rgba(255,140,0,0.45), 0 0 40px rgba(255,215,0,0.12)",
        }}
      >
        {t.ctaStartStory}
      </button>

      <p className="mt-3 text-[14px] font-medium text-[var(--color-peach)]">
        {t.heroFreeNote}
      </p>
      <p
        className="mt-2 text-[12px] sm:text-[13px] font-medium text-[var(--color-peach)] leading-snug max-w-[320px] mx-auto"
        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
      >
        {t.heroSocialProof}
      </p>

      {showExhaustedBanner && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-5 w-full min-h-[48px] py-3 px-4 rounded-full text-[14px] font-medium border transition-all hover:brightness-110"
          style={{
            background: "rgba(255,100,100,0.12)",
            borderColor: "rgba(255,150,150,0.35)",
            color: "#ffb0b0",
          }}
        >
          {t.freeBannerUpgrade}
        </button>
      )}
    </section>
  );
}
