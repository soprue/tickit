import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import { useAuthControllerLogin } from '@features/auth/infrastructure/api/인증-auth/인증-auth';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const { showToast } = useToastStore();

  const loginMutation = useAuthControllerLogin();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setErrorMsg('');

    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: async (response) => {
          // Orval/Axios를 거쳐온 데이터 처리
          const data = (response as any).data || response;
          const { access_token, user: userData } = data;

          if (access_token && userData) {
            setAuth(userData, access_token);
            showToast('로그인에 성공했습니다.', 'success');
            navigate('/');
            return;
          }

          setErrorMsg('로그인 응답 형식이 올바르지 않습니다.');
        },
        onError: (error) => {
          console.error('[Login] API Error:', error);
          setErrorMsg('이메일 또는 비밀번호가 일치하지 않습니다.');
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="bg-bg p-lg box-border flex h-full items-center justify-center select-none">
      <Card
        padded={false}
        className="animate-in fade-in zoom-in-95 flex w-full max-w-[360px] flex-col duration-500"
      >
        {/* Header Section */}
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
          <p className="text-gray-medium mt-2 text-[14px]">반가워요! 다시 만나서 기뻐요</p>
        </div>

        {/* Content Section */}
        <div className="px-xl pb-xl flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errorMsg.includes('이메일') || (errorMsg && !email)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                error={errorMsg.includes('비밀번호') || (errorMsg && !password)}
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-500/10">
                <p className="text-[12px] leading-relaxed font-medium text-red-500">{errorMsg}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              onClick={handleLogin}
              isLoading={loginMutation.isPending}
            >
              로그인
            </Button>

            <div className="text-gray-medium/30 before:border-gray-light/20 after:border-gray-light/20 my-2 flex items-center gap-3 text-[11px] font-bold tracking-wider uppercase before:flex-1 before:border-b before:content-[''] after:flex-1 after:border-b after:content-['']">
              또는
            </div>

            <Button
              variant="secondary"
              className="flex w-full items-center justify-center gap-3 border border-[#dadce0] bg-white font-medium shadow-none transition-all hover:border-[#d2d4d7] hover:bg-[#f8f9fa] dark:border-[#444746] dark:bg-[#1f1f1f] dark:hover:border-[#5f6368] dark:hover:bg-[#2a2a2a]"
              onClick={handleGoogleLogin}
            >
              <Icon name="google" size={18} />
              <span className="text-text-primary text-[14px] tracking-tight">
                Google 계정으로 로그인
              </span>
            </Button>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-soft/50 px-xl py-lg flex flex-col items-center gap-3 text-center dark:bg-white/5">
          <p className="text-gray-medium text-[13px]">
            계정이 없으신가요?{' '}
            <button
              className="text-primary cursor-pointer border-none bg-none font-bold hover:underline"
              onClick={() => navigate('/register')}
            >
              회원가입
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
