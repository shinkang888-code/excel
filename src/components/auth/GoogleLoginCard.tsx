"use client";

import Link from "next/link";
import { Chrome, ShieldCheck } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export function GoogleLoginCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Chrome className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Google 계정으로 시작
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        로그인은 간단하게, Google Drive 권한은 실제 변환 시점에만 추가
        요청하는 방식으로 설계합니다.
      </p>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
        <p>기본 로그인과 Drive/Sheets 권한 요청을 분리해 초기 이탈을 줄입니다.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <GoogleSignInButton />
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          서비스 소개 보기
        </Link>
      </div>
    </div>
  );
}
