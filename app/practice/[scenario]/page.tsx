"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/Stars";
import { DecorativeBackground } from "@/components/DecorativeBackground";
import { AppNav } from "@/components/AppNav";
import { useTranslation } from "@/lib/useTranslation";
import { getPracticeScenario } from "@/lib/practice/scenarios";
import { useSpeechRecognition } from "@/lib/practice/useSpeechRecognition";
import { usePracticeTTS } from "@/lib/practice/usePracticeTTS";
import type { PracticeCorrection, PracticeMessage } from "@/lib/practice/generateTurn";
import type { Lang } from "@/types";

type DisplayMessage = PracticeMessage & {
  id: string;
  corrections?: PracticeCorrection[];
};

export default function PracticeSessionPage() {
  const params = useParams();
  const scenarioId = typeof params?.scenario === "string" ? params.scenario : "";
  const scenario = getPracticeScenario(scenarioId);
  const router = useRouter();

  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const s = localStorage.getItem("teret_lang");
    return s === "am" || s === "en" || s === "es" ? s : "en";
  });
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("teret_lang", l);
    } catch {
      // ignore
    }
  }, []);
  const { t } = useTranslation(lang);

  const [authChecking, setAuthChecking] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [textFallback, setTextFallback] = useState("");
  const [started, setStarted] = useState(false);

  const speech = useSpeechRecognition();
  const tts = usePracticeTTS();
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const messagesRef = useRef<DisplayMessage[]>([]);

  const nextId = () => {
    idRef.current += 1;
    return `m-${idRef.current}`;
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, speech.interim, busy]);

  useEffect(() => {
    if (!scenario) return;
    const supabase = createClient();
    if (!supabase) {
      router.replace(
        "/account?signin=1&returnTo=" +
          encodeURIComponent(`/practice/${scenarioId}`)
      );
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(
          "/account?signin=1&returnTo=" +
            encodeURIComponent(`/practice/${scenarioId}`)
        );
        return;
      }
      setEmail(user.email ?? null);
      setDisplayName(
        (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          null
      );
      setAvatarUrl(
        (user.user_metadata?.avatar_url as string) ??
          (user.user_metadata?.picture as string) ??
          null
      );
      setAuthChecking(false);
    });
  }, [router, scenario, scenarioId]);

  const sendUtterance = useCallback(
    async (utterance: string) => {
      if (!scenario || busy) return;
      const text = utterance.trim();
      if (!text) return;

      setTurnError(null);
      speech.clearError();
      tts.clearError();

      const userMsg: DisplayMessage = { id: nextId(), role: "user", text };
      const historyForApi: PracticeMessage[] = [
        ...messagesRef.current.map((m) => ({ role: m.role, text: m.text })),
        { role: "user", text },
      ];
      setMessages((prev) => [...prev, userMsg]);
      setBusy(true);
      setStarted(true);

      try {
        const res = await fetch("/api/practice/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: scenario.id,
            history: historyForApi,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTurnError(data.error ?? "Could not get a reply. Please try again.");
          setBusy(false);
          return;
        }

        const reply = typeof data.reply === "string" ? data.reply.trim() : "";
        const corrections = Array.isArray(data.corrections)
          ? (data.corrections as PracticeCorrection[]).slice(0, 2)
          : [];

        setMessages((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "user" && next[i].id === userMsg.id) {
              next[i] = { ...next[i], corrections };
              break;
            }
          }
          if (reply) {
            next.push({ id: nextId(), role: "partner", text: reply });
          }
          return next;
        });

        setBusy(false);
        if (reply) {
          void tts.speak(reply);
        }
      } catch {
        setTurnError("Could not get a reply. Please try again.");
        setBusy(false);
      }
    },
    [scenario, busy, speech, tts]
  );

  const onMicTap = () => {
    if (busy) return;
    if (speech.listening) {
      speech.stop();
      return;
    }
    tts.stop();
    speech.start((finalText) => {
      void sendUtterance(finalText);
    });
  };

  const onTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = textFallback.trim();
    if (!v || busy) return;
    setTextFallback("");
    void sendUtterance(v);
  };

  if (!scenario) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
        }}
      >
        <p className="text-[#e8e0ff] mb-4">Situation not found.</p>
        <Link href="/practice" className="text-[#FFD700] font-bold">
          Back to Practice
        </Link>
      </div>
    );
  }

  if (authChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <p className="text-[#c9b8e8]">{t.authLoading}</p>
      </div>
    );
  }

  const statusLine = speech.listening
    ? "Listening… speak now"
    : busy
      ? "Partner is thinking…"
      : tts.loading || tts.speaking
        ? "Partner is speaking…"
        : started
          ? "Tap the mic to talk"
          : "Tap the mic and say hello";

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 25%,#2d1b69 55%,#5a2d00 100%)",
        fontFamily: "'Nunito',sans-serif",
      }}
    >
      <Stars />
      <DecorativeBackground />
      <AppNav
        lang={lang}
        setLang={setLang}
        isSignedIn
        avatarUrl={avatarUrl}
        displayName={displayName}
        email={email}
      />

      <div className="max-w-[640px] w-full mx-auto px-4 pt-16 pb-4 relative z-[1] flex-1 flex flex-col min-h-0">
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <div className="min-w-0">
            <Link
              href="/practice"
              className="text-[12px] font-bold text-[#c9b8e8] hover:text-[#FFD700]"
            >
              ← Practice
            </Link>
            <h1 className="font-fredoka text-[#FFD700] text-[18px] sm:text-[20px] truncate mt-1">
              {scenario.titleEn}
            </h1>
            <p
              className="text-[13px] text-[rgba(200,180,255,0.7)] truncate"
              style={{ fontFamily: "var(--font-amharic), sans-serif" }}
            >
              {scenario.titleAm}
            </p>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl border border-[rgba(255,215,0,0.1)] bg-[rgba(0,0,0,0.2)] px-3 py-4 mb-3">
          {messages.length === 0 && !speech.interim && (
            <p className="text-center text-[rgba(200,180,255,0.55)] text-[14px] py-10 px-4 leading-relaxed">
              Your conversation will appear here.
              <br />
              <span style={{ fontFamily: "var(--font-amharic), sans-serif" }}>
                ውይይቱ እዚህ ይታያል። ማይክሮፎኑን ይጫኑ።
              </span>
            </p>
          )}

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id}>
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-[16px] leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-[rgba(255,215,0,0.15)] border border-[rgba(255,215,0,0.35)] text-[#e8e0ff]"
                      : "mr-auto bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#e8e0ff]"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[rgba(200,180,255,0.5)] mb-1">
                    {m.role === "user" ? "You" : "Partner"}
                  </p>
                  {m.text}
                </div>
                {m.role === "user" &&
                  m.corrections &&
                  m.corrections.length > 0 && (
                    <div className="ml-auto max-w-[92%] mt-1.5 space-y-1.5">
                      {m.corrections.map((c, i) => (
                        <div
                          key={i}
                          className="rounded-xl px-3 py-2 text-[13px] border border-[rgba(255,215,0,0.12)] bg-[rgba(255,215,0,0.05)]"
                        >
                          <p className="text-[#FFD700] font-bold text-[12px] mb-0.5">
                            💡 Tip
                          </p>
                          <p className="text-[#e8e0ff] leading-snug">
                            {c.suggestion}
                          </p>
                          {c.why && (
                            <p
                              className="text-[rgba(200,180,255,0.7)] text-[12px] mt-1 leading-snug"
                              style={{
                                fontFamily: "var(--font-amharic), sans-serif",
                              }}
                            >
                              {c.why}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {speech.interim && (
              <div className="max-w-[92%] ml-auto rounded-2xl px-4 py-3 text-[16px] leading-relaxed bg-[rgba(255,215,0,0.08)] border border-dashed border-[rgba(255,215,0,0.35)] text-[rgba(232,224,255,0.75)] italic">
                {speech.interim}
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>

        {(turnError || speech.error || tts.error) && (
          <p className="text-[#ff6b6b] text-[13px] mb-2 text-center" role="alert">
            {turnError || speech.error || tts.error}
          </p>
        )}

        <p className="text-center text-[14px] font-bold text-[#FFD700] mb-3 shrink-0">
          {statusLine}
        </p>

        {/* Big mic */}
        <div className="flex flex-col items-center gap-3 shrink-0 pb-6">
          {speech.supported ? (
            <button
              type="button"
              onClick={onMicTap}
              disabled={busy && !speech.listening}
              aria-label={speech.listening ? "Stop listening" : "Tap to talk"}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-[36px] transition-transform active:scale-95 disabled:opacity-50 tap-zone ${
                speech.listening ? "animate-pulse" : ""
              }`}
              style={{
                background: speech.listening
                  ? "linear-gradient(135deg, #ff6b6b, #FFB088)"
                  : "linear-gradient(135deg, #FFB088, #FFD700)",
                boxShadow: speech.listening
                  ? "0 0 0 8px rgba(255,107,107,0.25), 0 8px 28px rgba(0,0,0,0.4)"
                  : "0 0 0 6px rgba(255,215,0,0.15), 0 8px 28px rgba(0,0,0,0.4)",
              }}
            >
              <span aria-hidden>{speech.listening ? "⏹" : "🎤"}</span>
            </button>
          ) : (
            <form onSubmit={onTextSubmit} className="w-full max-w-md space-y-2">
              <p className="text-center text-[12px] text-[rgba(200,180,255,0.65)]">
                Mic not available here — type in English instead.
              </p>
              <input
                type="text"
                value={textFallback}
                onChange={(e) => setTextFallback(e.target.value)}
                disabled={busy}
                placeholder="Type what you want to say…"
                className="w-full min-h-[52px] rounded-2xl px-4 text-[16px] text-[#e8e0ff] outline-none border border-[rgba(255,215,0,0.3)] focus:border-[#FFD700]"
                style={{ background: "rgba(0,0,0,0.3)" }}
              />
              <button
                type="submit"
                disabled={busy || !textFallback.trim()}
                className="w-full min-h-[52px] rounded-full text-[16px] font-bold text-[#1a0533] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FFB088, #FFD700)",
                }}
              >
                Send
              </button>
            </form>
          )}

          {speech.supported && (
            <p
              className="text-[12px] text-[rgba(200,180,255,0.5)] text-center"
              style={{ fontFamily: "var(--font-amharic), sans-serif" }}
            >
              ይጫኑ እና በእንግሊዝኛ ይናገሩ
            </p>
          )}

          {tts.speaking && (
            <button
              type="button"
              onClick={() => tts.stop()}
              className="text-[13px] font-bold text-[#c9b8e8] underline"
            >
              Stop audio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
