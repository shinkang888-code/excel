import Link from "next/link";
import { ArrowRight, FileSpreadsheet, Sparkles, Wand2 } from "lucide-react";

const featureCards = [
  {
    title: "서식 중심 자동 변환",
    description:
      "색상, 폰트, 병합 셀, 열 너비, 주요 수식을 우선 보존하는 변환 흐름입니다.",
    icon: FileSpreadsheet,
  },
  {
    title: "고급 객체 사전 분석",
    description:
      "차트, 피벗, 매크로, 조건부 서식을 업로드 직후 감지해 리스크를 미리 보여줍니다.",
    icon: Sparkles,
  },
  {
    title: "Google Sheets 바로 생성",
    description:
      "Google 로그인 후 사용자의 Drive에 새 스프레드시트를 만들고 결과 링크를 즉시 제공합니다.",
    icon: Wand2,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 lg:px-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Excel to Google Sheets</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            SheetMorph
          </h1>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium !text-white transition hover:bg-slate-800 [&_svg]:!text-white"
        >
          Google로 시작
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            추천 MVP 흐름
          </div>
          <h2 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 lg:text-6xl">
            엑셀 서식 파일을 업로드하면
            <br />
            Google Sheets로 자동 변환
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
            업로드, 구조 분석, 호환성 리포트, Google Drive 저장까지 한 흐름으로
            묶은 서비스입니다. 100% 동일 복제보다, 자동 보존 가능한 부분과
            수동 확인이 필요한 부분을 명확히 보여주는 제품으로 설계합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium !text-white transition hover:bg-slate-800 [&_svg]:!text-white"
            >
              대시보드 보기
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              로그인 흐름 보기
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <p className="text-sm text-slate-300">호환성 예측</p>
            <p className="mt-3 text-4xl font-semibold">84%</p>
            <p className="mt-2 text-sm text-slate-300">
              기본 서식은 유지되고, 피벗 차트와 수식 기반 조건부 서식은 수동
              확인이 필요합니다.
            </p>
          </div>
          <div className="mt-4 grid gap-4">
            {[
              "기본 서식, 병합 셀, 주요 수식 자동 보존",
              "차트/이미지/조건부 서식은 부분 지원",
              "VBA 매크로와 외부 연결은 리포트 우선",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
