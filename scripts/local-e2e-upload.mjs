import fs from "node:fs";

const baseUrl = "http://localhost:3000";
const filePath = "test-upload.xlsx";

const fileBytes = fs.readFileSync(filePath);
const formData = new FormData();

// Next.js route에서 `file instanceof File` 체크를 통과시키기 위해 File 객체로 전송합니다.
const file = new File([fileBytes], filePath, {
  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});
formData.append("file", file);

const uploadRes = await fetch(`${baseUrl}/api/upload`, {
  method: "POST",
  body: formData,
});

const uploadJson = await uploadRes.json().catch(() => ({}));
console.log("UPLOAD_STATUS", uploadRes.status);
console.log("UPLOAD_BODY", JSON.stringify(uploadJson));

if (!uploadRes.ok) {
  process.exit(1);
}

const jobId = uploadJson.jobId;

const convertRes = await fetch(`${baseUrl}/api/convert`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jobId, createShareLink: false }),
});

const convertJson = await convertRes.json().catch(() => ({}));
console.log("CONVERT_STATUS", convertRes.status);
console.log("CONVERT_BODY", JSON.stringify(convertJson));

if (!convertRes.ok) {
  process.exit(1);
}

const detailRes = await fetch(`${baseUrl}/convert/${encodeURIComponent(jobId)}`);
const detailHtml = await detailRes.text();
console.log("DETAIL_STATUS", detailRes.status, "HTML_LEN", detailHtml.length);

const match = detailHtml.match(
  /https:\/\/docs\.google\.com\/spreadsheets\/d\/[^"\s<]+/
);
console.log("GOOGLE_SHEET_HREF", match ? match[0] : null);

