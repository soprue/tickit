import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import { SocialButton } from '@src/shared/presentation/components/ui/SocialButton';
import logoIcon from '@assets/logo.webp';
import { useLoginUI } from './hooks/useLoginUI';

export default function LoginPage() {
  const ui = useLoginUI();

  return (
    <div className="bg-bg p-lg box-border flex h-full items-center justify-center select-none">
      <Card
        padded={false}
        className="animate-in fade-in zoom-in-95 flex w-full max-w-[360px] flex-col duration-500"
      >
        <div className="px-xl pt-2xl pb-lg flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <img
              src={logoIcon}
              alt="logo"
              className="h-[32px] w-[32px] rounded-lg object-contain"
            />
            <h1 className="text-text-primary m-0 text-[24px] font-black tracking-tighter">
              Tickit
            </h1>
          </div>
          <p className="text-gray-medium mt-2 text-[14px]">
            반가워요! 다시 만나서 기뻐요.
          </p>
        </div>

        <div className="px-xl pb-xl flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="이메일"
                value={ui.email}
                onChange={(e) => ui.setEmail(e.target.value)}
                error={ui.errorMsg.includes('이메일') || (ui.errorMsg && !ui.email)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={ui.password}
                onChange={(e) => ui.setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ui.handleLogin()}
                error={ui.errorMsg.includes('비밀번호') || (ui.errorMsg && !ui.password)}
              />
            </div>

            {ui.errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-500/10">
                <p className="text-red-500 text-[12px] leading-relaxed font-medium">
                  {ui.errorMsg}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg"
                onClick={ui.handleLogin}
                isLoading={ui.isLoading}
              >
                로그인
              </Button>
            </div>

            <div className="text-text-muted before:border-border-alpha after:border-border-alpha my-2 flex items-center gap-3 text-[11px] font-bold tracking-wider uppercase before:flex-1 before:border-b before:content-[''] after:flex-1 after:border-b after:content-['']">
              또는
            </div>

            <SocialButton provider="google" onClick={ui.handleGoogleLogin} />
          </div>
        </div>

        <div className="bg-gray-soft/50 px-xl py-lg flex flex-col items-center gap-3 text-center dark:bg-white/5">
          <p className="text-gray-medium text-[13px]">
            계정이 없으신가요?{' '}
            <button
              className="text-primary cursor-pointer border-none bg-none font-bold hover:underline"
              onClick={ui.goToRegister}
            >
              회원가입
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
