"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
  console.log("[useTTS] voice selected:", {
    appLang: lang,
    reason: reason || "fallback",
    voiceName: selected?.name ?? "(none)",
    voiceLang: selected?.lang ?? "(none)",
    totalVoices: voices.length,
  });

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
    // Chrome may populate voices shortly after first getVoices() call
    syn.getVoices();

    setTimeout(() => finish(syn.getVoices()), timeoutMs);
  });
}

/** Split text into sentences for boundary tracking (start char indices) */
export function getSentenceStarts(text: string): number[] {
  const starts: number[] = [0];
  const re = /[.!?]\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    starts.push(m.index + m[0].length);
  }
  return starts;
}

export interface UseTTSOptions {
  onEnd?: () => void;
  rate?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { onEnd, rate = 1 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [isSupported] = useState(() =>
    typeof window !== "undefined" && "speechSynthesis" in window
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentenceStartsRef = useRef<number[]>([]);
  const onEndRef = useRef(onEnd);
  const rateRef = useRef(rate);

  onEndRef.current = onEnd;
  rateRef.current = rate;

  const startUtterance = useCallback(
    (text: string, lang: string, voices: SpeechSynthesisVoice[]) => {
      const syn = window.speechSynthesis;
      const trimmed = text.trim();
      if (!trimmed) return;

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = toSpeechLang(lang);
      utterance.rate = rateRef.current;

      const { voice } = selectVoice(lang, voices);
      if (voice) {
        utterance.voice = voice;
      }

      sentenceStartsRef.current = getSentenceStarts(text);
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

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
        utteranceRef.current = null;
        onEndRef.current?.();
      };

      utterance.onerror = (event) => {
        console.warn("[useTTS] speech error:", {
          appLang: lang,
          error: event.error,
          utteranceLang: utterance.lang,
          voiceName: utterance.voice?.name,
        });
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
        utteranceRef.current = null;
        onEndRef.current?.();
      };

      utteranceRef.current = utterance;
      syn.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    },
    []
  );

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!isSupported || !text.trim()) return;

      const syn = window.speechSynthesis;
      syn.cancel();

      const voices = syn.getVoices();
      if (voices.length > 0) {
        startUtterance(text, lang, voices);
        return;
      }

      console.log("[useTTS] voices empty on first call, waiting for voiceschanged…");
      waitForVoices().then((loaded) => {
        if (loaded.length === 0) {
          console.warn("[useTTS] no voices after wait — speaking with utterance.lang only");
        }
        startUtterance(text, lang, loaded);
      });
    },
    [isSupported, startUtterance]
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(-1);
    utteranceRef.current = null;
  }, []);

  const setRate = useCallback((r: number) => {
    rateRef.current = r;
    const u = utteranceRef.current;
    if (u) u.rate = r;
  }, []);

  const [voicesReady, setVoicesReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
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
    };
  }, []);

  return {
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
    sentenceStarts: sentenceStartsRef.current,
  };
}
