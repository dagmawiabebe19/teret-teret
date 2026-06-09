"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface SocialProofProps {
  lang: Lang;
}

export function SocialProof({ lang }: SocialProofProps) {
  const { t } = useTranslation(lang);

  const testimonials = [
    { quote: t.testimonial1Quote, author: t.testimonial1Author },
    { quote: t.testimonial2Quote, author: t.testimonial2Author },
    { quote: t.testimonial3Quote, author: t.testimonial3Author },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-center font-fredoka text-[#FFD700] text-xl mb-5">
        {t.socialProofHeading}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {testimonials.map((item, i) => (
          <div
            key={i}
            className="rounded-[18px] border p-4"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,215,0,0.12)",
            }}
          >
            <p className="text-[#FFD700] text-sm mb-2" aria-hidden>
              ★★★★★
            </p>
            <p className="text-[13px] text-[#e8e0ff] leading-relaxed mb-3">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="text-[11px] font-bold text-[rgba(200,180,255,0.55)]">
              — {item.author}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
