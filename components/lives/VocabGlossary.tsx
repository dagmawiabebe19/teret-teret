"use client";

import { useState } from "react";
import type { VocabPair } from "@/lib/lives/types";
import { LivesSpeakButton } from "@/components/lives/LivesSpeakButton";

interface VocabGlossaryProps {
  vocab: VocabPair[];
  playingKey: string | null;
  loadingKey: string | null;
  onSpeak: (key: string, text: string, lang: "am" | "en") => void;
}

export function VocabGlossary({
  vocab,
  playingKey,
  loadingKey,
  onSpeak,
}: VocabGlossaryProps) {
  const [open, setOpen] = useState(true);
  if (!vocab.length) return null;

  return (
    <div className="rounded-2xl border border-[rgba(255,215,0,0.15)] bg-[rgba(255,255,255,0.04)] overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left min-h-[48px] tap-zone"
        aria-expanded={open}
      >
        <span className="text-[13px] font-bold text-[#FFD700]">
          አዲስ ቃላት / New words
        </span>
        <span className="text-[#c9b8e8] text-[12px]" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-2 border-t border-[rgba(255,215,0,0.08)] pt-3">
          {vocab.map((pair, i) => {
            const key = `vocab-${i}-${pair.english}`;
            return (
              <li
                key={key}
                className="flex items-center gap-2 rounded-xl px-2 py-2 bg-[rgba(0,0,0,0.15)]"
              >
                <LivesSpeakButton
                  clipKey={key}
                  text={pair.english}
                  lang="en"
                  playingKey={playingKey}
                  loadingKey={loadingKey}
                  onSpeak={onSpeak}
                  label={`Hear ${pair.english}`}
                  size="sm"
                />
                <button
                  type="button"
                  className="flex-1 text-left min-h-[40px] tap-zone"
                  onClick={() => onSpeak(key, pair.english, "en")}
                >
                  <span className="block text-[14px] font-bold text-[#e8e0ff]">
                    {pair.english}
                  </span>
                  {pair.amharic && (
                    <span
                      className="block text-[12px] text-[rgba(200,180,255,0.65)]"
                      style={{ fontFamily: "var(--font-amharic), sans-serif" }}
                    >
                      {pair.amharic}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
