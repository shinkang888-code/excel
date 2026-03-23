## E2E 검증 보고서 (로컬): 임의 엑셀 업로드 -> 변환 -> 결과(구글시트 href) 표출

작성일: 2026-03-23

### 1) 검증 목적
대시보드에서 `업로드하고 분석 시작` 이후 `결과 보기`(= `/convert/[jobId]`) 화면으로 이동했을 때,
결과 화면에 Google Sheets로 연결되는 링크(`Google Sheets 열기` 버튼의 href)가 정상 표출되는지 확인한다.

### 2) 검증 대상 메뉴/라우트
- `대시보드` (`/dashboard`): 최근 변환 작업 테이블 표시
- `업로드 위저드` (`UploadWizard` 컴포넌트): `업로드하고 분석 시작`, `Google Sheets 생성 준비` 버튼
- `결과 보기` 상세 (`/convert/[jobId]`): `Google Sheets 열기` 버튼 렌더링

### 3) 테스트 환경
- 로컬 실행: `npm run dev` (Next.js 16.2.0, Turbo)
- 테스트용 파일: `test-upload.xlsx`
  - 생성 방식: Node + `xlsx` 라이브러리로 간단한 워크북 생성
- Supabase/Goolge 권한:
  - 로컬 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 미설정 상태로 확인됨
  - 따라서 서버가 Supabase를 사용할 수 없어 **mock 모드 폴백**으로 동작함

> 즉, “Google API로 실제 시트 생성”까지는 본 로컬 검증 범위에서 수행되지 않았고, 대신 결과 화면에 Google Sheets href가 정상 표출되는지에 집중해 검증했습니다.

### 4) 테스트 절차
1. 로컬 서버 실행: `http://localhost:3000`
2. `scripts/local-e2e-upload.mjs` 실행
   - `POST /api/upload`로 `test-upload.xlsx` 업로드
   - 응답의 `jobId`로 `POST /api/convert` 호출
   - `GET /convert/{jobId}` 호출 후 HTML에서 Google Sheets href 정규식 추출

### 5) 기대 결과
- `POST /api/upload`가 200을 반환하고 `jobId`를 제공한다.
- `POST /api/convert`가 200을 반환하고 상태가 성공(`partial_success` 등)으로 반영된다.
- `/convert/[jobId]` 페이지의 HTML에 `https://docs.google.com/spreadsheets/d/...` 형태의 링크가 포함된다.

### 6) 실제 결과
- `POST /api/upload`
  - HTTP 200
  - `jobId`: `job-001`
  - `status`: `uploaded`
  - `fileMeta.name`: `test-upload.xlsx`
- `POST /api/convert`
  - HTTP 200
  - `status`: `partial_success`
  - `message`: `데모 모드에서 Google Sheets 생성이 완료되었습니다.`
- `GET /convert/job-001`
  - HTTP 200
  - HTML에 포함된 Google Sheets href:
    - `https://docs.google.com/spreadsheets/d/mock-sheet-1`

### 7) 결론
로컬(mock 모드) 환경에서도
`업로드하고 분석 시작` -> `Google Sheets 생성 준비` -> `결과 보기`에서
Google Sheets 연결 링크가 실제로 렌더링되는 E2E 연결은 정상 동작함을 확인했다.

### 8) 운영/실제 Google 변환 검증을 위해 필요한 것 (추가 필요)
- Vercel(운영) 또는 로컬에 Supabase 환경변수 설정
- 실제 Google OAuth 및 Drive/Sheets API 연동 로직 구현(현재는 URL/상태 반영이 mock 기반)
- 로그인된 사용자 세션 상태에서 `/dashboard` -> `결과 보기` -> `Google Sheets 열기`까지 실제 시트 생성 링크인지 검증

