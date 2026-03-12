"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/** Map app lang codes to SpeechSynthesis lang codes */
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

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }, []);

  const pickVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      const speechLang = toSpeechLang(lang);
      const voices = getVoices();
      const match = voices.find(
        (v) =>
          v.lang === speechLang ||
          v.lang.startsWith(speechLang.split("-")[0])
      );
      return match ?? voices.find((v) => v.default) ?? voices[0] ?? null;
    },
    [getVoices]
  );

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!isSupported || !text.trim()) return;

      const syn = window.speechSynthesis;
      syn.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = toSpeechLang(lang);
      utterance.rate = rateRef.current;

      const voice = pickVoice(lang);
      if (voice) utterance.voice = voice;

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

      utterance.onerror = () => {
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
    [isSupported, pickVoice]
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

  // iOS Safari: voices load async
  const [voicesReady, setVoicesReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) setVoicesReady(true);
    const onVoicesChanged = () => setVoicesReady(true);
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    return () =>
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        onVoicesChanged
      );
  }, []);

  // Cleanup on unmount
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
