"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function DiscoverPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (!data.user) {
        window.location.href = "/auth/sign-in";
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a12] text-[#c9a0b0]">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "linear-gradient(165deg, #1a0a12 0%, #2d0f1f 100%)",
      }}
    >
      <h1 className="text-2xl font-bold text-white mb-2">Discover</h1>
      <p className="text-[#c9a0b0] mb-6">
        Welcome back{user?.phone ? ` · ${user.phone}` : ""}. Your matches will appear here.
      </p>
      <Link href="/account" className="text-[#D4AF37] text-sm hover:underline">
        Account settings
      </Link>
    </div>
  );
}
