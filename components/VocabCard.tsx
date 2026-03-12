"use client";

import { useState } from "react";
import type { VocabWord } from "@/types";
import type { Lang } from "@/types";

interface VocabCardProps {
  vocab: VocabWord;
  /** Language the story is in — word shown in this language (we use English word as key; for am/es we show translation) */
  storyLang: Lang;
  /** Whether this word is already saved */
  isSaved?: boolean;
  onSave?: (word: VocabWord) => void;
}

/** Display word in story language: for "en" show word, for "am" show translation_am, for "es" show translation_es */
function displayWord(vocab: VocabWord, storyLang: Lang): string {
  switch (storyLang) {
    case "am":
      return vocab.translation_am;
    case "es":
      return vocab.translation_es;
    default:
      return vocab.word;
  }
}

/** Display translation into "learning" language for the back of the card */
function displayTranslation(vocab: VocabWord, learningLang: Lang): string {
  switch (learningLang) {
    case "am":
      return vocab.translation_am;
    case "es":
      return vocab.translation_es;
    default:
      return vocab.word;
  }
}

export function VocabCard({ vocab, storyLang, isSaved = false, onSave }: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);

  const wordSide = displayWord(vocab, storyLang);
  const learningLang: Lang = storyLang === "am" ? "en" : storyLang === "es" ? "en" : "am";
  const translation = displayTranslation(vocab, learningLang);

  return (
    <div
      className="rounded-2xl border overflow-hidden touch-manipulation"
      style={{
        background: "linear-gradient(145deg, rgba(26,26,78,0.7) 0%, rgba(45,27,105,0.5) 100%)",
        borderColor: "rgba(196,77,255,0.25)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        minWidth: 160,
        maxWidth: 200,
        perspective: 1000,
      }}
    >
      <div
        className="relative w-full min-h-[120px] cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.4s ease",
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="absolute inset-0 w-full p-4 flex flex-col items-center justify-center rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <p
            className="text-center font-bold text-[#FFD700] text-lg mb-1"
            style={{ fontFamily: "'Lora',Georgia,serif" }}
          >
            {wordSide}
          </p>
          <p className="text-[10px] text-[rgba(200,180,255,0.5)] uppercase tracking-wider">Tap to reveal</p>
        </div>
        <div
          className="absolute inset-0 w-full p-4 flex flex-col items-center justify-center rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(145deg, rgba(35,35,90,0.85) 0%, rgba(55,30,120,0.6) 100%)",
          }}
        >
          <p
            className="text-center font-bold text-[#c9b8e8] text-sm mb-2"
            style={{ fontFamily: "'Lora',Georgia,serif" }}
          >
            {translation}
          </p>
          <p
            className="text-[11px] text-[rgba(200,180,255,0.75)] italic text-center leading-relaxed"
            style={{ fontFamily: "'Lora',Georgia,serif" }}
          >
            {vocab.exampleSentence}
          </p>
        </div>
      </div>
      {onSave && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave(vocab);
          }}
          className="w-full py-2 flex items-center justify-center gap-1 border-t text-xs font-bold transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: isSaved ? "#FFD700" : "rgba(200,180,255,0.6)",
          }}
        >
          {isSaved ? "★ Saved" : "☆ Save this word"}
        </button>
      )}
    </div>
  );
}
