"use client";

import { useState } from "react";
import { getT } from "@/lib/constants";
import type { Lang } from "@/types";

export interface SavedStoryItem {
  id: string;
  name: string;
  region: string;
  date: string;
  content: string;
  parsedPages?: { am: string; en: string; es: string }[];
  illustrationPrompts?: string[];
  isFavorite?: boolean;
}

type LibraryFilter = "all" | "favorites";

interface SavedStoriesPanelProps {
  lang: Lang;
  stories: SavedStoryItem[];
  open: boolean;
  onToggle: () => void;
  onOpenStory: (story: SavedStoryItem) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void | Promise<void>;
  isGuest?: boolean;
}

export function SavedStoriesPanel({
  lang,
  stories,
  open,
  onToggle,
  onOpenStory,
  onToggleFavorite,
  isGuest = false,
}: SavedStoriesPanelProps) {
  const t = getT(lang);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const filtered =
    filter === "favorites"
      ? stories.filter((s) => s.isFavorite)
      : stories;

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
        {t.myLibrary} ({stories.length})
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
          {stories.length > 0 && (
            <div className="flex gap-1 mb-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold"
                style={{
                  background: filter === "all" ? "rgba(255,215,0,0.15)" : "transparent",
                  color: filter === "all" ? "#FFD700" : "rgba(255,255,255,0.5)",
                }}
              >
                {t.allStories}
              </button>
              <button
                type="button"
                onClick={() => setFilter("favorites")}
                className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold"
                style={{
                  background: filter === "favorites" ? "rgba(255,215,0,0.15)" : "transparent",
                  color: filter === "favorites" ? "#FFD700" : "rgba(255,255,255,0.5)",
                }}
              >
                {t.favorites} ({stories.filter((s) => s.isFavorite).length})
              </button>
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="text-[12px] text-[rgba(200,180,255,0.5)] text-center py-2">
              {filter === "favorites" ? t.favoritesEmpty : t.noSavedStories}
            </p>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="py-2 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2 last:border-0"
              >
                {onToggleFavorite && !isGuest ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(s.id, !s.isFavorite);
                    }}
                    className="flex-shrink-0 p-1 rounded text-[16px] focus:outline-none"
                    aria-label={s.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {s.isFavorite ? "⭐" : "☆"}
                  </button>
                ) : null}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
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
                    {s.name}&apos;s story
                  </p>
                  <p className="text-[rgba(255,255,255,0.3)] text-[11px]">
                    {s.region} · {s.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
