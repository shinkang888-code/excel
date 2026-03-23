import Link from "next/link";

import type { ConversionJob } from "@/types/conversion";

export function ConversionJobTable({ jobs }: { jobs: ConversionJob[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">최근 변환 작업</h2>
          <p className="mt-2 text-sm text-slate-600">
            최근 업로드된 파일과 변환 상태를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-3 font-medium">파일명</th>
              <th className="pb-3 font-medium">상태</th>
              <th className="pb-3 font-medium">호환성</th>
              <th className="pb-3 font-medium">생성일</th>
              <th className="pb-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="text-slate-700">
                <td className="py-4 font-medium">{job.fileName}</td>
                <td className="py-4">{job.status}</td>
                <td className="py-4">{job.compatibilityScore}%</td>
                <td className="py-4">
                  {new Date(job.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="py-4">
                  <Link
                    href={`/convert/${job.id}`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    결과 보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
