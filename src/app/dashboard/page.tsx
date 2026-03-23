import { GoogleConnectionBanner } from "@/components/auth/GoogleConnectionBanner";
import { ConversionJobTable } from "@/components/dashboard/ConversionJobTable";
import { UploadWizard } from "@/components/upload/UploadWizard";
import { mockJobs, sampleCompatibilitySummary } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            업로드, 분석, 변환 상태를 한 번에 관리
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            추천 흐름은 업로드 직후 고위험 요소를 분석하고, 사용자가 확인한 뒤
            Google Sheets 생성 권한을 요청하는 방식입니다.
          </p>
        </div>
      </section>

      <GoogleConnectionBanner />

      <section className="grid gap-4 md:grid-cols-3">
        {sampleCompatibilitySummary.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <UploadWizard />
      <ConversionJobTable jobs={mockJobs} />
    </main>
  );
}
