import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();

  const { isLoggedIn, user, login, logout } = useAuthStore();

  const handleLogin = () => {
    login('사용자', 'user@example.com');
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 연동 시 구현 예정
  };

  const handleLogout = () => {
    logout();
  };

  const handleGoMain = () => {
    navigate('/');
  };

  return (
    <div className="bg-bg p-lg box-border flex h-full items-center justify-center select-none">
      <Card className="py-2xl! flex min-h-[500px] w-full max-w-[320px] flex-col items-center justify-center text-center">
        <img
          src={logoIcon}
          alt="logo"
          className="mb-sm h-[60px] w-[60px] rounded-lg object-contain shadow-sm"
        />
        <h1 className="mb-xl text-text-primary m-0 text-[30px] leading-none font-black tracking-tighter">
          Tickit
        </h1>

        {isLoggedIn ? (
          <div className="animate-in fade-in zoom-in flex w-full flex-col gap-3 duration-300">
            <p className="text-gray-medium py-md text-sm">
              <strong className="text-text-primary font-bold">{user?.name}</strong>
              님, 환영합니다! 🎉
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col gap-3 duration-500">
            <div className="flex w-full flex-col gap-2">
              <Input type="text" placeholder="아이디" />
              <Input type="password" placeholder="비밀번호" />
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={handleLogin}>
              로그인
            </Button>

            <div className="text-gray-medium/40 before:border-gray-light/20 after:border-gray-light/20 my-6 flex items-center gap-3 text-[11px] font-bold tracking-wider uppercase before:flex-1 before:border-b before:content-[''] after:flex-1 after:border-b after:content-['']">
              OR
            </div>

            <Button
              variant="secondary"
              className="flex w-full items-center justify-center gap-3 border border-[#dadce0] bg-white font-medium shadow-none transition-all hover:border-[#d2d4d7] hover:bg-[#f8f9fa] dark:border-[#444746] dark:bg-[#1f1f1f] dark:hover:border-[#5f6368] dark:hover:bg-[#2a2a2a]"
              onClick={handleGoogleLogin}
            >
              <Icon name="google" size={20} />
              <span className="text-text-primary text-[14px] tracking-tight">
                Google 계정으로 로그인
              </span>
            </Button>
          </div>
        )}

        <button
          className="mt-xl text-gray-medium/60 hover:text-text-primary cursor-pointer border-none bg-none text-[12px] underline-offset-4 transition-colors hover:underline"
          onClick={handleGoMain}
        >
          메인 페이지로 돌아가기
        </button>
      </Card>
    </div>
  );
}

export default LoginPage;
