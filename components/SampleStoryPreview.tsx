"use client";

import { useState } from "react";
import { StoryReader } from "./StoryReader";
import { SAMPLE_CHILD_NAME, SAMPLE_REGION, SAMPLE_STORY_PAGES, SAMPLE_STORY_RAW } from "@/lib/sampleStory";
import { getRegionLabel } from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface SampleStoryPreviewProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  visible: boolean;
  onGenerateOwn: () => void;
}

export function SampleStoryPreview({
  lang,
  setLang,
  visible,
  onGenerateOwn,
}: SampleStoryPreviewProps) {
  const { t } = useTranslation(lang);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!visible) return null;

  if (previewOpen) {
    return (
      <StoryReader
        pages={SAMPLE_STORY_PAGES}
        childName={SAMPLE_CHILD_NAME}
        region={getRegionLabel(SAMPLE_REGION, lang)}
        rawStory={SAMPLE_STORY_RAW}
        onNew={() => setPreviewOpen(false)}
        onAnother={() => setPreviewOpen(false)}
        onSave={() => {}}
        onCopy={() => {}}
        copied={false}
        saved={false}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  return (
    <section id="sample" className="mb-10 scroll-mt-24">
      <div
        className="rounded-[24px] border overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 40%,#2d1b69 100%)",
          borderColor: "rgba(196,77,255,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div className="p-5 border-b border-[rgba(255,215,0,0.1)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(200,180,255,0.45)] mb-1">
            {t.sampleStoryLabel}
          </p>
          <h3 className="font-fredoka text-[#FFD700] text-lg">
            {t.storyForName(SAMPLE_CHILD_NAME)} · {getRegionLabel(SAMPLE_REGION, lang)}
          </h3>
        </div>

        <div className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          <p
            className="text-[#e8e0ff] font-medium mb-6 max-w-[400px]"
            style={{
              fontFamily: lang === "am" ? "var(--font-amharic)" : "'Lora',Georgia,serif",
              fontSize: lang === "am" ? "clamp(17px,4.5vw,22px)" : "clamp(15px,4vw,19px)",
              lineHeight: 1.9,
            }}
          >
            {lang === "am"
              ? SAMPLE_STORY_PAGES[0].am
              : lang === "es"
                ? SAMPLE_STORY_PAGES[0].es
                : SAMPLE_STORY_PAGES[0].en}
          </p>
          <p className="text-[11px] text-[rgba(200,180,255,0.4)] mb-4">
            1 / {SAMPLE_STORY_PAGES.length}
          </p>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="py-2.5 px-5 rounded-xl text-sm font-bold border text-[#c9b8e8] hover:text-[#FFD700] transition-colors"
            style={{ borderColor: "rgba(196,77,255,0.3)" }}
          >
            {t.sampleReadFull} →
          </button>
        </div>

        <div className="p-5 border-t border-[rgba(255,215,0,0.1)] text-center">
          <button
            type="button"
            onClick={onGenerateOwn}
            className="font-fredoka text-[15px] font-black text-[#FFD700] hover:underline"
          >
            {t.generateYourOwn}
          </button>
        </div>
      </div>
    </section>
  );
}
