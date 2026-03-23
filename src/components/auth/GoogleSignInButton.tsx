"use client";

import { useMemo, useState } from "react";
import { Chrome } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleClick() {
    if (!supabase) {
      window.location.href = "/dashboard";
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setLoading(false);
      window.alert(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
    >
      <Chrome className="h-4 w-4" />
      {loading ? "Google 로그인 요청 중..." : "Google로 로그인"}
    </button>
  );
}
