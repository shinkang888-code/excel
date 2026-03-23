# API 계약 초안

## 공통 규칙
- 인증된 사용자만 `/api/jobs/*`와 `/api/google/*`를 호출할 수 있다.
- 모든 응답은 `application/json` 기준으로 한다.
- 에러 응답은 아래 구조를 따른다.

```json
{
  "error": {
    "code": "GOOGLE_AUTH_REQUIRED",
    "message": "Google Drive 연결이 필요합니다."
  }
}
```

## 1. 파일 업로드

### `POST /api/upload`
엑셀 파일 업로드와 job 생성을 동시에 수행한다.

요청
- `multipart/form-data`
- 필드
  - `file`

응답 예시
```json
{
  "jobId": "a0f91f65-6495-4b10-954d-9fd1f7800001",
  "status": "uploaded",
  "fileMeta": {
    "name": "sample.xlsx",
    "sizeBytes": 124500,
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

## 2. 파일 분석 결과 조회

### `GET /api/jobs/:jobId`
현재 작업 상태와 미리보기 요약을 반환한다.

응답 예시
```json
{
  "job": {
    "id": "a0f91f65-6495-4b10-954d-9fd1f7800001",
    "status": "ready_for_export",
    "compatibilityScore": 82.5,
    "sheetCount": 6,
    "googleSheetUrl": null
  },
  "preview": {
    "sheets": [
      {
        "name": "매출현황",
        "index": 0,
        "compatibilityScore": 88,
        "flags": ["formula", "merged_cells", "chart_detected"]
      }
    ]
  }
}
```

## 3. 변환 시작

### `POST /api/convert`
Google Sheets 생성 작업을 큐에 등록한다.

요청 예시
```json
{
  "jobId": "a0f91f65-6495-4b10-954d-9fd1f7800001",
  "targetFolderId": "1aBcDxyz",
  "createShareLink": false
}
```

응답 예시
```json
{
  "jobId": "a0f91f65-6495-4b10-954d-9fd1f7800001",
  "status": "queued"
}
```

## 4. 변환 리포트 조회

### `GET /api/jobs/:jobId/report`
최종 리포트를 반환한다.

응답 예시
```json
{
  "summary": {
    "status": "partial_success",
    "compatibilityScore": 79.2,
    "preservedCount": 18,
    "partialCount": 4,
    "unsupportedCount": 2,
    "failedCount": 1
  },
  "items": [
    {
      "feature": "pivot_chart",
      "level": "unsupported",
      "message": "피벗 차트는 자동 재생성되지 않았습니다.",
      "action": "원본 데이터 시트를 바탕으로 Google Sheets에서 다시 생성하세요."
    }
  ]
}
```

## 5. 작업 목록

### `GET /api/jobs`
현재 사용자의 작업 이력을 페이지네이션으로 반환한다.

쿼리 파라미터
- `status?`
- `q?`
- `cursor?`
- `limit?`

## 6. Google 권한 요청 시작

### `POST /api/google/authorize`
클라이언트에서 받은 authorization code를 서버가 교환한다.

요청 예시
```json
{
  "code": "4/0Adeu5BX...",
  "state": "csrf-state-value"
}
```

응답 예시
```json
{
  "connectionStatus": "active"
}
```

## 7. Google 연결 상태 조회

### `GET /api/google/connection`
Google 내보내기 가능 여부를 반환한다.

응답 예시
```json
{
  "status": "active",
  "scopes": [
    "https://www.googleapis.com/auth/drive.file"
  ],
  "lastValidatedAt": "2026-03-18T09:00:00.000Z"
}
```

## 8. Google 연결 해제

### `DELETE /api/google/connection`
저장된 refresh token을 논리 삭제하고 연결 상태를 해제한다.

응답 예시
```json
{
  "status": "revoked"
}
```

## 에러 코드 표준
- `UNAUTHORIZED`
- `FILE_TOO_LARGE`
- `UNSUPPORTED_FILE_TYPE`
- `WORKBOOK_PARSE_FAILED`
- `GOOGLE_AUTH_REQUIRED`
- `GOOGLE_AUTH_DENIED`
- `GOOGLE_TOKEN_EXPIRED`
- `GOOGLE_QUOTA_EXCEEDED`
- `CONVERSION_PARTIAL_FAILURE`
- `CONVERSION_FAILED`
