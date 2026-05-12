import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import { useAuthControllerLogin } from '@features/auth/infrastructure/api/인증-auth/인증-auth';
import { useUsersControllerGetProfile } from '@features/auth/infrastructure/api/사용자-users/사용자-users';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { isLoggedIn, user, setAuth, clearAuth } = useAuthStore();
  const { showToast } = useToastStore();
  
  const loginMutation = useAuthControllerLogin();
  const { refetch: fetchProfile } = useUsersControllerGetProfile({
    query: { enabled: false }
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setErrorMsg('');
    
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: async (response) => {
          console.log('[Login] Response Data:', response);
          
          // Orval/Axios를 거쳐온 데이터가 response 또는 response.data에 들어있을 수 있습니다.
          const data = (response as any).data || response;
          
          const { access_token, user: userData } = data;

          if (access_token && userData) {
            console.log('[Login] Success! Token and User found.');
            setAuth(userData, access_token);
            showToast('로그인에 성공했습니다.', 'success');
            navigate('/');
            return;
          }
          
          setErrorMsg('로그인 응답 형식이 올바르지 않습니다.');
          console.error('[Login] Format Error. Expected { access_token, user }, but got:', data);
        },
        onError: (error) => {
          console.error('[Login] API Error:', error);
          setErrorMsg('이메일 또는 비밀번호가 일치하지 않습니다.');
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 URL로 이동
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleLogout = () => {
    clearAuth();
    showToast('로그아웃 되었습니다.', 'info');
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
              <strong className="text-text-primary font-bold">{user?.email}</strong>
              님, 환영합니다! 🎉
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col gap-3 duration-500">
            <div className="flex w-full flex-col gap-2">
              <Input
                type="text"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-[12px] mt-1 text-left">{errorMsg}</p>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
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
