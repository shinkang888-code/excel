"use client";

import { useMemo, useState } from "react";
import { FolderSync } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { googleScopes } from "@/lib/google";

export function GoogleExportButton() {
  const [status, setStatus] = useState<"idle" | "requesting">("idle");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleAuthorize() {
    setStatus("requesting");

    if (!supabase) {
      window.alert("Supabase 환경 변수가 없어 Google 연결을 진행할 수 없습니다.");
      setStatus("idle");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: googleScopes.export.join(" "),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        },
      },
    });

    if (error) {
      setStatus("idle");
      window.alert(error.message);
      return;
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleAuthorize()}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <FolderSync className="h-4 w-4" />
      {status === "idle" && "Google Drive 연결"}
      {status === "requesting" && "권한 요청 중..."}
    </button>
  );
}
