"use client";

import { useState } from "react";
import { VocabCard } from "./VocabCard";
import type { VocabWord } from "@/types";
import type { StoryPage } from "@/types";
import type { Lang } from "@/types";

function splitSentences(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface LanguageLearningPanelProps {
  /** Vocabulary for the whole story (from API or getVocabForStory) */
  vocabulary: VocabWord[];
  /** Current page content */
  currentPage: StoryPage;
  /** All pages (for future use) */
  allPages: StoryPage[];
  /** Language the story is being read in */
  storyLang: Lang;
  /** Saved word keys (e.g. English word) for "Save this word" state */
  savedWordKeys?: Set<string>;
  onSaveWord?: (word: VocabWord) => void;
}

export function LanguageLearningPanel({
  vocabulary,
  currentPage,
  storyLang,
  savedWordKeys = new Set(),
  onSaveWord,
}: LanguageLearningPanelProps) {
  const [learningLang, setLearningLang] = useState<Lang>(storyLang === "am" ? "en" : "am");
  const [tappedSentenceIndex, setTappedSentenceIndex] = useState<number | null>(null);

  const storyText =
    storyLang === "am"
      ? currentPage.am
      : storyLang === "en"
        ? currentPage.en || currentPage.am
        : currentPage.es || currentPage.am;
  const learningText =
    learningLang === "am"
      ? currentPage.am
      : learningLang === "en"
        ? currentPage.en || currentPage.am
        : currentPage.es || currentPage.am;

  const storySentences = splitSentences(storyText);
  const learningSentences = splitSentences(learningText);

  return (
    <div
      className="rounded-2xl border p-4 w-full max-w-[420px] mx-auto"
      style={{
        background: "linear-gradient(145deg, rgba(26,26,78,0.5) 0%, rgba(45,27,105,0.35) 100%)",
        borderColor: "rgba(196,77,255,0.2)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[rgba(255,215,0,0.7)] mb-3">
        🌍 Words in this story
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
        {vocabulary.length === 0 ? (
          <p className="text-sm text-[rgba(200,180,255,0.5)] italic py-4">No vocabulary for this story yet.</p>
        ) : (
          vocabulary.map((v) => (
            <VocabCard
              key={v.word}
              vocab={v}
              storyLang={storyLang}
              isSaved={savedWordKeys.has(v.word)}
              onSave={onSaveWord}
            />
          ))
        )}
      </div>

      {onSaveWord && (
        <p className="text-[11px] text-[rgba(200,180,255,0.6)] mt-2 mb-3">
          Words you&apos;ve saved: <span className="font-bold text-[#FFD700]">{savedWordKeys.size}</span>
        </p>
      )}

      <div className="flex gap-2 mb-3">
        <span className="text-[10px] uppercase text-[rgba(200,180,255,0.5)] self-center">Learning:</span>
        {(["am", "en", "es"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLearningLang(l)}
            className="py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all"
            style={{
              background: learningLang === l ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.06)",
              borderColor: learningLang === l ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)",
              color: learningLang === l ? "#FFD700" : "rgba(200,180,255,0.7)",
            }}
          >
            {l === "am" ? "አማ" : l === "es" ? "ES" : "EN"}
          </button>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-[rgba(255,215,0,0.6)] mb-2">
        Tap any sentence to see translation
      </p>
      <div className="space-y-3">
        {storySentences.length === 0 ? (
          <p className="text-sm text-[rgba(200,180,255,0.5)] italic">No sentences on this page.</p>
        ) : (
          storySentences.map((sent, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTappedSentenceIndex(tappedSentenceIndex === i ? null : i)}
              className="w-full text-left p-3 rounded-xl border transition-all"
              style={{
                background: tappedSentenceIndex === i ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.04)",
                borderColor: tappedSentenceIndex === i ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.08)",
              }}
            >
              <p
                className="text-[#e8e0ff] text-sm leading-relaxed mb-1"
                style={{ fontFamily: "'Lora',Georgia,serif" }}
              >
                {sent}{sent.match(/[.!?]$/) ? "" : "."}
              </p>
              {tappedSentenceIndex === i && learningSentences[i] !== undefined && (
                <p
                  className="text-[#FFD700] text-sm leading-relaxed"
                  style={{ fontFamily: "'Lora',Georgia,serif" }}
                >
                  {learningSentences[i]}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
