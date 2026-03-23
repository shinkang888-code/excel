import { GoogleLoginCard } from "@/components/auth/GoogleLoginCard";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.95fr]">
        <section>
          <p className="text-sm font-medium text-blue-600">로그인 단계</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            먼저 Google 계정으로 로그인하고,
            <br />
            Drive 권한은 나중에 요청합니다
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            추천 방식은 기본 로그인과 Drive/Sheets 권한을 분리하는 것입니다.
            이렇게 하면 초반 진입 장벽이 낮고, 실제 변환 버튼을 눌렀을 때만
            필요한 권한을 안전하게 요청할 수 있습니다.
          </p>
        </section>

        <GoogleLoginCard />
      </div>
    </main>
  );
}
