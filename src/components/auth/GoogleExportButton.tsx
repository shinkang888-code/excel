"use client";

import { useState } from "react";
import { FolderSync } from "lucide-react";

export function GoogleExportButton() {
  const [status, setStatus] = useState<"idle" | "requesting" | "done">("idle");

  async function handleAuthorize() {
    setStatus("requesting");

    const response = await fetch("/api/google/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: "demo-authorization-code",
        state: "local-demo",
      }),
    });

    if (!response.ok) {
      setStatus("idle");
      window.alert("Google 권한 연결에 실패했습니다.");
      return;
    }

    setStatus("done");
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
      {status === "done" && "연결 완료"}
    </button>
  );
}
