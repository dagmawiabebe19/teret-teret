"use client";

import { getRegionLabel } from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import type { LibraryStory } from "@/types";
import type { Lang } from "@/types";

interface RecentlyPlayedProps {
  lang: Lang;
  stories: LibraryStory[];
  onOpen: (story: LibraryStory) => void;
}

export function RecentlyPlayed({ lang, stories, onOpen }: RecentlyPlayedProps) {
  const { t } = useTranslation(lang);
  const recent = stories.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-[13px] font-bold text-[#FFD700] mb-2 px-1">{t.recentlyPlayedTitle}</h3>
      <div className="flex flex-col gap-2">
        {recent.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onOpen(s)}
            className="w-full text-left rounded-[14px] border py-3 px-3 transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(196,77,255,0.2)",
            }}
          >
            <p className="text-[13px] font-extrabold text-[#FFD700]">
              {t.storyForName(s.childName)}
            </p>
            <p className="text-[11px] text-[rgba(200,180,255,0.55)] mt-0.5">
              {getRegionLabel(s.region, lang)} · {new Date(s.createdAt).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
