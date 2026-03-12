"use client";

import { useTTS, getSentenceStarts } from "@/lib/useTTS";
import type { Lang } from "@/types";

const LANG_FLAG: Record<Lang, string> = {
  am: "🇪🇹",
  en: "🇺🇸",
  es: "🇲🇽",
};

const SPEEDS = [0.75, 1, 1.25] as const;

interface AudioPlayerProps {
  text: string;
  lang: Lang;
  onEnd?: () => void;
  /** Optional: render text with sentence highlighting; if not provided, no paragraph shown */
  renderHighlightedText?: (props: {
    currentSentenceIndex: number;
    sentenceStarts: number[];
  }) => React.ReactNode;
}

export function AudioPlayer({
  text,
  lang,
  onEnd,
  renderHighlightedText,
}: AudioPlayerProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    setRate,
    isPlaying,
    isPaused,
    isSupported,
    voicesReady,
    currentSentenceIndex,
  } = useTTS({
    onEnd,
    rate: 1,
  });

  const sentenceStarts = getSentenceStarts(text);

  const handlePlayPause = () => {
    if (!text.trim()) return;
    if (isPlaying) {
      if (isPaused) resume();
      else pause();
    } else {
      speak(text, lang);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRestart = () => {
    stop();
    if (text.trim()) speak(text, lang);
  };

  if (!isSupported) {
    return (
      <div
        className="rounded-2xl border p-5 text-center"
        style={{
          background: "rgba(26,26,78,0.5)",
          borderColor: "rgba(196,77,255,0.15)",
        }}
      >
        <p className="text-sm text-[rgba(200,180,255,0.7)]">
          Audio not supported on this browser. Try Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-5 shadow-lg"
      style={{
        background: "linear-gradient(145deg, rgba(26,26,78,0.6) 0%, rgba(45,27,105,0.4) 100%)",
        borderColor: "rgba(196,77,255,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden>
          {LANG_FLAG[lang]}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-[rgba(255,215,0,0.7)]">
          {lang === "am" ? "Amharic" : lang === "es" ? "Spanish" : "English"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!voicesReady || !text.trim()}
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50"
          style={{
            background: isPlaying && !isPaused
              ? "linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,140,0,0.2) 100%)"
              : "rgba(255,255,255,0.08)",
            borderColor: isPlaying && !isPaused ? "rgba(255,215,0,0.6)" : "rgba(196,77,255,0.3)",
            boxShadow: isPlaying && !isPaused
              ? "0 0 24px rgba(255,215,0,0.35)"
              : "0 4px 16px rgba(0,0,0,0.2)",
          }}
          aria-label={isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
        >
          {!isPlaying || isPaused ? "▶" : "⏸"}
        </button>

        {isPlaying && (
          <p className="text-sm font-semibold text-[rgba(255,215,0,0.9)]">
            🎙️ Listening...
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="py-2 px-3 rounded-xl text-xs font-bold border transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "#c9b8e8",
            }}
          >
            Stop
          </button>
          <button
            type="button"
            onClick={handleRestart}
            disabled={!text.trim()}
            className="py-2 px-3 rounded-xl text-xs font-bold border transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "#c9b8e8",
            }}
          >
            Restart
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[rgba(200,180,255,0.5)]">
            Speed
          </span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRate(s)}
              className="w-9 h-8 rounded-lg text-xs font-bold border transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(196,77,255,0.25)",
                color: "#c9b8e8",
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {renderHighlightedText && text.trim() && (
        <div
          className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]"
          style={{ fontFamily: "'Lora',Georgia,serif", fontSize: "clamp(14px,3.5vw,16px)", lineHeight: 1.85, color: "#e8e0ff" }}
        >
          {renderHighlightedText({
            currentSentenceIndex,
            sentenceStarts,
          })}
        </div>
      )}
    </div>
  );
}

/** Helper: split text into segments by sentence starts and highlight the current one */
export function highlightSentenceInText(
  text: string,
  sentenceStarts: number[],
  currentIndex: number
): React.ReactNode {
  if (!text.trim()) return null;
  const segments: { str: string; highlighted: boolean }[] = [];
  for (let i = 0; i < sentenceStarts.length; i++) {
    const start = sentenceStarts[i];
    const end = i < sentenceStarts.length - 1 ? sentenceStarts[i + 1] : text.length;
    const str = text.slice(start, end);
    if (str.trim()) {
      segments.push({ str, highlighted: i === currentIndex });
    }
  }
  if (segments.length === 0) return <span>{text}</span>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <span
            key={i}
            className="transition-all duration-300"
            style={{
              background: "linear-gradient(180deg, transparent 60%, rgba(255,215,0,0.2) 60%)",
              borderRadius: 2,
            }}
          >
            {seg.str}
          </span>
        ) : (
          <span key={i}>{seg.str}</span>
        )
      )}
    </>
  );
}
