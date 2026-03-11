"use client";

import { getT, AGES, REGIONS, TRAITS_EN, ALLOWED_STORY_INSPIRATIONS } from "@/lib/constants";
import type { Lang } from "@/types";

const btnStyle = (
  active: boolean,
  color: "gold" | "purple" = "gold"
): React.CSSProperties => ({
  background: active
    ? color === "gold"
      ? "linear-gradient(135deg,#FF8C00,#FFD700)"
      : "linear-gradient(135deg,#7b2d8b,#c44dff)"
    : "rgba(255,255,255,0.07)",
  border: `1.5px solid ${
    active
      ? color === "gold"
        ? "#FFD700"
        : "#c44dff"
      : "rgba(255,255,255,0.13)"
  }`,
  borderRadius: 20,
  padding: "7px 13px",
  color: active ? (color === "gold" ? "#1a1a4e" : "#fff") : "#c9b8e8",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "'Nunito',sans-serif",
});

interface StoryFormProps {
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
  storyInspiration: string;
  setStoryInspiration: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error: string;
}

export function StoryForm({
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
  storyInspiration,
  setStoryInspiration,
  onSubmit,
  disabled,
  error,
}: StoryFormProps) {
  const t = getT(lang);

  const handleTraitSelect = (idx: number) => {
    const next = traitIdx === idx ? null : idx;
    setTraitIdx(next);
    setTrait(next === null ? "" : TRAITS_EN[idx] ?? "");
  };

  return (
    <div className="rounded-[26px] border p-6 shadow-lg backdrop-blur-xl" style={{
      background: "rgba(255,255,255,0.07)",
      borderColor: "rgba(255,255,255,0.11)",
      boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
    }}>
      <div className="mb-4">
        <label
          className="flex items-center gap-2 text-[13px] font-extrabold text-[#FFD700] mb-2"
          htmlFor="child-name"
        >
          {t.nameLabel}
        </label>
        <input
          id="child-name"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={t.namePlaceholder}
          className="w-full rounded-[13px] py-3 px-4 text-[15px] font-bold outline-none border"
          style={{
            background: "rgba(255,255,255,0.09)",
            borderColor: "rgba(255,215,0,0.28)",
            color: "#fff",
            fontFamily: "'Nunito',sans-serif",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#FFD700";
            e.target.style.background = "rgba(255,255,255,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,215,0,0.28)";
            e.target.style.background = "rgba(255,255,255,0.09)";
          }}
          maxLength={80}
          aria-required
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-[13px] font-extrabold text-[#FFD700] mb-2">
          {t.ageLabel}
        </label>
        <div className="flex gap-2">
          {AGES.map((a, i) => (
            <button
              key={a.value}
              type="button"
              className="btn-hover flex-1 text-center rounded-xl border py-2 px-3 text-xs font-bold cursor-pointer transition-all"
              style={btnStyle(age === a.value, "gold")}
              onClick={() => setAge(a.value)}
              aria-pressed={age === a.value}
            >
              {t.ageOpts[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-[13px] font-extrabold text-[#FFD700] mb-2">
          {t.traitLabel}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {t.traits.map((tr, i) => (
            <button
              key={i}
              type="button"
              className="btn-hover rounded-xl border py-2 px-3 text-xs font-bold cursor-pointer transition-all"
              style={btnStyle(traitIdx === i, "gold")}
              onClick={() => handleTraitSelect(i)}
              aria-pressed={traitIdx === i}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-[13px] font-extrabold text-[#FFD700] mb-2">
          {t.regionLabel}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.name}
              type="button"
              className="btn-hover rounded-xl border py-2 px-3 text-xs font-bold cursor-pointer transition-all"
              style={btnStyle(region === r.name, "purple")}
              onClick={() => setRegion(region === r.name ? "" : r.name)}
              aria-pressed={region === r.name}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label
          htmlFor="story-inspiration"
          className="flex items-center gap-2 text-[13px] font-extrabold text-[#FFD700] mb-2"
        >
          {t.inspirationLabel}
        </label>
        <select
          id="story-inspiration"
          value={storyInspiration}
          onChange={(e) => setStoryInspiration(e.target.value)}
          className="w-full rounded-[13px] py-3 px-4 text-[14px] font-bold outline-none border cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.09)",
            borderColor: "rgba(255,215,0,0.28)",
            color: "#fff",
            fontFamily: "'Nunito',sans-serif",
          }}
          aria-label={t.inspirationLabel}
        >
          {ALLOWED_STORY_INSPIRATIONS.map((value, i) => (
            <option key={value} value={value} style={{ background: "#1a1a4e", color: "#e8e0ff" }}>
              {t.inspirationOpts[i]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-[#ff8080] text-[13px] mb-3 font-bold" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="gen-btn w-full py-4 rounded-[15px] border-none text-[17px] font-black font-fredoka tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-80 disabled:transform-none"
        style={{
          background: childName.trim() && !disabled
            ? "linear-gradient(135deg,#FF8C00,#FFD700)"
            : "rgba(255,255,255,0.09)",
          color: childName.trim() && !disabled ? "#1a1a4e" : "rgba(255,255,255,0.25)",
          boxShadow: childName.trim() && !disabled
            ? "0 4px 20px rgba(255,140,0,0.38)"
            : "none",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        aria-busy={disabled}
      >
        {t.generateBtn}
      </button>
    </div>
  );
}
