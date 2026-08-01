"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Speak Practice partner replies — premium TTS with calm browser fallback. */
export function usePracticeTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanup = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setSpeaking(false);
    setLoading(false);
  }, [cleanup]);

  const speakBrowser = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setError("Couldn't play audio — you can still read the reply.");
        setLoading(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      const voices = window.speechSynthesis.getVoices();
      const en =
        voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
        voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (en) utterance.voice = en;
      utterance.onend = () => {
        setSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setSpeaking(false);
        utteranceRef.current = null;
        setError("Couldn't play audio — you can still read the reply.");
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setLoading(false);
      setSpeaking(true);
    },
    []
  );

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      stop();
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/practice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("[practice/tts] client error:", {
            status: res.status,
            body: data,
          });
          setLoading(false);
          // Soft message — conversation text already shows. Try browser voice.
          if (data.useBrowserTts || data.audioUnavailable || res.status >= 500) {
            speakBrowser(trimmed);
            setError("Couldn't play premium audio — using device voice.");
            return;
          }
          if (res.status === 429 || data.ttsDailyLimit) {
            setError(
              data.error ??
                "Daily audio limit reached. You can still read the reply."
            );
            return;
          }
          setError("Couldn't play audio — you can still read the reply.");
          speakBrowser(trimmed);
          return;
        }

        const blob = await res.blob();
        if (!blob.size) {
          console.error("[practice/tts] client error: empty audio blob");
          setLoading(false);
          speakBrowser(trimmed);
          setError("Couldn't play premium audio — using device voice.");
          return;
        }

        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          cleanup();
          setSpeaking(false);
        };
        audio.onerror = () => {
          console.error("[practice/tts] client error: Audio element failed");
          cleanup();
          setSpeaking(false);
          speakBrowser(trimmed);
          setError("Couldn't play premium audio — using device voice.");
        };
        await audio.play();
        setLoading(false);
        setSpeaking(true);
      } catch (err) {
        console.error("[practice/tts] client error: fetch/play threw", err);
        setLoading(false);
        speakBrowser(trimmed);
        setError("Couldn't play premium audio — using device voice.");
      }
    },
    [stop, cleanup, speakBrowser]
  );

  return {
    speak,
    stop,
    speaking,
    loading,
    error,
    clearError: () => setError(null),
  };
}
