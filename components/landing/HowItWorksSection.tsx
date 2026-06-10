"use client";

import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang } from "@/types";

interface HowItWorksSectionProps {
  lang: Lang;
  onStartClick: () => void;
}

export function HowItWorksSection({ lang, onStartClick }: HowItWorksSectionProps) {
  const { t } = useTranslation(lang);
  const steps = t.howItWorksSteps;

  return (
    <section className="mb-12">
      <h2 className="font-fredoka text-[#FFD700] text-xl sm:text-2xl text-center mb-6">
        {t.howItWorksHeadline}
      </h2>
      <div className="space-y-3 mb-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[16px] border p-4 flex gap-4 items-start"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,215,0,0.15)",
            }}
          >
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              style={{
                background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                color: "#1a0533",
              }}
            >
              {i + 1}
            </span>
            <div className="text-left">
              <p className="text-[14px] font-bold text-[#e8e0ff]">{step.title}</p>
              <p className="text-[12px] text-[rgba(200,180,255,0.7)] mt-0.5">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          trackGenerateStoryCta("how_it_works");
          onStartClick();
        }}
        className="w-full min-h-[56px] py-3.5 px-6 rounded-[14px] font-black font-fredoka text-[16px] text-[#1a0533]"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          boxShadow: "0 4px 24px rgba(255,140,0,0.4)",
        }}
      >
        {t.howItWorksCta}
      </button>
    </section>
  );
}
