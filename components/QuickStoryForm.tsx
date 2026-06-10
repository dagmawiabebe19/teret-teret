"use client";

import { useState } from "react";
import {
  AGES,
  REGIONS,
  TRAITS_EN,
  ALLOWED_STORY_CATEGORIES,
  ALLOWED_STORY_GOALS,
  CATEGORY_EMOJI,
} from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang, StoryCategory } from "@/types";

const btnStyle = (active: boolean, color: "gold" | "purple" = "gold"): React.CSSProperties => ({
  background: active
    ? color === "gold"
      ? "linear-gradient(135deg,#FF8C00,#FFD700)"
      : "linear-gradient(135deg,#7b2d8b,#c44dff)"
    : "rgba(255,255,255,0.07)",
  border: `1.5px solid ${active ? (color === "gold" ? "#FFD700" : "#c44dff") : "rgba(255,255,255,0.13)"}`,
  borderRadius: 20,
  padding: "7px 13px",
  color: active ? (color === "gold" ? "#1a1a4e" : "#fff") : "#c9b8e8",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "'Nunito',sans-serif",
});

interface QuickStoryFormProps {
  lang: Lang;
  childName: string;
  setChildName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  trait: string;
  traitIdx: number | null;
  setTrait: (v: string) => void;
  setTraitIdx: (v: number | null) => void;
  region: string;
  setRegion: (v: string) => void;
  category: StoryCategory;
  setCategory: (v: StoryCategory) => void;
  storyGoal: string;
  setStoryGoal: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: string;
}

export function QuickStoryForm({
  lang,
  childName,
  setChildName,
  age,
  setAge,
  trait,
  traitIdx,
  setTrait,
  setTraitIdx,
  region,
  setRegion,
  category,
  setCategory,
  storyGoal,
  setStoryGoal,
  onSubmit,
  disabled,
  error,
}: QuickStoryFormProps) {
  const { t } = useTranslation(lang);
  const [expanded, setExpanded] = useState(false); // collapsed by default

  const handleTraitSelect = (idx: number) => {
    const next = traitIdx === idx ? null : idx;
    setTraitIdx(next);
    setTrait(next === null ? "" : TRAITS_EN[idx] ?? "");
  };

  return (
    <div
      id="create"
      className="rounded-[26px] border p-6 shadow-lg backdrop-blur-xl scroll-mt-24"
      style={{
        background: "rgba(255,255,255,0.07)",
        borderColor: "rgba(255,255,255,0.11)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
      }}
    >
      <div className="mb-5">
        <label
          htmlFor="child-name-quick"
          className="block text-[13px] font-extrabold text-[#FFD700] mb-2"
        >
          {t.nameLabel}
        </label>
        <input
          id="child-name-quick"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={t.quickNamePlaceholder}
          className="w-full rounded-[16px] py-4 px-4 text-[18px] font-bold outline-none border"
          style={{
            background: "rgba(255,255,255,0.09)",
            borderColor: "rgba(255,215,0,0.35)",
            color: "#fff",
            fontFamily: "'Nunito',sans-serif",
          }}
          maxLength={80}
          aria-required
        />
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-extrabold text-[#FFD700] mb-2">
          {t.ageLabel}
        </label>
        <div className="flex gap-2">
          {AGES.map((a, i) => (
            <button
              key={a.value}
              type="button"
              className="btn-hover flex-1 text-center rounded-xl border py-3 px-2 text-sm font-black cursor-pointer transition-all"
              style={btnStyle(age === a.value, "gold")}
              onClick={() => setAge(a.value)}
              aria-pressed={age === a.value}
            >
              {t.ageOpts[i]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-[#ff8080] text-[13px] mb-3 font-bold" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          trackGenerateStoryCta("form");
          onSubmit();
        }}
        disabled={disabled}
        className="gen-btn w-full min-h-[56px] py-4 rounded-[15px] border-none text-[18px] font-black font-fredoka tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-80"
        style={{
          background:
            childName.trim() && !disabled
              ? "linear-gradient(135deg,#FF8C00,#FFD700)"
              : "rgba(255,255,255,0.09)",
          color: childName.trim() && !disabled ? "#1a0533" : "rgba(255,255,255,0.25)",
          boxShadow:
            childName.trim() && !disabled ? "0 4px 24px rgba(255,140,0,0.4)" : "none",
        }}
        aria-busy={disabled}
      >
        {t.landingGenerateButton}
      </button>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-2 text-[12px] font-bold text-[rgba(200,180,255,0.55)] hover:text-[#c9b8e8] transition-colors"
        aria-expanded={expanded}
      >
        {t.customizeStoryToggle} {expanded ? "▴" : "▾"}
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: expanded ? 1200 : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] mt-2 space-y-4">
          <div>
            <label className="block text-[12px] font-extrabold text-[#FFD700] mb-2">
              {t.categoryLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_STORY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="rounded-xl border py-2 px-3 text-xs font-bold"
                  style={btnStyle(category === cat, "purple")}
                  onClick={() => setCategory(cat)}
                >
                  <span aria-hidden>{CATEGORY_EMOJI[cat]}</span>{" "}
                  {t.categoryOpts[ALLOWED_STORY_CATEGORIES.indexOf(cat)]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-extrabold text-[#FFD700] mb-2">
              {t.traitLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {t.traits.slice(0, 8).map((tr, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-xl border py-1.5 px-2.5 text-[11px] font-bold"
                  style={btnStyle(traitIdx === i, "gold")}
                  onClick={() => handleTraitSelect(i)}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-extrabold text-[#FFD700] mb-2">
              {t.regionLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.slice(0, 8).map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  className="rounded-xl border py-1.5 px-2.5 text-[11px] font-bold"
                  style={btnStyle(region === r.name, "purple")}
                  onClick={() => setRegion(region === r.name ? "" : r.name)}
                >
                  {t.regionNames[i]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="story-goal-quick" className="block text-[12px] font-extrabold text-[#FFD700] mb-2">
              {t.storyGoalLabel}
            </label>
            <select
              id="story-goal-quick"
              value={storyGoal}
              onChange={(e) => setStoryGoal(e.target.value)}
              className="w-full rounded-xl py-2.5 px-3 text-sm font-bold border cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.09)",
                borderColor: "rgba(255,215,0,0.28)",
                color: "#fff",
              }}
            >
              <option value="">{t.storyGoalNone}</option>
              {ALLOWED_STORY_GOALS.map((goal, i) => (
                <option key={goal} value={goal}>
                  {t.storyGoalOpts[i]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
