# 엑셀-구글시트 변환 서비스 명세 세트

이 워크스페이스는 `엑셀 서식 파일 업로드 -> 분석/미리보기 -> Google Sheets 생성 -> 호환성 리포트 제공` 흐름을 갖는 서비스의 개발명세 문서를 담고 있다.

## 문서 구성
- `docs/spec/mvp-scope.md`: MVP 범위, 상태 정의, 지원/미지원 표준 문구
- `docs/spec/auth-flow.md`: Supabase Auth + Google OAuth 권한 분리 설계
- `docs/spec/conversion-pipeline.md`: 업로드부터 변환 완료까지의 처리 파이프라인
- `docs/spec/api-contract.md`: API 요청/응답 계약 초안
- `docs/spec/ui-requirements.md`: 주요 화면과 컴포넌트 요구사항
- `docs/spec/risk-policy.md`: 매크로, 피벗, 차트, 조건부 서식 등 고위험 객체 정책
- `supabase/migrations/0001_initial_schema.sql`: 초기 데이터 모델, 인덱스, RLS 정책

## 권장 기술 스택
- `Next.js`
- `Tailwind CSS`
- `shadcn/ui`
- `Supabase Auth / Postgres / Storage`
- `Google Identity Services`
- `Google Drive API`
- `Google Sheets API`
- `TanStack Query`

## 권장 구현 순서
1. Supabase 프로젝트 생성 및 SQL 마이그레이션 적용
2. Google Cloud OAuth, Drive API, Sheets API 설정
3. Next.js 앱 초기화 및 인증 흐름 구현
4. 업로드/분석/미리보기 API 구현
5. 비동기 변환 워커 및 리포트 생성 구현
6. 대시보드, 결과 화면, 작업 이력 UI 구현

## 환경 변수
기본 예시는 `.env.example` 파일을 참고한다.

## UI 컴포넌트 설치 예시
프로젝트를 Next.js로 시작한 뒤 아래 명령으로 기본 UI 컴포넌트를 추가할 수 있다.

```bash
npx shadcn-ui@latest add button card dialog progress badge table tabs alert
```
