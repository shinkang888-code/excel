import { NextResponse } from "next/server";
import { z } from "zod";

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

  return NextResponse.json({
    connectionStatus: "active",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
    message:
      "실서비스에서는 이 위치에서 authorization code를 exchange 하고 refresh token을 저장합니다.",
  });
}
