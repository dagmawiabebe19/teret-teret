"use client";

import { ALLOWED_STORY_CATEGORIES, CATEGORY_EMOJI } from "@/lib/constants";
import { getRegionLabel } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import type { Lang, LibraryStory, StoryCategory } from "@/types";

const LANG_LABEL: Record<Lang, string> = { am: "አማ", en: "EN", es: "ES" };

function categoryLabel(cat: StoryCategory | null, t: ReturnType<typeof useTranslation>["t"]): string {
  if (!cat) return "—";
  const idx = ALLOWED_STORY_CATEGORIES.indexOf(cat);
  return idx >= 0 ? t.categoryOpts[idx] : cat;
}

interface StoryLibraryGridProps {
  lang: Lang;
  stories: LibraryStory[];
  filter: "all" | "favorites";
  onFilterChange: (f: "all" | "favorites") => void;
  onOpen: (story: LibraryStory) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
}

export function StoryLibraryGrid({
  lang,
  stories,
  filter,
  onFilterChange,
  onOpen,
  onToggleFavorite,
  onDelete,
}: StoryLibraryGridProps) {
  const { t } = useTranslation(lang);
  const filtered =
    filter === "favorites" ? stories.filter((s) => s.isFavorite) : stories;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className="py-2 px-4 rounded-xl text-[12px] font-bold border transition-all"
          style={{
            background: filter === "all" ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
            borderColor: filter === "all" ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)",
            color: filter === "all" ? "#FFD700" : "#c9b8e8",
          }}
        >
          {t.allStories}
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("favorites")}
          className="py-2 px-4 rounded-xl text-[12px] font-bold border transition-all"
          style={{
            background: filter === "favorites" ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
            borderColor: filter === "favorites" ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)",
            color: filter === "favorites" ? "#FFD700" : "#c9b8e8",
          }}
        >
          {t.favorites} ({stories.filter((s) => s.isFavorite).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-[20px] border p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,215,0,0.1)",
          }}
        >
          <p className="text-[15px] text-[rgba(200,180,255,0.75)] leading-relaxed">
            {filter === "favorites" ? t.favoritesEmpty : t.libraryEmptyPrompt}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((s) => {
            const cat = (s.category as StoryCategory | null) ?? null;
            return (
              <div
                key={s.id}
                className="rounded-[16px] border overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(196,77,255,0.18)",
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(s)}
                  className="w-full text-left p-4 pb-2"
                >
                  <p className="text-[15px] font-extrabold text-[#FFD700] mb-1">
                    {t.storyForName(s.childName)}
                  </p>
                  <p className="text-[12px] text-[#c9b8e8] mb-1">
                    🏔️ {getRegionLabel(s.region, lang)}
                  </p>
                  <p className="text-[11px] text-[rgba(200,180,255,0.65)]">
                    {cat ? `${CATEGORY_EMOJI[cat]} ${categoryLabel(cat, t)}` : "—"}
                    {" · "}
                    {LANG_LABEL[(s.languageDefault as Lang) ?? "en"]}
                    {" · "}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <div className="flex items-center justify-end gap-1 px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(s.id, !s.isFavorite)}
                    className="p-2 rounded-lg text-lg"
                    aria-label={s.isFavorite ? t.removeFavoriteAria : t.addFavoriteAria}
                  >
                    {s.isFavorite ? "❤️" : "🤍"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="p-2 rounded-lg text-[14px] text-[rgba(255,150,150,0.9)]"
                    aria-label={t.deleteStoryAria}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
