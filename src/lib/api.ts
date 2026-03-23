export interface UploadResponse {
  jobId: string;
  status: string;
  fileMeta: {
    name: string;
    sizeBytes: number;
    type: string;
  };
}

export async function uploadWorkbook(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as {
      error?: { message?: string };
    };

    throw new Error(errorBody.error?.message ?? "파일 업로드에 실패했습니다.");
  }

  return (await response.json()) as UploadResponse;
}

export async function requestConversion(jobId: string) {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId,
      createShareLink: false,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as {
      error?: { message?: string };
    };

    throw new Error(errorBody.error?.message ?? "변환 요청에 실패했습니다.");
  }

  return (await response.json()) as { jobId: string; status: string; message: string };
}
