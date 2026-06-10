"use client";

import { useRef, useState, useEffect } from "react";
import {
  LANDING_SAMPLE_AUDIO,
  LANDING_SAMPLE_TEXT,
  LANDING_SAMPLE_PREVIEW,
  type LandingSampleLang,
} from "@/lib/landingSample";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang } from "@/types";

interface SampleAudioSectionProps {
  lang: Lang;
}

const SAMPLE_TOGGLE: { id: LandingSampleLang; label: string }[] = [
  { id: "en", label: "🇺🇸 English" },
  { id: "am", label: "🇪🇹 አማርኛ" },
];

export function SampleAudioSection({ lang }: SampleAudioSectionProps) {
  const { t } = useTranslation(lang);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sampleLang, setSampleLang] = useState<LandingSampleLang>("en");
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.src = LANDING_SAMPLE_AUDIO[sampleLang];
    audio.load();
    setPlaying(false);
    setAudioError(false);
    setExpanded(false);
  }, [sampleLang]);

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
      setAudioError(false);
    } catch {
      setAudioError(true);
      setPlaying(false);
    }
  };

  return (
    <section id="sample" className="mb-12 scroll-mt-24 text-center">
      <h2 className="font-fredoka text-[#FFD700] text-[22px] sm:text-[26px] mb-6">
        {t.sampleHeadline}
      </h2>

      <div
        className="rounded-[24px] border p-6"
        style={{
          background: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,215,0,0.2)",
        }}
      >
        <div className="flex justify-center gap-3 mb-6" role="group" aria-label={t.sampleToggleLabel}>
          {SAMPLE_TOGGLE.map(({ id, label }) => {
            const active = sampleLang === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSampleLang(id)}
                className="min-h-[48px] px-5 py-2.5 rounded-full text-[15px] font-medium transition-all"
                style={{
                  background: active
                    ? "linear-gradient(135deg,#FF8C00,#FFD700)"
                    : "rgba(255,255,255,0.07)",
                  border: `2px solid ${active ? "#FFD700" : "rgba(255,255,255,0.14)"}`,
                  color: active ? "#1a0533" : "#d4c4f0",
                }}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>

        <audio
          ref={audioRef}
          src={LANDING_SAMPLE_AUDIO.en}
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onError={() => setAudioError(true)}
        />

        <button
          type="button"
          onClick={togglePlay}
          className="w-20 h-20 min-h-[80px] rounded-full flex items-center justify-center text-3xl border-2 transition-all mx-auto"
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

        <p className="mt-3 text-[14px] font-medium text-[#c9b8e8]">
          {audioError ? t.sampleAudioFallback : t.samplePlayLabel}
        </p>

        <div className="mt-5 text-left rounded-[16px] p-4" style={{ background: "rgba(13,13,43,0.45)" }}>
          <p
            className="text-[16px] leading-relaxed text-[#e8e0ff] font-medium"
            style={{
              fontFamily:
                sampleLang === "am" ? "'Noto Sans Ethiopic',sans-serif" : "'Lora',serif",
            }}
          >
            {expanded ? LANDING_SAMPLE_TEXT[sampleLang] : LANDING_SAMPLE_PREVIEW[sampleLang]}
          </p>
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-3 text-[14px] font-medium text-[var(--color-peach)] bg-transparent border-none cursor-pointer p-0"
            >
              {t.sampleReadMore}
            </button>
          )}
        </div>

        <p className="mt-4 text-[14px] text-[#b8a8d8]">
          {t.sampleLanguageNote}
        </p>
      </div>
    </section>
  );
}
