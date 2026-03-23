# 인증 및 Google 권한 흐름

## 목표
로그인은 간단하게 유지하고, `Google Drive` 및 `Google Sheets` 권한은 실제 내보내기 시점에만 요청한다. 이렇게 하면 초기 이탈을 줄이고, 최소 권한 원칙을 지킬 수 있다.

## 인증 구조
- 앱 세션: `Supabase Auth`
- Google 사용자 식별: `Google OAuth / OpenID Connect`
- Google API 실행 권한: `Google Identity Services Authorization Code Flow`

## 권장 아키텍처
1. 사용자가 앱에 진입하면 `Google로 로그인` 버튼을 누른다.
2. 앱은 `Supabase Auth with Google`을 사용해 기본 세션을 생성한다.
3. 사용자는 로그인 직후 업로드/분석/미리보기까지 진행할 수 있다.
4. 사용자가 `Google Sheets로 생성` 버튼을 누르면, 그때 `Drive/Sheets scope`를 추가 요청한다.
5. 서버는 authorization code를 교환하고, 암호화된 refresh token을 저장한다.
6. 변환 작업 시 서버가 사용자 대신 Google API를 호출한다.

## 권장 Scope

### 1. 로그인용
아래 범위만으로도 사용자 식별은 충분하다.

- `openid`
- `email`
- `profile`

### 2. 내보내기용
아래 범위는 실제 Google Sheets 파일 생성 시에만 요청한다.

- `https://www.googleapis.com/auth/drive.file`

`drive.file`은 앱이 생성하거나 사용자가 명시적으로 연 파일만 다룰 수 있어 `drive` 전체 범위보다 안전하다. Google Sheets 생성과 수정도 이 범위 안에서 처리하는 것을 기본 전략으로 둔다.

## 사용자 흐름

### A. 앱 로그인
1. 랜딩 페이지에서 `Google로 시작하기`
2. Supabase OAuth로 로그인
3. `profiles` 레코드 생성 또는 갱신
4. 대시보드 이동

### B. Google 내보내기 권한 요청
1. 사용자가 파일 분석 후 `Google Sheets로 생성` 선택
2. 브라우저에서 GIS 팝업 실행
3. authorization code를 서버로 전달
4. 서버가 Google token endpoint와 교환
5. refresh token 저장
6. `google_connections.status = active`
7. 변환 작업 큐 진입

## 토큰 저장 정책
- access token은 메모리 또는 단기 캐시에만 유지
- refresh token만 암호화 저장
- DB 컬럼은 `refresh_token_encrypted` 하나만 기본 사용
- access token 만료 시 refresh token으로 재발급
- 사용자가 연결 해제하면 토큰을 논리 삭제하고 Google revoke를 시도

## 보안 요구사항
- OAuth는 `authorization code flow`를 사용한다.
- redirect URI는 운영/개발 환경별로 분리한다.
- `state` 값을 사용해 CSRF를 방지한다.
- 팝업 실패와 권한 거부를 별도 상태로 기록한다.
- 서버에서만 token exchange를 수행한다.
- 클라이언트에 refresh token을 노출하지 않는다.

## 예외 처리 정책
- 로그인은 되었지만 Drive 권한이 없는 경우:
  - 업로드 및 미리보기는 허용
  - `Google Sheets로 생성`에서만 추가 권한 요청
- 권한 거부:
  - 현재 세션 유지
  - 변환 결과는 사이트 미리보기/리포트까지만 제공
- refresh token 무효:
  - 연결 상태를 `expired`로 변경
  - 다시 연결 유도

## 연결 상태 정의
- `pending`: 연결 시작 전
- `active`: API 호출 가능
- `expired`: 재연결 필요
- `revoked`: 사용자가 연결 해제
- `error`: 토큰 교환 또는 검증 실패

## 환경 변수
아래 값을 환경 변수로 관리한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `APP_BASE_URL`
- `TOKEN_ENCRYPTION_KEY`

## 구현 메모
- Next.js 앱 라우터 기준으로 서버 라우트에서 code exchange 처리
- 브라우저는 GIS 팝업만 담당하고, 민감한 토큰은 서버만 다룸
- 사용자당 Google 연결은 기본 `1개`
- 향후 팀 기능이 생기면 워크스페이스별 공유 연결이 아니라 `사용자 개인 Drive 연결`을 유지한다
