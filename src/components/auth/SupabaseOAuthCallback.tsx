"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function SupabaseOAuthCallback() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("Google 인증을 처리 중입니다...");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (!code && !error) return;

    void (async () => {
      if (!supabase) {
        setMessage("Supabase 설정이 없어 인증 처리를 진행할 수 없습니다.");
        return;
      }

      try {
        setMessage("세션 복구 중...");

        // supabase-js 버전에 따라 제공되는 메서드명이 다를 수 있어 안전하게 처리합니다.
        const authAny = supabase.auth as any;

        let result:
          | { data?: { session?: unknown }; error?: { message?: string } }
          | undefined;

        if (typeof authAny.getSessionFromUrl === "function") {
          result = await authAny.getSessionFromUrl(url.toString());
        } else if (typeof authAny.exchangeCodeForSession === "function" && code) {
          result = await authAny.exchangeCodeForSession(code);
        } else {
          throw new Error("Supabase OAuth 코드 교환 메서드를 찾을 수 없습니다.");
        }

        if (result?.error) {
          throw new Error(result.error.message ?? "인증 세션 복구 실패");
        }

        // 쿼리 파라미터 제거 후 대시보드로 이동
        window.history.replaceState({}, document.title, url.pathname);
        router.replace("/dashboard");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "인증 처리 중 오류가 발생했습니다.";
        setMessage(`인증 처리 실패: ${msg}`);
      }
    })();
  }, [router, supabase]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-10 lg:px-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Google 로그인</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">인증 처리</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </main>
  );
}

