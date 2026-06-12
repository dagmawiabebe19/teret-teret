"use client";

import {
  AGES,
  FORM_AGE_EMOJIS,
  FORM_REGIONS,
  FORM_TRAITS,
  FORM_STORY_CATEGORIES,
  TRAITS_EN,
  type FormStoryCategory,
} from "@/lib/constants";
import { ScrollPillRow, PillButton } from "@/components/ScrollPillRow";
import { useTranslation } from "@/lib/useTranslation";
import { trackGenerateStoryCta } from "@/lib/analytics";
import type { Lang } from "@/types";

const primaryBtnStyle = (enabled: boolean): React.CSSProperties => ({
  background: enabled
    ? "linear-gradient(135deg,#FF8C00,#FFD700)"
    : "rgba(255,255,255,0.09)",
  color: enabled ? "#1a0533" : "rgba(255,255,255,0.25)",
  boxShadow: enabled ? "0 4px 28px rgba(255,140,0,0.4)" : "none",
});

interface QuickStoryFormProps {
  lang: Lang;
  childName: string;
  setChildName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  traitIdx: number | null;
  setTraitIdx: (v: number | null) => void;
  setTrait: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  category: FormStoryCategory;
  setCategory: (v: FormStoryCategory) => void;
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
  traitIdx,
  setTraitIdx,
  setTrait,
  region,
  setRegion,
  category,
  setCategory,
  onSubmit,
  disabled,
  error,
}: QuickStoryFormProps) {
  const { t } = useTranslation(lang);

  const handleTraitSelect = (idx: number) => {
    setTraitIdx(idx);
    setTrait(TRAITS_EN[idx] ?? "");
  };

  return (
    <div
      id="create"
      className="rounded-[28px] border p-6 sm:p-7 scroll-mt-24 mb-12"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.12)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      }}
    >
      <h2 className="font-fredoka text-[#FFD700] text-[22px] sm:text-[26px] text-center mb-6">
        {t.formTitle}
      </h2>

      <div className="mb-6">
        <input
          id="child-name-quick"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={t.formNamePlaceholder}
          autoFocus
          enterKeyHint="go"
          autoComplete="given-name"
          className="w-full rounded-[20px] py-4 px-5 text-[16px] font-medium outline-none border min-h-[60px]"
          style={{
            background: "rgba(255,255,255,0.09)",
            borderColor: "rgba(255,215,0,0.35)",
            color: "#fff",
          }}
          maxLength={80}
          aria-required
        />
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          {AGES.map((a, i) => {
            const active = age === a.value;
            return (
              <button
                key={a.value}
                type="button"
                className="flex-1 min-h-[72px] rounded-[20px] border-2 text-center transition-all duration-200"
                style={{
                  background: active ? "rgba(255,215,0,0.14)" : "rgba(255,255,255,0.06)",
                  borderColor: active ? "#FFD700" : "rgba(255,255,255,0.14)",
                  color: active ? "#FFD700" : "#d4c4f0",
                  boxShadow: active ? "0 0 20px rgba(255,215,0,0.15)" : "none",
                }}
                onClick={() => setAge(a.value)}
                aria-pressed={active}
              >
                <span className="text-2xl block mb-1" aria-hidden>
                  {FORM_AGE_EMOJIS[i]}
                </span>
                <span className="text-[14px] font-medium">{t.ageOpts[i]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[14px] font-medium text-[#e0d4ff] mb-2">{t.formSettingLabel}</p>
        <ScrollPillRow hint={t.scrollPillHint}>
          {FORM_REGIONS.map((r, i) => (
            <PillButton
              key={r.apiName}
              active={region === r.apiName}
              emoji={r.emoji}
              label={t.formRegionOpts[i]}
              onClick={() => setRegion(r.apiName)}
            />
          ))}
        </ScrollPillRow>
      </div>

      <div className="mb-5">
        <p className="text-[14px] font-medium text-[#e0d4ff] mb-2">{t.formTraitLabel}</p>
        <ScrollPillRow hint={t.scrollPillHint}>
          {FORM_TRAITS.map((tr, i) => (
            <PillButton
              key={tr.traitIndex}
              active={traitIdx === tr.traitIndex}
              emoji={tr.emoji}
              label={t.formTraitOpts[i]}
              onClick={() => handleTraitSelect(tr.traitIndex)}
            />
          ))}
        </ScrollPillRow>
      </div>

      <div className="mb-6">
        <p className="text-[14px] font-medium text-[#e0d4ff] mb-2">{t.formCategoryLabel}</p>
        <ScrollPillRow hint={t.scrollPillHint}>
          {FORM_STORY_CATEGORIES.map((cat, i) => (
            <PillButton
              key={cat.id}
              active={category === cat.id}
              emoji={cat.emoji}
              label={t.formCategoryOpts[i]}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </ScrollPillRow>
      </div>

      {error && (
        <p className="text-[#ff9a9a] text-[14px] mb-4 font-medium" role="alert">
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
        className="w-full min-h-[72px] py-4 rounded-[22px] border-none text-[18px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-80"
        style={primaryBtnStyle(Boolean(childName.trim() && !disabled))}
        aria-busy={disabled}
      >
        {t.formSubmit}
      </button>
    </div>
  );
}
