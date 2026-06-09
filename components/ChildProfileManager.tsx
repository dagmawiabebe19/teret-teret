"use client";

import { useState } from "react";
import { AVATAR_EMOJIS } from "./ChildProfilePicker";
import { AGES, TRAITS_EN } from "@/lib/constants";
import { useTranslation } from "@/lib/useTranslation";
import type { ChildProfile } from "@/types";
import type { Lang } from "@/types";

interface ChildProfileManagerProps {
  lang: Lang;
  profiles: ChildProfile[];
  onRefresh: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function ChildProfileManager({
  lang,
  profiles,
  onRefresh,
  isPremium = true,
  onUpgrade,
}: ChildProfileManagerProps) {
  const { t } = useTranslation(lang);
  const [editing, setEditing] = useState<ChildProfile | "new" | null>(null);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("5-7");
  const [trait, setTrait] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🧒");
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditing("new");
    setName("");
    setAgeGroup("5-7");
    setTrait("");
    setAvatarEmoji("🧒");
  };

  const startEdit = (p: ChildProfile) => {
    setEditing(p);
    setName(p.name);
    setAgeGroup(p.ageGroup);
    setTrait(p.trait ?? "");
    setAvatarEmoji(p.avatarEmoji);
  };

  const cancel = () => setEditing(null);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing === "new") {
        await fetch("/api/child-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, ageGroup, trait: trait || null, avatarEmoji }),
        });
      } else if (editing) {
        await fetch(`/api/child-profiles/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, ageGroup, trait: trait || null, avatarEmoji }),
        });
      }
      setEditing(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/child-profiles/${id}`, { method: "DELETE" });
    onRefresh();
  };

  if (!isPremium) {
    return (
      <div
        className="rounded-[18px] border p-4"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,215,0,0.15)",
        }}
      >
        <h2 className="text-[15px] font-bold text-[#FFD700] mb-3">{t.manageChildren}</h2>
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full py-2.5 rounded-xl border text-[12px] font-bold text-[#c9b8e8] hover:bg-[rgba(255,215,0,0.08)] transition-colors"
          style={{ borderColor: "rgba(255,215,0,0.35)" }}
        >
          {t.upgradeForChildProfiles}
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-[18px] border p-4"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,215,0,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-[#FFD700]">{t.manageChildren}</h2>
        {!editing && (
          <button
            type="button"
            onClick={startNew}
            className="text-[11px] font-bold text-[#c44dff] hover:text-[#FFD700]"
          >
            + {t.addChild}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#FFD700] block mb-1">{t.nameLabel}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white text-sm"
              maxLength={80}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#FFD700] block mb-1">{t.ageLabel}</label>
            <div className="flex gap-2">
              {AGES.map((a, i) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAgeGroup(a.value)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border"
                  style={{
                    background: ageGroup === a.value ? "rgba(255,215,0,0.15)" : "transparent",
                    borderColor: ageGroup === a.value ? "#FFD700" : "rgba(255,255,255,0.15)",
                    color: ageGroup === a.value ? "#FFD700" : "#c9b8e8",
                  }}
                >
                  {t.ageOpts[i]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#FFD700] block mb-1">{t.traitLabel}</label>
            <select
              value={trait}
              onChange={(e) => setTrait(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[rgba(255,215,0,0.3)] bg-[rgba(255,255,255,0.08)] text-white text-sm"
            >
              <option value="">—</option>
              {TRAITS_EN.map((tr, i) => (
                <option key={tr} value={tr}>{t.traits[i]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#FFD700] block mb-1">{t.selectAvatar}</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatarEmoji(em)}
                  className="w-10 h-10 rounded-xl border text-xl"
                  style={{
                    borderColor: avatarEmoji === em ? "#FFD700" : "rgba(255,255,255,0.15)",
                    background: avatarEmoji === em ? "rgba(255,215,0,0.12)" : "transparent",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || !name.trim()}
              className="flex-1 py-2 rounded-xl font-bold text-sm bg-[linear-gradient(135deg,#FF8C00,#FFD700)] text-[#1a1a4e] disabled:opacity-60"
            >
              {t.saveChild}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="py-2 px-4 rounded-xl text-sm font-bold text-[#c9b8e8] border border-[rgba(255,255,255,0.15)]"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-[13px] text-[rgba(200,180,255,0.6)]">{t.addChild}</p>
      ) : (
        <ul className="space-y-2">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0"
            >
              <span className="text-2xl">{p.avatarEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#e8e0ff]">{p.name}</p>
                <p className="text-[11px] text-[rgba(200,180,255,0.5)]">
                  {t.ageOpts[AGES.findIndex((a) => a.value === p.ageGroup)] ?? p.ageGroup}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="text-[11px] font-bold text-[#c44dff]"
              >
                {t.editChild}
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-[11px] font-bold text-[rgba(255,150,150,0.9)]"
              >
                {t.deleteChild}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
