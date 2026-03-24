import Link from "next/link";
import { notFound } from "next/navigation";

import { ConversionReport } from "@/components/convert/ConversionReport";
import { getConversionJobById } from "@/lib/conversion-jobs";
import { formatPercent } from "@/lib/utils";

export default async function ConvertDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getConversionJobById(jobId);

  if (!job) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">변환 결과</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {job.fileName}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          상태: <strong>{job.status}</strong> · 예상 호환성{" "}
          <strong>{formatPercent(job.compatibilityScore)}</strong>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {job.googleSheetUrl ? (
            <a
              href={job.googleSheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Google Sheets 열기
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-full bg-slate-300 px-5 py-3 text-sm font-medium text-slate-600"
            >
              Google Sheets 링크 준비 중
            </button>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            대시보드로 돌아가기
          </Link>
        </div>
        {!job.googleSheetUrl && (
          <p className="mt-3 text-sm text-slate-500">
            아직 Google Sheets URL이 생성되지 않았습니다. 변환 상태가 success 또는
            partial_success인지 확인해 주세요.
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {job.preview.map((sheet) => (
          <div
            key={sheet.name}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">Sheet {sheet.index + 1}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {sheet.name}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              호환성 점수 {formatPercent(sheet.compatibilityScore)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sheet.flags.map((flag) => (
                <span
                  key={flag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <ConversionReport items={job.items} />
    </main>
  );
}
