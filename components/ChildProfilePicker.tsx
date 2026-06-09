"use client";

import { useTranslation } from "@/lib/useTranslation";
import { TRAITS_EN } from "@/lib/constants";
import type { ChildProfile } from "@/types";
import type { Lang } from "@/types";

interface ChildProfilePickerProps {
  lang: Lang;
  profiles: ChildProfile[];
  selectedId: string | null;
  onSelect: (profile: ChildProfile | null) => void;
  onAddChild: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function ChildProfilePicker({
  lang,
  profiles,
  selectedId,
  onSelect,
  onAddChild,
  isPremium = true,
  onUpgrade,
}: ChildProfilePickerProps) {
  const { t } = useTranslation(lang);

  if (!isPremium) {
    return (
      <div
        className="rounded-[18px] p-4 mb-4 border"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,215,0,0.15)",
        }}
      >
        <p className="text-[13px] font-bold text-[#FFD700] mb-2">{t.whoIsStoryFor}</p>
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full py-2.5 rounded-xl border text-[12px] font-bold text-[#c9b8e8] hover:bg-[rgba(255,215,0,0.08)] transition-colors"
          style={{ borderColor: "rgba(255,215,0,0.35)" }}
        >
          {t.upgradeForChildProfiles}
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div
        className="rounded-[18px] p-4 mb-4 border"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,215,0,0.15)",
        }}
      >
        <p className="text-[13px] font-bold text-[#FFD700] mb-2">{t.whoIsStoryFor}</p>
        <button
          type="button"
          onClick={onAddChild}
          className="w-full py-2.5 rounded-xl border border-dashed border-[rgba(255,215,0,0.35)] text-[12px] font-bold text-[#c9b8e8] hover:bg-[rgba(255,255,255,0.05)]"
        >
          + {t.addChild}
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-[18px] p-4 mb-4 border"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,215,0,0.15)",
      }}
    >
      <p className="text-[13px] font-bold text-[#FFD700] mb-3">{t.whoIsStoryFor}</p>
      <div className="flex flex-wrap gap-2">
        {profiles.map((p) => {
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(active ? null : p)}
              className="flex items-center gap-2 py-2 px-3 rounded-xl border text-left transition-all"
              style={{
                background: active ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.06)",
                borderColor: active ? "rgba(255,215,0,0.45)" : "rgba(255,255,255,0.12)",
              }}
              aria-pressed={active}
            >
              <span className="text-xl" aria-hidden>{p.avatarEmoji}</span>
              <span className="text-[12px] font-bold text-[#e8e0ff]">{p.name}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAddChild}
          className="py-2 px-3 rounded-xl border border-dashed text-[12px] font-bold text-[rgba(200,180,255,0.6)]"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          + {t.addChild}
        </button>
      </div>
    </div>
  );
}

/** Apply child profile fields to story form state */
export function applyChildToForm(
  profile: ChildProfile,
  setters: {
    setChildName: (v: string) => void;
    setAge: (v: string) => void;
    setTrait: (v: string) => void;
    setTraitIdx: (v: number | null) => void;
  }
) {
  setters.setChildName(profile.name);
  setters.setAge(profile.ageGroup);
  if (profile.trait) {
    const idx = TRAITS_EN.indexOf(profile.trait);
    setters.setTrait(profile.trait);
    setters.setTraitIdx(idx >= 0 ? idx : null);
  } else {
    setters.setTrait("");
    setters.setTraitIdx(null);
  }
}

export const AVATAR_EMOJIS = ["👧", "👦", "🧒", "👶", "🦁", "🐯", "🦊", "🌟", "✨", "🦋"];
