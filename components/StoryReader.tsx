"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Stars } from "./Stars";
import { Fireflies } from "./Fireflies";
import { Campfire } from "./Campfire";
import { LangToggle } from "./LangToggle";
import { AudioPlayer, highlightSentenceInText } from "./AudioPlayer";
import { getT } from "@/lib/constants";
import type { Lang } from "@/types";
import type { StoryPage } from "@/types";

interface StoryReaderProps {
  pages: StoryPage[];
  illustrationPrompts?: string[];
  childName: string;
  region: string;
  rawStory: string;
  onNew: () => void;
  onAnother: () => void;
  onSave: () => void;
  onCopy: () => void;
  onShare?: () => void;
  onExport?: () => void;
  copied: boolean;
  saved: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  /** When true, this is the Daily Teret; end screen shows completion message and calls onCompleteDailyTeret once */
  isDailyTeret?: boolean;
  /** Called once when user reaches end screen of Daily Teret (for streak/XP) */
  onCompleteDailyTeret?: () => void;
  /** "free" | "premium" | null — used to gate audio beyond first 2 pages */
  subscriptionStatus?: "free" | "premium" | null;
  /** Optional: when free user tries to listen past page 2 */
  onShowPaywall?: () => void;
}

export function StoryReader({
  pages,
  illustrationPrompts = [],
  childName,
  region,
  rawStory,
  onNew,
  onAnother,
  onSave,
  onCopy,
  onShare,
  onExport,
  copied,
  saved,
  lang,
  setLang,
  isDailyTeret = false,
  onCompleteDailyTeret,
  subscriptionStatus = null,
  onShowPaywall,
}: StoryReaderProps) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"fwd" | "bck">("fwd");
  const [animKey, setAnimKey] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [localSaved, setLocalSaved] = useState(saved);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const isPremium = subscriptionStatus === "premium";
  const audioAllowedThisPage = isPremium || page < 2;

  useEffect(() => {
    if (showEnd && isDailyTeret && onCompleteDailyTeret && !dailyCompleted) {
      setDailyCompleted(true);
      onCompleteDailyTeret();
    }
  }, [showEnd, isDailyTeret, onCompleteDailyTeret, dailyCompleted]);

  const t = getT(lang);
  const total = pages.length;
  const progress = total > 0 ? (page + 1) / total : 0;
  const current = pages[page] || { am: "", en: "", es: "" };
  const text =
    lang === "am"
      ? current.am
      : lang === "en"
        ? current.en || current.am
        : current.es || current.am;
  const illustrationPrompt = illustrationPrompts[page];

  const goNext = useCallback(() => {
    if (page < total - 1) {
      setDir("fwd");
      setAnimKey((k) => k + 1);
      setPage((p) => p + 1);
    } else setShowEnd(true);
  }, [page, total]);

  const goPrev = useCallback(() => {
    if (page > 0) {
      setDir("bck");
      setAnimKey((k) => k + 1);
      setPage((p) => p - 1);
      setShowEnd(false);
    }
  }, [page]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  const topBar = (
    <div
      className="relative z-[10] flex items-center justify-between py-3 px-4 border-b border-[rgba(255,215,0,0.07)]"
      style={{ paddingBottom: 10 }}
    >
      <button
        type="button"
        onClick={onNew}
        className="bg-transparent border-none text-[rgba(200,180,255,0.4)] text-xs font-bold cursor-pointer"
        style={{ fontFamily: "'Nunito',sans-serif" }}
      >
        {t.exitBtn}
      </button>
      <button
        type="button"
        onClick={() => setAudioMode((m) => !m)}
        className="py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all"
        style={{
          background: audioMode ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.06)",
          borderColor: audioMode ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.12)",
          color: audioMode ? "#FFD700" : "rgba(200,180,255,0.7)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        {audioMode ? "📖 Read" : "🎧 Listen"}
      </button>
      <LangToggle lang={lang} setLang={setLang} />
      <p
        className="text-[11px] font-bold text-[rgba(200,180,255,0.35)]"
        style={{ fontFamily: "'Nunito',sans-serif" }}
      >
        {page + 1} / {total}
      </p>
    </div>
  );

  const readerBg =
    "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 30%,#2d1b69 65%,#3d1580 100%)";

  if (showEnd) {
    return (
      <div
        className="fixed inset-0 z-[50] flex flex-col overflow-hidden"
        style={{ background: readerBg }}
      >
        <Stars />
        <Fireflies />
        {topBar}
        <div
          className="flex-1 flex flex-col items-center justify-center p-7 relative z-[5]"
          style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
        >
          <div className="text-center mb-6">
            <div className="text-[50px] mb-3" aria-hidden>🌙</div>
            {isDailyTeret && (
              <p
                className="text-[15px] text-[#FFD700] font-bold mb-2 px-2"
                style={{ fontFamily: "'Nunito',sans-serif" }}
              >
                ✨ {t.completedTonightTeret}
              </p>
            )}
            <p
              className="text-[19px] text-[#FFD700] font-bold mb-1"
              style={{ fontFamily: "'Lora',Georgia,serif" }}
            >
              ተረቱ ሄደ ዘንቢሉ መጣ
            </p>
            <p
              className="text-[13px] text-[rgba(200,180,255,0.6)] italic mb-5"
              style={{ fontFamily: "'Lora',Georgia,serif" }}
            >
              {t.endSub}
            </p>
            <p
              className="font-fredoka text-[20px] text-[#c9b8e8]"
            >
              {t.endTitle}{childName ? `, ${childName} ` : " "}🌟
            </p>
          </div>
          <div className="mb-6">
            <Campfire size={1.1} />
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="py-3 px-2 rounded-[14px] text-xs font-bold cursor-pointer border transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.13)",
                  color: "#c9b8e8",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                {copied ? t.copiedBtn : t.copyBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave();
                  setLocalSaved(true);
                }}
                className="py-3 px-2 rounded-[14px] text-xs font-bold cursor-pointer border transition-all duration-200"
                style={{
                  background: localSaved ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.07)",
                  borderColor: localSaved ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.13)",
                  color: "#FFD700",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                {localSaved ? t.savedConfirm : t.saveBtn}
              </button>
              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className="col-span-2 py-3 rounded-[14px] text-xs font-bold cursor-pointer border transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: "rgba(255,255,255,0.13)",
                    color: "#c9b8e8",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  📤 {t.shareTeretBtn}
                </button>
              )}
              {onExport && (
                <button
                  type="button"
                  onClick={onExport}
                  className="col-span-2 py-3 rounded-[14px] text-xs font-bold cursor-pointer border transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: "rgba(255,255,255,0.13)",
                    color: "#c9b8e8",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  📄 Export .txt
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onAnother}
              className="py-4 rounded-[14px] border-none text-[15px] font-black cursor-pointer font-fredoka text-[#1a1a4e] transition-transform duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#FF8C00,#FFD700)",
                boxShadow: "0 4px 18px rgba(255,140,0,0.35)",
              }}
            >
              {t.anotherBtn}
            </button>
            <button
              type="button"
              onClick={onNew}
              className="py-3 rounded-[14px] border text-xs font-bold cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              style={{
                background: "transparent",
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              {t.homeBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="tap-zone fixed inset-0 z-[50] flex flex-col overflow-hidden"
      style={{ background: readerBg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Stars />
      <Fireflies />
      {topBar}
      <div
        className="h-0.5 bg-[rgba(255,255,255,0.05)] z-[10] relative"
      >
        <div
          className="h-full transition-[width] duration-300"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg,#c44dff,#FFD700)",
            boxShadow: "0 0 8px rgba(196,77,255,0.55)",
          }}
        />
      </div>
      <div className="text-center pt-2 relative z-[10]">
        <p
          className="text-[11px] text-[rgba(200,180,255,0.35)] italic"
          style={{ fontFamily: "'Lora',Georgia,serif" }}
        >
          🏔️ {region || "Ethiopian highlands"}
        </p>
      </div>
      <div
        className="flex-1 flex items-center justify-center py-3 px-6 relative z-[5] overflow-hidden"
        style={{ paddingTop: 12, paddingBottom: 6 }}
      >
        <div
          key={animKey}
          className={`${dir === "fwd" ? "page-fwd" : "page-bck"} transition-opacity duration-300`}
          style={{ width: "100%", maxWidth: 520, textAlign: "center" }}
        >
          {/* Illustration card */}
          <div
            className="mb-5 rounded-[14px] overflow-hidden border transition-all duration-300"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(196,77,255,0.06) 100%)",
              borderColor: "rgba(196,77,255,0.12)",
            }}
          >
            <div
              className="relative w-full aspect-[4/3] flex items-center justify-center"
              style={{
                background: "linear-gradient(160deg, rgba(45,27,105,0.5) 0%, rgba(61,21,128,0.4) 50%, rgba(26,26,78,0.6) 100%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[42px] opacity-50" aria-hidden>📖</span>
              </div>
              <p
                className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "rgba(201,184,232,0.5)" }}
              >
                {t.illustrationLabel}
              </p>
            </div>
            {illustrationPrompt && (
              <details className="group" key={`prompt-${page}`}>
                <summary
                  className="cursor-pointer py-2 px-3 text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: "rgba(196,77,255,0.5)" }}
                >
                  <span className="group-open:rotate-90 transition-transform">›</span>
                  <span>View prompt</span>
                </summary>
                <p
                  className="px-3 pb-3 text-[11px] leading-relaxed italic"
                  style={{ color: "rgba(200,180,255,0.55)" }}
                >
                  {illustrationPrompt}
                </p>
              </details>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mb-5">
            <div
              className="h-px flex-1"
              style={{
                background: "linear-gradient(90deg,transparent,rgba(196,77,255,0.18))",
              }}
            />
            <div
              className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold"
              style={{
                borderColor: "rgba(196,77,255,0.28)",
                color: "rgba(196,77,255,0.4)",
                fontFamily: "'Lora',serif",
              }}
            >
              {page + 1}
            </div>
            <div
              className="h-px flex-1"
              style={{
                background: "linear-gradient(90deg,rgba(196,77,255,0.18),transparent)",
              }}
            />
          </div>

          {audioMode ? (
            <div className="w-full max-w-[380px] mx-auto">
              {audioAllowedThisPage ? (
                <AudioPlayer
                  key={page}
                  text={text}
                  lang={lang}
                  onEnd={goNext}
                  renderHighlightedText={({ currentSentenceIndex, sentenceStarts }) =>
                    highlightSentenceInText(text, sentenceStarts, currentSentenceIndex)
                  }
                />
              ) : (
                <div
                  className="rounded-2xl border p-5 text-center"
                  style={{
                    background: "rgba(26,26,78,0.5)",
                    borderColor: "rgba(196,77,255,0.2)",
                  }}
                >
                  <p className="text-sm text-[rgba(200,180,255,0.8)] mb-3">
                    Listen to more of this story with Premium.
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAudioMode(false)}
                      className="py-2 px-3 rounded-xl text-xs font-bold border"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderColor: "rgba(255,255,255,0.15)",
                        color: "#c9b8e8",
                      }}
                    >
                      📖 Read instead
                    </button>
                    {onShowPaywall && (
                      <button
                        type="button"
                        onClick={onShowPaywall}
                        className="py-2 px-3 rounded-xl text-xs font-bold"
                        style={{
                          background: "linear-gradient(135deg,rgba(255,140,0,0.3),rgba(255,215,0,0.2))",
                          border: "1px solid rgba(255,215,0,0.4)",
                          color: "#FFD700",
                        }}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p
              className="text-[#e8e0ff] font-medium"
              style={{
                fontFamily: "'Lora',Georgia,serif",
                fontSize: lang === "am" ? "clamp(18px,5vw,24px)" : "clamp(16px,4.5vw,21px)",
                lineHeight: lang === "am" ? 2.1 : 1.95,
                letterSpacing: lang === "am" ? "0.02em" : "0.015em",
                textShadow: "0 2px 28px rgba(160,100,255,0.12)",
              }}
            >
              {text}
            </p>
          )}
        </div>
      </div>
      <div className="relative z-[10] flex flex-col items-center pb-4 gap-2">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={goPrev}
            disabled={page === 0}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-xl border transition-all duration-200 disabled:cursor-default"
            style={{
              background: page > 0 ? "rgba(196,77,255,0.1)" : "rgba(255,255,255,0.03)",
              borderColor: page > 0 ? "rgba(196,77,255,0.28)" : "rgba(255,255,255,0.05)",
              color: page > 0 ? "rgba(200,160,255,0.8)" : "rgba(255,255,255,0.08)",
              cursor: page > 0 ? "pointer" : "default",
            }}
            aria-label="Previous page"
          >
            ‹
          </button>
          <Campfire size={0.8} />
          <button
            type="button"
            onClick={goNext}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-xl border transition-all duration-200 cursor-pointer"
            style={{
              background:
                page < total - 1
                  ? "rgba(196,77,255,0.15)"
                  : "linear-gradient(135deg,rgba(255,140,0,0.28),rgba(255,215,0,0.18))",
              borderColor:
                page < total - 1
                  ? "rgba(196,77,255,0.38)"
                  : "rgba(255,215,0,0.38)",
              color:
                page < total - 1
                  ? "rgba(200,160,255,0.9)"
                  : "rgba(255,215,0,0.9)",
            }}
            aria-label={page < total - 1 ? "Next page" : "Finish story"}
          >
            {page < total - 1 ? "›" : "★"}
          </button>
        </div>
        <p
          className="text-[10px] font-bold text-[rgba(196,77,255,0.28)] uppercase tracking-widest"
          style={{ fontFamily: "'Nunito',sans-serif" }}
        >
          {page < total - 1 ? t.continueHint : t.finishHint}
        </p>
      </div>
    </div>
  );
}
