import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const convertSchema = z.object({
  jobId: z.string().min(1),
  targetFolderId: z.string().optional(),
  createShareLink: z.boolean().optional(),
});

async function createGoogleSpreadsheet(
  accessToken: string,
  title: string,
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SHEETS_CREATE_FAILED:${response.status}:${body}`);
  }

  const payload = (await response.json()) as {
    spreadsheetId?: string;
    spreadsheetUrl?: string;
  };

  if (!payload.spreadsheetId || !payload.spreadsheetUrl) {
    throw new Error("SHEETS_CREATE_INVALID_RESPONSE");
  }

  return {
    spreadsheetId: payload.spreadsheetId,
    spreadsheetUrl: payload.spreadsheetUrl,
  };
}

async function moveFileToFolder(accessToken: string, fileId: string, folderId: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(folderId)}&fields=id,parents`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DRIVE_MOVE_FAILED:${response.status}:${body}`);
  }
}

async function createSharePermission(accessToken: string, fileId: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DRIVE_SHARE_FAILED:${response.status}:${body}`);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = convertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "변환 요청 형식이 올바르지 않습니다.",
        },
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    // Supabase 연결이 불가능한 환경에서는 데모용 mock 응답만 반환합니다.
    return NextResponse.json({
      jobId: parsed.data.jobId,
      status: "partial_success",
      message: "데모 모드에서 Google Sheets 생성이 완료되었습니다.",
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "로그인이 필요합니다.",
        },
      },
      { status: 401 },
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const providerToken = session?.provider_token;

  if (sessionError || !providerToken) {
    return NextResponse.json(
      {
        error: {
          code: "GOOGLE_SCOPE_REQUIRED",
          message:
            "Google Drive 권한이 필요합니다. 대시보드에서 'Google Drive 연결'을 먼저 진행해 주세요.",
        },
      },
      { status: 403 },
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("conversion_jobs")
    .select("id, status, google_sheet_url, started_at, source_file_name")
    .eq("id", parsed.data.jobId)
    .maybeSingle();

  if (jobError) {
    return NextResponse.json(
      {
        error: {
          code: "JOB_LOOKUP_FAILED",
          message: "변환 작업 조회에 실패했습니다.",
        },
      },
      { status: 500 },
    );
  }

  if (!job) {
    return NextResponse.json(
      {
        error: {
          code: "JOB_NOT_FOUND",
          message: "변환 작업을 찾을 수 없습니다.",
        },
      },
      { status: 404 },
    );
  }

  if (job.google_sheet_url) {
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      message: "이미 Google Sheets가 생성되어 있습니다.",
    });
  }

  const baseName =
    typeof job.source_file_name === "string"
      ? job.source_file_name.replace(/\.(xlsx|xlsm)$/i, "")
      : "ConvertedWorkbook";
  const dateToken = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const title = `${baseName}_Converted_${dateToken}`;

  let spreadsheetId: string;
  let spreadsheetUrl: string;

  try {
    const created = await createGoogleSpreadsheet(providerToken, title);
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl;

    if (parsed.data.targetFolderId) {
      await moveFileToFolder(providerToken, spreadsheetId, parsed.data.targetFolderId);
    }

    if (parsed.data.createShareLink) {
      await createSharePermission(providerToken, spreadsheetId);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json(
      {
        error: {
          code: "GOOGLE_SHEETS_CREATE_FAILED",
          message: "Google Sheets 생성에 실패했습니다.",
          reason,
        },
      },
      { status: 502 },
    );
  }

  const newStatus = "success";
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("conversion_jobs")
    .update({
      status: newStatus,
      google_file_id: spreadsheetId,
      google_sheet_url: spreadsheetUrl,
      started_at: job.started_at ?? now,
      completed_at: now,
      latest_error_code: null,
      latest_error_message: null,
    })
    .eq("id", parsed.data.jobId)
    .select("id, status")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      {
        error: {
          code: "CONVERT_UPDATE_FAILED",
          message: "Google Sheets 생성 결과 저장에 실패했습니다.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    jobId: updated.id,
    status: updated.status,
    message: "Google Sheets 생성이 완료되었습니다.",
  });
}
