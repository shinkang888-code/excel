import { mockJobs } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CompatibilityItem,
  ConversionJob,
  JobStatus,
  SheetPreview,
} from "@/types/conversion";

function asSheetPreviewList(value: unknown): SheetPreview[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const flags = Array.isArray(row.flags)
        ? row.flags.filter((flag): flag is string => typeof flag === "string")
        : [];

      return {
        index:
          typeof row.index === "number" && Number.isFinite(row.index)
            ? row.index
            : index,
        name: typeof row.name === "string" ? row.name : `Sheet ${index + 1}`,
        compatibilityScore: (() => {
          const score = row.compatibilityScore;
          if (typeof score === "number" && Number.isFinite(score)) return score;
          if (typeof score === "string") {
            const parsed = Number(score);
            if (Number.isFinite(parsed)) return parsed;
          }
          return 0;
        })(),
        flags,
      } satisfies SheetPreview;
    })
    .filter((item): item is SheetPreview => item !== null);
}

function asCompatibilityItems(value: unknown): CompatibilityItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const level = row.level;
      if (
        level !== "preserved" &&
        level !== "partial" &&
        level !== "unsupported" &&
        level !== "failed"
      ) {
        return null;
      }

      return {
        feature: typeof row.feature === "string" ? row.feature : "unknown",
        level,
        message: typeof row.message === "string" ? row.message : "",
        action: typeof row.action === "string" ? row.action : "",
      } satisfies CompatibilityItem;
    })
    .filter((item): item is CompatibilityItem => item !== null);
}

function mapRowToJob(row: Record<string, unknown>): ConversionJob | null {
  if (
    typeof row.id !== "string" ||
    typeof row.source_file_name !== "string" ||
    typeof row.status !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  const status = row.status;
  const validStatus = [
    "uploaded",
    "analyzing",
    "ready_for_export",
    "authorizing_google",
    "queued",
    "converting",
    "partial_success",
    "success",
    "failed",
  ].includes(status);

  if (!validStatus) {
    return null;
  }

  const compatibilityScoreRaw = (() => {
    const raw = row.compatibility_score;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  })();
  const previewRaw = row.preview_json;
  const reportRaw = row.report_json;

  return {
    id: row.id,
    fileName: row.source_file_name,
    status: status as JobStatus,
    compatibilityScore: compatibilityScoreRaw,
    createdAt: row.created_at,
    googleSheetUrl:
      typeof row.google_sheet_url === "string" ? row.google_sheet_url : undefined,
    preview: asSheetPreviewList(previewRaw),
    items: asCompatibilityItems(reportRaw),
  };
}

export async function getDashboardJobs(): Promise<ConversionJob[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return mockJobs;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mockJobs;
  }

  const { data, error } = await supabase
    .from("conversion_jobs")
    .select(
      "id, source_file_name, status, compatibility_score, created_at, google_sheet_url, preview_json, report_json",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return mockJobs;
  }

  const jobs = data
    .map((row) => mapRowToJob(row as Record<string, unknown>))
    .filter((job): job is ConversionJob => job !== null);

  return jobs.length > 0 ? jobs : mockJobs;
}

export async function getConversionJobById(jobId: string): Promise<ConversionJob | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const found = mockJobs.find((item) => item.id === jobId);
    if (found) return found;
    // Supabase가 없는 로컬 개발 모드에서 jobId가 mock 목록에 없을 때도 상세 페이지가 깨지지 않도록 처리합니다.
    const base = mockJobs[0];
    return {
      ...base,
      id: jobId,
      fileName: base.fileName ?? "업로드 파일",
      createdAt: new Date().toISOString(),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const found = mockJobs.find((item) => item.id === jobId);
    if (found) return found;
    const base = mockJobs[0];
    return {
      ...base,
      id: jobId,
      fileName: base.fileName ?? "업로드 파일",
      createdAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("conversion_jobs")
    .select(
      "id, source_file_name, status, compatibility_score, created_at, google_sheet_url, preview_json, report_json",
    )
    .eq("id", jobId)
    .maybeSingle();

  if (error || !data) {
    return mockJobs.find((item) => item.id === jobId) ?? null;
  }

  return mapRowToJob(data as Record<string, unknown>);
}
