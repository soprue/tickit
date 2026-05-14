import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import logoIcon from '@assets/logo.webp';
import { useRegisterUI } from './hooks/useRegisterUI';

/**
 * 회원가입 페이지 컴포넌트
 * UI 렌더링에만 집중하며, 로직은 useRegisterUI 훅에서 관리합니다.
 */
export default function RegisterPage() {
  const ui = useRegisterUI();

  return (
    <div className="bg-bg p-lg box-border flex h-full items-center justify-center select-none">
      <Card
        padded={false}
        className="animate-in fade-in zoom-in-95 flex w-full max-w-[360px] flex-col duration-500"
      >
        {/* Header Section */}
        <div className="px-xl pt-2xl pb-lg flex flex-col items-center">
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
          <p className="text-gray-medium mt-2 text-[14px]">새로운 여정을 시작해 보세요</p>
        </div>

        {/* Form Section */}
        <div className="px-xl pb-xl flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="이메일 주소"
              value={ui.email}
              onChange={(e) => ui.setEmail(e.target.value)}
              error={ui.errorMsg.includes('이메일')}
              autoFocus
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={ui.password}
              onChange={(e) => ui.setPassword(e.target.value)}
              error={ui.errorMsg.includes('비밀번호') && !ui.errorMsg.includes('일치')}
              helperText="영문, 숫자, 특수문자 포함 8자 이상"
            />
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={ui.confirmPassword}
              onChange={(e) => ui.setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ui.handleRegister()}
              error={ui.errorMsg.includes('일치')}
            />
          </div>

          {ui.errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
              <p className="text-center text-[12px] leading-relaxed font-medium text-red-500">
                {ui.errorMsg}
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg"
            onClick={ui.handleRegister}
            isLoading={ui.isLoading}
          >
            시작하기
          </Button>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-soft/50 px-xl py-lg flex flex-col items-center gap-3 text-center dark:bg-white/5">
          <p className="text-gray-medium text-[13px]">
            이미 계정이 있으신가요?{' '}
            <button
              className="text-primary cursor-pointer border-none bg-none font-bold hover:underline"
              onClick={ui.handleGoLogin}
            >
              로그인
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
