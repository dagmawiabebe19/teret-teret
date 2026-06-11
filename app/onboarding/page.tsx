"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/sign-in");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a12] text-[#c9a0b0]">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-5 py-10 flex flex-col"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "linear-gradient(165deg, #1a0a12 0%, #2d0f1f 100%)",
      }}
    >
      <h1 className="text-2xl font-bold text-white mb-2">Complete your profile</h1>
      <p className="text-[#c9a0b0] mb-8 text-sm">
        Add your name, photo, and bio so people can get to know you.
      </p>
      <p className="text-[#c9a0b0] text-sm mb-8 flex-1">
        Full onboarding UI coming soon — for now, continue to Discover.
      </p>
      <button
        type="button"
        onClick={() => router.push("/discover")}
        className="w-full h-14 rounded-xl font-bold text-[#1a0a12]"
        style={{ background: "linear-gradient(135deg, #E8C547, #D4AF37)" }}
      >
        Continue to Discover
      </button>
    </div>
  );
}
