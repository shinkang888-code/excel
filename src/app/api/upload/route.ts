import { NextResponse } from "next/server";

import { mockJobs } from "@/lib/mock-data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: {
          code: "FILE_REQUIRED",
          message: "업로드할 파일이 필요합니다.",
        },
      },
      { status: 400 },
    );
  }

  const validExtension = /\.(xlsx|xlsm)$/i.test(file.name);

  if (!validExtension) {
    return NextResponse.json(
      {
        error: {
          code: "UNSUPPORTED_FILE_TYPE",
          message: "xlsx 또는 xlsm 파일만 업로드할 수 있습니다.",
        },
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    // 환경 변수 미설정 등으로 Supabase 연결이 불가능한 경우, 데모용 mock 응답만 반환합니다.
    return NextResponse.json({
      jobId: mockJobs[0].id,
      status: "uploaded",
      fileMeta: {
        name: file.name,
        sizeBytes: file.size,
        type: file.type || "application/octet-stream",
      },
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

  if (!user.email) {
    return NextResponse.json(
      {
        error: {
          code: "NO_EMAIL",
          message: "Google 로그인 이메일 정보를 확인할 수 없습니다.",
        },
      },
      { status: 400 },
    );
  }

  const base = mockJobs[0];
  const preview = base.preview.map((sheet, index) => {
    if (index !== 0) return sheet;
    const flags = Array.from(new Set([...sheet.flags, "macro_detected"]));
    return { ...sheet, flags };
  });

  const report = [
    ...base.items,
    {
      feature: "vba_macro",
      level: "unsupported",
      message: "VBA 매크로는 Google Sheets에서 직접 실행되지 않습니다.",
      action: "리포트의 안내를 기반으로 매크로 기능을 대체/재설계하세요.",
    },
  ] as const;

  // 프로필 upsert는 service role 클라이언트로 RLS 우회하여 처리합니다.
  const adminClient = getSupabaseAdminClient() ?? supabase;
  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null,
      avatar_url:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    // 테이블 미존재 또는 RLS 이슈를 로그로만 남기고 job 생성은 계속합니다.
    console.error("[upload] profile upsert failed:", profileError.message, profileError.code);
    if (profileError.code === "42P01") {
      // 테이블이 존재하지 않으면 즉시 에러 반환
      return NextResponse.json(
        {
          error: {
            code: "SCHEMA_NOT_APPLIED",
            message:
              "데이터베이스 스키마가 적용되지 않았습니다. Supabase SQL Editor에서 마이그레이션을 실행해 주세요.",
          },
        },
        { status: 500 },
      );
    }
  }

  const sourceFilePath = `uploads/${user.id}/${file.name}`;
  const workbookName = file.name.replace(/\.(xlsx|xlsm)$/i, "");

  const { data: inserted, error: insertError } = await adminClient
    .from("conversion_jobs")
    .insert({
      user_id: user.id,
      google_connection_id: null,
      source_file_path: sourceFilePath,
      source_file_name: file.name,
      source_file_type: file.type || "application/octet-stream",
      source_file_size_bytes: file.size,
      status: "ready_for_export",
      workbook_name: workbookName,
      sheet_count: preview.length,
      total_cell_count: 0,
      preview_json: preview,
      report_json: report,
      compatibility_score: base.compatibilityScore,
      google_file_id: null,
      google_sheet_url: null,
    })
    .select("id, status")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      {
        error: {
          code: "UPLOAD_JOB_CREATE_FAILED",
          message: "변환 작업 생성에 실패했습니다.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    jobId: inserted.id,
    status: inserted.status,
    fileMeta: {
      name: file.name,
      sizeBytes: file.size,
      type: file.type || "application/octet-stream",
    },
  });
}
