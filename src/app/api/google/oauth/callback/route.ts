import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      {
        error: {
          code: "GOOGLE_AUTH_DENIED",
          message: "Google authorization code가 없습니다.",
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    connectionStatus: "active",
    receivedState: state,
    message:
      "실서비스에서는 이 위치에서 authorization code를 교환하고 refresh token을 저장합니다.",
  });
}
