import { NextResponse } from "next/server";

import { mockJobs } from "@/lib/mock-data";

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

  const newJob = {
    ...mockJobs[0],
    id: `job-${Date.now()}`,
    fileName: file.name,
    status: "uploaded" as const,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    jobId: newJob.id,
    status: newJob.status,
    fileMeta: {
      name: file.name,
      sizeBytes: file.size,
      type: file.type || "application/octet-stream",
    },
  });
}
