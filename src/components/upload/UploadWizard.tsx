"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUp, FolderSync, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { requestConversion, uploadWorkbook } from "@/lib/api";

const steps = [
  "파일 선택",
  "업로드",
  "구조 분석",
  "Google Sheets 생성",
];

export function UploadWizard() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "analyzing" | "done">(
    "idle",
  );

  const uploadMutation = useMutation({
    mutationFn: uploadWorkbook,
  });

  const convertMutation = useMutation({
    mutationFn: requestConversion,
  });

  useEffect(() => {
    if (phase === "uploading" && uploadMutation.isPending) {
      const timer = window.setInterval(() => {
        setProgress((prev) => Math.min(prev + 4, 65));
      }, 280);

      return () => window.clearInterval(timer);
    }

    if (phase === "analyzing" && convertMutation.isPending) {
      const timer = window.setInterval(() => {
        setProgress((prev) => Math.min(prev + 3, 95));
      }, 280);

      return () => window.clearInterval(timer);
    }
  }, [convertMutation.isPending, phase, uploadMutation.isPending]);

  const helperText = useMemo(() => {
    if (!selectedFile) {
      return "xlsx/xlsm 파일을 드래그하거나 클릭해서 업로드하세요.";
    }

    if (uploadMutation.isPending) {
      return `${selectedFile.name} 업로드 중입니다. 업로드가 끝나면 분석 준비 상태로 전환됩니다.`;
    }

    if (jobId) {
      return `${selectedFile.name} 업로드 완료. Job ID ${jobId}로 변환을 준비할 수 있습니다.`;
    }

    return `${selectedFile.name} 선택됨. 업로드를 눌러 분석을 시작하세요.`;
  }, [jobId, selectedFile, uploadMutation.isPending]);

  const progressDescription =
    phase === "uploading"
      ? "업로드 진행 중"
      : phase === "analyzing"
        ? "구조 분석 및 변환 준비 중"
        : phase === "done"
          ? "완료"
          : "대기 중";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">추천 시작점</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            업로드 위저드
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <Sparkles className="h-3.5 w-3.5" />
          MVP 기준 흐름
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((label, index) => {
          const currentStep = index + 1;
          const active = currentStep <= step;

          return (
            <div
              key={label}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {currentStep}. {label}
            </div>
          );
        })}
      </div>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-slate-500 hover:bg-slate-100">
        <FileUp className="h-10 w-10 text-slate-400" />
        <span className="mt-4 text-base font-medium text-slate-800">
          엑셀 서식 파일 업로드
        </span>
        <span className="mt-2 text-sm text-slate-500">{helperText}</span>
        <input
          className="hidden"
          type="file"
          accept=".xlsx,.xlsm"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
            if (file) {
              setStep(1);
              setJobId(null);
              setProgress(0);
              setPhase("idle");
            }
          }}
        />
      </label>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoCard title="자동 보존">
          병합 셀, 색상, 폰트, 열 너비, 주요 수식을 우선 보존합니다.
        </InfoCard>
        <InfoCard title="부분 지원">
          차트, 이미지, 조건부 서식은 가능한 범위에서 복원합니다.
        </InfoCard>
        <InfoCard title="수동 확인">
          피벗, 매크로, 외부 연결은 리포트와 함께 수동 확인이 필요합니다.
        </InfoCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!selectedFile) {
              window.alert("먼저 업로드할 엑셀 파일을 선택해 주세요.");
              return;
            }

            setStep(2);
            setPhase("uploading");
            setProgress(5);

            void uploadMutation
              .mutateAsync(selectedFile)
              .then((data) => {
                setJobId(data.jobId);
                setStep(3);
                setProgress(70);
                setPhase("idle");
                router.refresh();
              })
              .catch((error: unknown) => {
                setPhase("idle");
                setProgress(0);
                if (
                  error instanceof Error &&
                  error.message.includes("로그인이 필요합니다")
                ) {
                  window.alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
                  router.push("/login");
                }
              });
          }}
          disabled={!selectedFile || uploadMutation.isPending}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadMutation.isPending ? "업로드 중..." : "업로드하고 분석 시작"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!jobId) {
              window.alert("먼저 업로드를 완료해 주세요.");
              return;
            }

            setPhase("analyzing");
            setProgress((prev) => Math.max(prev, 72));

            void convertMutation
              .mutateAsync(jobId)
              .then(() => {
                setStep(4);
                setProgress(100);
                setPhase("done");
                router.refresh();
              })
              .catch((error: unknown) => {
                setPhase("idle");
                if (
                  error instanceof Error &&
                  error.message.includes("로그인이 필요합니다")
                ) {
                  window.alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
                  router.push("/login");
                }
              });
          }}
          disabled={!jobId || convertMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FolderSync className="h-4 w-4" />
          {convertMutation.isPending
            ? "변환 요청 중..."
            : "Google Sheets 생성 준비"}
        </button>
      </div>

      {progress > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <p className="font-medium text-slate-700">{progressDescription}</p>
            <p className="font-semibold text-slate-900">{progress}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {(uploadMutation.error || convertMutation.error || jobId) && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {uploadMutation.error instanceof Error && (
            <p>업로드 오류: {uploadMutation.error.message}</p>
          )}
          {convertMutation.error instanceof Error && (
            <p>변환 오류: {convertMutation.error.message}</p>
          )}
          {jobId && (
            <p className="font-medium">
              현재 Job ID: {jobId} · 업로드 후 분석/내보내기 흐름을 이어갈 수
              있습니다.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}
