"use client";

import type { ReactNode } from "react";

export function PhoneAuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-8 sm:py-12"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "linear-gradient(165deg, #1a0a12 0%, #2d0f1f 45%, #1a1028 100%)",
      }}
    >
      <div className="w-full max-w-md flex-1 flex flex-col">{children}</div>
    </div>
  );
}

export function NalaDateLogo() {
  return (
    <div className="text-center mb-8">
      <div className="text-4xl mb-1" aria-hidden>
        💕
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-white">NalaDate</h1>
    </div>
  );
}
