"use client";

import { useState, useEffect } from "react";

interface DebugData {
  userId: string | null;
  subscriptionStatus: string | null;
  usageCount: number | null;
  billingPeriodEnd: string | null;
  isGuest?: boolean;
  error?: string;
}

export function DebugPanel() {
  const [data, setData] = useState<DebugData | null>(null);
  const [open, setOpen] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev || !open) return;
    fetch("/api/debug")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [isDev, open]);

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[100]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded text-[10px] font-mono bg-black/60 text-amber-300 border border-amber-500/50"
        aria-label="Toggle debug panel"
      >
        {open ? "▼ debug" : "▲ debug"}
      </button>
      {open && (
        <pre
          className="mt-1 p-2 rounded text-[10px] font-mono bg-black/80 text-green-300 border border-amber-500/30 max-w-[220px] overflow-auto max-h-[120px]"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
        >
          {data
            ? `user: ${data.userId ?? "—"}
status: ${data.subscriptionStatus ?? "—"}
usage: ${data.usageCount ?? "—"}
periodEnd: ${data.billingPeriodEnd ?? "—"}
${data.isGuest ? "guest" : "logged in"}`
            : "loading..."}
        </pre>
      )}
    </div>
  );
}
