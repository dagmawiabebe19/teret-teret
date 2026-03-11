"use client";

import { useState, useCallback } from "react";
import { getT } from "@/lib/constants";
import { parsedToPages } from "@/lib/parseStory";
import type { Lang } from "@/types";
import type { StoryPage } from "@/types";
import type { UserProgress } from "@/types";

interface DailyTeretCardProps {
  lang: Lang;
  progress: UserProgress | null;
  onOpenDailyStory: (payload: {
    pages: StoryPage[];
    illustrationPrompts: string[];
    childName: string;
    region: string;
    rawStory: string;
    isDailyTeret: true;
  }) => void;
}

export function DailyTeretCard({
  lang,
  progress,
  onOpenDailyStory,
}: DailyTeretCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openDaily = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/daily-teret");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load today's story.");
        return;
      }
      const parsed = data.parsed;
      const pages = parsed ? parsedToPages(parsed) : [];
      const illustrationPrompts = Array.isArray(parsed?.illustrationPrompts)
        ? parsed.illustrationPrompts
        : [];
      if (pages.length === 0) {
        setError("Story could not be displayed.");
        return;
      }
      onOpenDailyStory({
        pages,
        illustrationPrompts,
        childName: "",
        region: data.region ?? "Ethiopian highlands",
        rawStory: data.rawStory ?? "",
        isDailyTeret: true,
      });
    } catch {
      setError("Could not load today's story.");
    } finally {
      setLoading(false);
    }
  }, [onOpenDailyStory]);

  const t = getT(lang);
  const streak = progress?.streakCount ?? 0;

  return (
    <div
      className="rounded-[18px] p-4 mb-4 border transition-all duration-300"
      style={{
        background: "linear-gradient(145deg, rgba(255,215,0,0.06) 0%, rgba(196,77,255,0.04) 100%)",
        borderColor: "rgba(255,215,0,0.2)",
      }}
    >
      <h2 className="text-[17px] font-bold text-[#FFD700] mb-0.5" style={{ fontFamily: "'Nunito',sans-serif" }}>
        {t.dailyTeretTitle}
      </h2>
      <p className="text-[12px] text-[rgba(200,180,255,0.7)] mb-3">
        {t.dailyTeretSubtitle}
      </p>
      {progress != null && streak > 0 && (
        <p className="text-[11px] text-[rgba(255,215,0,0.85)] font-semibold mb-3">
          🔥 {t.streakDays(streak)}
        </p>
      )}
      {error && (
        <p className="text-[12px] text-[rgba(255,150,150,0.9)] mb-2" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={openDaily}
        disabled={loading}
        className="w-full py-3 rounded-[14px] border-none text-[14px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-70"
        style={{
          background: "linear-gradient(135deg, rgba(196,77,255,0.25) 0%, rgba(255,215,0,0.2) 100%)",
          color: "#fff",
          fontFamily: "'Nunito',sans-serif",
          boxShadow: "0 2px 12px rgba(196,77,255,0.2)",
        }}
      >
        {loading ? "…" : `📖 ${t.readTonightBtn}`}
      </button>
    </div>
  );
}
