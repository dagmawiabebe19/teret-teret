"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stop = useCallback(() => {
    const r = recogRef.current;
    if (r) {
      try {
        r.onend = null;
        r.stop();
      } catch {
        // ignore
      }
      recogRef.current = null;
    }
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Speech recognition is not available on this browser.");
        return;
      }

      stop();
      setError(null);
      setInterim("");
      finalRef.current = "";
      onFinalRef.current = onFinal;

      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interimText = "";
        let finalText = finalRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const piece = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalText = `${finalText} ${piece}`.trim();
          } else {
            interimText += piece;
          }
        }
        finalRef.current = finalText;
        setInterim(interimText.trim());
      };

      recognition.onerror = (event) => {
        const code = event.error ?? "error";
        if (code !== "aborted" && code !== "no-speech") {
          setError(
            code === "not-allowed"
              ? "Microphone permission is needed. Please allow the mic and try again."
              : "Could not hear you. Please try again."
          );
        }
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        recogRef.current = null;
        const text = finalRef.current.trim();
        setInterim("");
        if (text) {
          onFinalRef.current?.(text);
        }
      };

      recogRef.current = recognition;
      try {
        recognition.start();
        setListening(true);
      } catch {
        setError("Could not start the microphone. Please try again.");
        setListening(false);
      }
    },
    [stop]
  );

  useEffect(() => () => stop(), [stop]);

  return {
    supported,
    listening,
    interim,
    error,
    clearError: () => setError(null),
    start,
    stop,
  };
}
