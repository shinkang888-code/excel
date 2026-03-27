import { NextResponse } from "next/server";
import { z } from "zod";

import { googleScopes } from "@/lib/google";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authorizeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = authorizeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_GOOGLE_AUTH_REQUEST",
          message: "authorization code와 state가 필요합니다.",
        },
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      connectionStatus: "active",
      scopes: googleScopes.export,
      message: "Supabase 연결이 불가능한 환경입니다. 데모로 연결 상태만 반환합니다.",
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

  // TODO: 실서비스에서는 parsed.data.code로 authorization code를 exchange 하고
  // refresh_token을 암호화하여 저장해야 합니다.
  const now = new Date().toISOString();
  const scopes = googleScopes.export;

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
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_UPSERT_FAILED",
          message: "사용자 프로필 생성에 실패했습니다.",
        },
      },
      { status: 500 },
    );
  }

  const { error: upsertError } = await adminClient
    .from("google_connections")
    .upsert(
      {
        user_id: user.id,
        provider: "google",
        status: "active",
        scopes,
        refresh_token_encrypted: null,
        token_expires_at: null,
        last_validated_at: now,
      },
      { onConflict: "user_id,provider" },
    );

  if (upsertError) {
    return NextResponse.json(
      {
        error: {
          code: "GOOGLE_CONNECTION_UPSERT_FAILED",
          message: "Google 권한 연결 상태 저장에 실패했습니다.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    connectionStatus: "active",
    scopes,
    message: "Google Drive 권한 연결 상태를 활성화했습니다.",
  });
}
