"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface TestimonialsSectionProps {
  lang: Lang;
}

export function TestimonialsSection({ lang }: TestimonialsSectionProps) {
  const { t } = useTranslation(lang);

  return (
    <section className="mb-12">
      <div
        className="rounded-[24px] border p-6 text-center"
        style={{
          background: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,215,0,0.2)",
        }}
      >
        <p className="text-[#FFD700] text-lg mb-1" aria-hidden>
          ★★★★★
        </p>
        <blockquote
          className="text-[16px] leading-relaxed text-[#e8e0ff] font-medium mb-4"
          style={{ fontFamily: lang === "am" ? "var(--font-amharic)" : "inherit" }}
        >
          &ldquo;{t.testimonialFeaturedQuote}&rdquo;
        </blockquote>
        <p className="text-[14px] text-[var(--color-peach)] font-medium">
          — {t.testimonialFeaturedAuthor}
        </p>
      </div>
    </section>
  );
}
