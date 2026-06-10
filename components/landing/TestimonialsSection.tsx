"use client";

import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

export function TestimonialsSection({ lang }: { lang: Lang }) {
  const { t } = useTranslation(lang);
  const cards = [
    { quote: t.testimonial1Quote, author: t.testimonial1Author },
    { quote: t.testimonial2Quote, author: t.testimonial2Author },
    { quote: t.testimonial3Quote, author: t.testimonial3Author },
  ];

  return (
    <section className="mb-14">
      <h2 className="font-fredoka text-[#FFD700] text-xl sm:text-2xl text-center mb-6">
        {t.socialProofHeading}
      </h2>
      <div className="space-y-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-[16px] border p-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,215,0,0.12)",
            }}
          >
            <p className="text-[#FFD700] text-sm mb-2" aria-hidden>
              ★★★★★
            </p>
            <p className="text-[14px] leading-relaxed text-[#e8e0ff] mb-3">&ldquo;{card.quote}&rdquo;</p>
            <p className="text-[12px] font-bold text-[rgba(200,180,255,0.65)]">— {card.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
