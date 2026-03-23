import type { ConversionJob } from "@/types/conversion";

export const mockJobs: ConversionJob[] = [
  {
    id: "job-001",
    fileName: "brand-kit.xlsx",
    status: "partial_success",
    compatibilityScore: 84,
    createdAt: "2026-03-18T10:30:00.000Z",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/mock-sheet-1",
    preview: [
      {
        index: 0,
        name: "Overview",
        compatibilityScore: 91,
        flags: ["formula", "merged_cells", "chart_detected"],
      },
      {
        index: 1,
        name: "Dashboard",
        compatibilityScore: 77,
        flags: ["conditional_formatting", "pivot_detected"],
      },
    ],
    items: [
      {
        feature: "chart",
        level: "partial",
        message: "차트 구조는 유지됐지만 일부 시각 옵션은 달라질 수 있습니다.",
        action: "Google Sheets에서 범례와 축 옵션을 확인하세요.",
      },
      {
        feature: "pivot_chart",
        level: "unsupported",
        message: "피벗 차트는 자동 재생성되지 않았습니다.",
        action: "원본 데이터 시트를 기준으로 다시 생성하세요.",
      },
    ],
  },
];

export const sampleCompatibilitySummary = [
  {
    label: "자동 보존",
    value: 18,
  },
  {
    label: "부분 지원",
    value: 4,
  },
  {
    label: "미지원",
    value: 2,
  },
];
