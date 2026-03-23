export type JobStatus =
  | "uploaded"
  | "analyzing"
  | "ready_for_export"
  | "authorizing_google"
  | "queued"
  | "converting"
  | "partial_success"
  | "success"
  | "failed";

export type SupportLevel = "preserved" | "partial" | "unsupported" | "failed";

export interface SheetPreview {
  index: number;
  name: string;
  compatibilityScore: number;
  flags: string[];
}

export interface CompatibilityItem {
  feature: string;
  level: SupportLevel;
  message: string;
  action: string;
}

export interface ConversionJob {
  id: string;
  fileName: string;
  status: JobStatus;
  compatibilityScore: number;
  createdAt: string;
  googleSheetUrl?: string;
  preview: SheetPreview[];
  items: CompatibilityItem[];
}
