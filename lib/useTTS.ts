"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Lang } from "@/types";

/** Map app lang codes to SpeechSynthesis utterance.lang */
function toSpeechLang(lang: string): string {
  switch (lang) {
    case "am":
      return "am-ET";
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    default:
      return "en-US";
  }
}

function normalizeLangCode(code: string): string {
  return code.replace(/_/g, "-").toLowerCase();
}

function voiceMatches(voiceLang: string, target: string): boolean {
  return normalizeLangCode(voiceLang) === normalizeLangCode(target);
}

function voiceStartsWith(voiceLang: string, prefix: string): boolean {
  return normalizeLangCode(voiceLang).startsWith(prefix.toLowerCase());
}

function findVoiceByLang(voices: SpeechSynthesisVoice[], code: string): SpeechSynthesisVoice | undefined {
  return voices.find((v) => voiceMatches(v.lang, code));
}

function findVoiceByPrefix(voices: SpeechSynthesisVoice[], prefix: string): SpeechSynthesisVoice | undefined {
  return voices.find((v) => voiceStartsWith(v.lang, prefix));
}

function getDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

export type VoicePickResult = {
  voice: SpeechSynthesisVoice | null;
  reason: string;
};

/** Priority-based voice selection with fallbacks — never returns null if any voice exists. */
export function selectVoice(lang: string, voices: SpeechSynthesisVoice[]): VoicePickResult {
  if (voices.length === 0) {
    return { voice: null, reason: "no voices available" };
  }

  let voice: SpeechSynthesisVoice | undefined;
  let reason = "";

  switch (lang) {
    case "am": {
      voice = findVoiceByLang(voices, "am-ET");
      if (voice) reason = "exact am-ET";
      if (!voice) {
        voice = findVoiceByPrefix(voices, "am");
        if (voice) reason = "prefix am";
      }
      if (!voice) {
        const fallback = getDefaultVoice(voices);
        voice = fallback ?? undefined;
        reason = "system default (no Amharic voice)";
      }
      break;
    }
    case "es": {
      for (const code of ["es-ES", "es-MX", "es-US"]) {
        voice = findVoiceByLang(voices, code);
        if (voice) {
          reason = `exact ${code}`;
          break;
        }
      }
      if (!voice) {
        voice = findVoiceByPrefix(voices, "es");
        if (voice) reason = "prefix es";
      }
      if (!voice) {
        const fallback = getDefaultVoice(voices);
        voice = fallback ?? undefined;
        reason = "system default (no Spanish voice)";
      }
      break;
    }
    case "en":
    default: {
      voice = findVoiceByLang(voices, "en-US");
      if (voice) reason = "exact en-US";
      if (!voice) {
        voice = findVoiceByPrefix(voices, "en");
        if (voice) reason = "prefix en";
      }
      if (!voice) {
        const fallback = getDefaultVoice(voices);
        voice = fallback ?? undefined;
        reason = "system default (no English voice)";
      }
      break;
    }
  }

  const selected = voice ?? getDefaultVoice(voices);
  return { voice: selected, reason: reason || "fallback" };
}

/** Chrome often returns [] until voiceschanged fires. */
function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const syn = window.speechSynthesis;
    const existing = syn.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }

    let settled = false;
    const finish = (list: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      syn.removeEventListener("voiceschanged", onChange);
      resolve(list);
    };

    const onChange = () => {
      const list = syn.getVoices();
      if (list.length > 0) finish(list);
    };

    syn.addEventListener("voiceschanged", onChange);
    syn.getVoices();
    setTimeout(() => finish(syn.getVoices()), timeoutMs);
  });
}

/** Strip ASCII punctuation from Amharic before browser TTS (avoids "comma" artifacts). */
export function prepareBrowserTtsText(text: string, lang: Lang): string {
  const trimmed = text.trim();
  if (lang !== "am") return trimmed;
  return trimmed.replace(/[,.\?!;:]/g, "");
}

/** Split text into sentences for boundary tracking (start char indices) */
export function getSentenceStarts(text: string): number[] {
  const starts: number[] = [0];
  const re = /[.!?።]\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    starts.push(m.index + m[0].length);
  }
  return starts;
}

export interface UseTTSOptions {
  onEnd?: () => void;
  rate?: number;
  /** Signed-in users: Azure/ElevenLabs via /api/tts; guests use browser TTS */
  usePremiumVoice?: boolean;
  onNarrationError?: (message: string) => void;
}

function browserRateForLang(lang: Lang, baseRate: number): number {
  if (lang === "am") return Math.min(1.1, baseRate * 0.92);
  return baseRate;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { onEnd, rate = 1, usePremiumVoice = false, onNarrationError } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [usingPremiumVoice, setUsingPremiumVoice] = useState(false);
  const [isSupported] = useState(() =>
    typeof window !== "undefined" && ("speechSynthesis" in window || typeof Audio !== "undefined")
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const sentenceStartsRef = useRef<number[]>([]);
  const onEndRef = useRef(onEnd);
  const rateRef = useRef(rate);
  const usePremiumVoiceRef = useRef(usePremiumVoice);
  const onNarrationErrorRef = useRef(onNarrationError);

  onEndRef.current = onEnd;
  rateRef.current = rate;
  usePremiumVoiceRef.current = usePremiumVoice;
  onNarrationErrorRef.current = onNarrationError;

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const finishPlayback = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentSentenceIndex(-1);
    utteranceRef.current = null;
    cleanupAudio();
    onEndRef.current?.();
  }, [cleanupAudio]);

  const startUtterance = useCallback(
    (text: string, lang: Lang, voices: SpeechSynthesisVoice[]) => {
      const syn = window.speechSynthesis;
      const trimmed = prepareBrowserTtsText(text, lang);
      if (!trimmed) return;

      setUsingPremiumVoice(false);
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = toSpeechLang(lang);
      utterance.rate = browserRateForLang(lang, rateRef.current);
      if (lang === "am") {
        utterance.pitch = 1.05;
      }

      const { voice } = selectVoice(lang, voices);
      if (voice) utterance.voice = voice;

      sentenceStartsRef.current = getSentenceStarts(trimmed);
      setCurrentSentenceIndex(0);

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === "sentence" || event.name === "word") {
          const charIndex = event.charIndex ?? 0;
          const starts = sentenceStartsRef.current;
          let idx = 0;
          for (let i = 0; i < starts.length; i++) {
            if (charIndex >= starts[i]) idx = i;
          }
          setCurrentSentenceIndex(idx);
        }
      };

      utterance.onend = () => finishPlayback();
      utterance.onerror = () => finishPlayback();

      utteranceRef.current = utterance;
      syn.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
    },
    [finishPlayback]
  );

  const startPremiumAudio = useCallback(
    async (text: string, lang: Lang) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setUsingPremiumVoice(true);
      setCurrentSentenceIndex(-1);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, lang }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 429 || data.ttsDailyLimit) {
            setIsLoading(false);
            setUsingPremiumVoice(false);
            onNarrationErrorRef.current?.(
              data.error ?? "Daily audio limit reached. Upgrade to Premium for unlimited."
            );
            return;
          }
          if (data.audioUnavailable) {
            setIsLoading(false);
            setUsingPremiumVoice(false);
            onNarrationErrorRef.current?.(
              data.error ?? "Audio temporarily unavailable. Please try again in a moment."
            );
            return;
          }
          if (data.useBrowserTts) {
            setIsLoading(false);
            setUsingPremiumVoice(false);
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              startUtterance(text, lang, voices);
            } else {
              waitForVoices().then((loaded) => startUtterance(text, lang, loaded));
            }
            return;
          }
          throw new Error(data.error ?? "TTS failed");
        }

        const blob = await res.blob();
        cleanupAudio();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audio.playbackRate = rateRef.current;
        audioRef.current = audio;
        audio.onended = () => finishPlayback();
        audio.onerror = () => finishPlayback();
        await audio.play();
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
      } catch (err) {
        console.warn("[useTTS] API narration failed", err);
        setIsLoading(false);
        setUsingPremiumVoice(false);
        if (usePremiumVoiceRef.current) {
          onNarrationErrorRef.current?.(
            "Audio temporarily unavailable. Please try again in a moment."
          );
          return;
        }
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          startUtterance(text, lang, voices);
        } else {
          waitForVoices().then((loaded) => startUtterance(text, lang, loaded));
        }
      }
    },
    [cleanupAudio, finishPlayback, startUtterance]
  );

  const speak = useCallback(
    (text: string, lang: Lang) => {
      if (!isSupported || !text.trim()) return;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      cleanupAudio();
      setIsPlaying(false);
      setIsPaused(false);

      if (usePremiumVoiceRef.current) {
        void startPremiumAudio(text, lang);
        return;
      }

      const syn = window.speechSynthesis;
      const voices = syn.getVoices();
      if (voices.length > 0) {
        startUtterance(text, lang, voices);
        return;
      }

      waitForVoices().then((loaded) => startUtterance(text, lang, loaded));
    },
    [isSupported, cleanupAudio, startUtterance, startPremiumAudio]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      return;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      void audioRef.current.play();
      setIsPaused(false);
      return;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    cleanupAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentSentenceIndex(-1);
    utteranceRef.current = null;
  }, [cleanupAudio]);

  const setRate = useCallback((r: number) => {
    rateRef.current = r;
    const u = utteranceRef.current;
    if (u) u.rate = browserRateForLang((u.lang || "en").startsWith("am") ? "am" : "en", r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }, []);

  const [voicesReady, setVoicesReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoicesReady(true);
      return;
    }
    const check = () => {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true);
    };
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    speak,
    pause,
    resume,
    stop,
    setRate,
    isPlaying,
    isPaused,
    isLoading,
    isSupported,
    voicesReady,
    usingPremiumVoice,
    currentSentenceIndex,
    sentenceStarts: sentenceStartsRef.current,
  };
}
