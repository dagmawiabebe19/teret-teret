"use client";

import { useRef, useState } from "react";
import { LANDING_SAMPLE_EN } from "@/lib/landingSample";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface SampleAudioSectionProps {
  lang: Lang;
}

export function SampleAudioSection({ lang }: SampleAudioSectionProps) {
  const { t } = useTranslation(lang);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setAudioError(true);
      setPlaying(false);
    }
  };

  return (
    <section id="sample" className="mb-14 scroll-mt-24">
      <h2 className="font-fredoka text-[#FFD700] text-xl sm:text-2xl text-center mb-6">
        {t.sampleHeadline}
      </h2>

      <div
        className="rounded-[20px] border p-5 sm:p-6"
        style={{
          background: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,215,0,0.25)",
        }}
      >
        <audio
          ref={audioRef}
          src="/sample-story.mp3"
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onError={() => setAudioError(true)}
        />

        <div className="flex flex-col items-center mb-5">
          <button
            type="button"
            onClick={togglePlay}
            className="w-16 h-16 min-h-[56px] rounded-full flex items-center justify-center text-2xl border-2 transition-all"
            style={{
              background: playing
                ? "linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,140,0,0.2))"
                : "linear-gradient(135deg,#FF8C00,#FFD700)",
              borderColor: "rgba(255,215,0,0.5)",
              color: playing ? "#FFD700" : "#1a0533",
              boxShadow: "0 4px 24px rgba(255,140,0,0.35)",
            }}
            aria-label={playing ? t.samplePauseLabel : t.samplePlayLabel}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <p className="mt-3 text-[12px] font-bold text-[rgba(200,180,255,0.7)]">
            {audioError ? t.sampleAudioFallback : t.samplePlayLabel}
          </p>
          <p className="mt-2 text-[11px] text-center text-[rgba(200,180,255,0.55)] max-w-[320px] leading-snug">
            {t.sampleLanguageNote}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(13,13,43,0.5)" }}
        >
          <p
            className="text-[14px] leading-relaxed text-[#e8e0ff]"
            style={{ fontFamily: "'Lora',serif" }}
          >
            {LANDING_SAMPLE_EN}
          </p>
        </div>
      </div>
    </section>
  );
}
