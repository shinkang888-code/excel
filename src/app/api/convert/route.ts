import { NextResponse } from "next/server";
import { z } from "zod";

const convertSchema = z.object({
  jobId: z.string().min(1),
  targetFolderId: z.string().optional(),
  createShareLink: z.boolean().optional(),
});

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

  return NextResponse.json({
    jobId: parsed.data.jobId,
    status: "queued",
    message: "Google Sheets 생성 작업이 큐에 등록되었습니다.",
  });
}
