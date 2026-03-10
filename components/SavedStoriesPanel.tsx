"use client";

import { UI } from "@/lib/constants";
import type { Lang } from "@/types";

export interface SavedStoryItem {
  id: string;
  name: string;
  region: string;
  date: string;
  content: string;
  parsedPages?: { am: string; en: string; es: string }[];
  illustrationPrompts?: string[];
}

interface SavedStoriesPanelProps {
  lang: Lang;
  stories: SavedStoryItem[];
  open: boolean;
  onToggle: () => void;
  onOpenStory: (story: SavedStoryItem) => void;
  onDelete?: (id: string) => void;
  isGuest?: boolean;
}

export function SavedStoriesPanel({
  lang,
  stories,
  open,
  onToggle,
  onOpenStory,
  isGuest = false,
}: SavedStoriesPanelProps) {
  const t = UI[lang];

  if (stories.length === 0) {
    return (
      <div
        className="rounded-[18px] p-4 mb-3 border transition-opacity duration-300"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,215,0,0.08)",
        }}
      >
        <p className="text-[13px] text-[rgba(200,180,255,0.6)] text-center">
          {t.noSavedStories}
        </p>
        {isGuest && (
          <p className="text-[11px] text-[rgba(200,180,255,0.45)] text-center mt-2">
            {t.signInToSync}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-2.5 rounded-[14px] border text-[13px] font-extrabold cursor-pointer mb-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,215,0,0.16)",
          color: "#FFD700",
          fontFamily: "'Nunito',sans-serif",
        }}
        aria-expanded={open}
        aria-controls="saved-stories-list"
      >
        {t.savedBtn} ({stories.length})
      </button>
      {open && (
        <div
          id="saved-stories-list"
          className="rounded-[18px] p-3 mb-3 border"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,215,0,0.1)",
          }}
        >
          {stories.map((s) => (
            <div
              key={s.id}
              className="py-2 border-b border-[rgba(255,255,255,0.05)] cursor-pointer last:border-0"
              onClick={() => onOpenStory(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenStory(s);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open story for ${s.name}`}
            >
              <p className="text-[#FFD700] text-[13px] font-extrabold">
                ⭐ {s.name}&apos;s story
              </p>
              <p className="text-[rgba(255,255,255,0.3)] text-[11px]">
                {s.region} · {s.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
