"use client";

import { useState } from "react";
import type { LifeRelationship } from "@/lib/lives/types";

interface RelationshipsPanelProps {
  relationships: LifeRelationship[];
}

export function RelationshipsPanel({ relationships }: RelationshipsPanelProps) {
  const [open, setOpen] = useState(false);

  if (!relationships.length) return null;

  return (
    <div className="rounded-2xl border border-[rgba(255,215,0,0.15)] bg-[rgba(255,255,255,0.04)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left min-h-[48px] tap-zone"
        aria-expanded={open}
      >
        <span className="text-[13px] font-bold text-[#FFD700]">
          Relationships ({relationships.length})
        </span>
        <span className="text-[#c9b8e8] text-[12px]" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[rgba(255,215,0,0.08)]">
          {relationships.map((rel) => (
            <div key={rel.id ?? rel.name} className="pt-3">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[14px] font-bold text-[#e8e0ff]">{rel.name}</span>
                {rel.role && (
                  <span className="text-[11px] text-[rgba(200,180,255,0.55)] capitalize">
                    {rel.role}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {Object.entries(rel.dimensions).map(([dim, val]) => (
                  <span
                    key={dim}
                    className="text-[11px] text-[#c9b8e8]"
                  >
                    <span className="capitalize text-[rgba(200,180,255,0.55)]">{dim}</span>{" "}
                    <span className="font-bold text-[#FFD700]/80">{Math.round(val)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
