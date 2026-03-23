import { Link2, ShieldCheck } from "lucide-react";

import { GoogleExportButton } from "@/components/auth/GoogleExportButton";

export function GoogleConnectionBanner() {
  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 text-blue-600 shadow-sm">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Google Drive 연결 전략
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              로그인과 Drive 권한 요청을 분리해 초기 진입은 가볍게, 내보내기
              시점에만 추가 권한을 요청합니다.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            최소 권한 원칙 적용
          </div>
          <GoogleExportButton />
        </div>
      </div>
    </section>
  );
}
