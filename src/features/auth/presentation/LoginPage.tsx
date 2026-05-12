import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import { useAuthControllerLogin } from '../infrastructure/api/인증-auth/인증-auth';
import { useUsersControllerGetProfile } from '../infrastructure/api/사용자-users/사용자-users';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { isLoggedIn, user, setAuth, clearAuth } = useAuthStore();
  
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
          // response.data가 { accessToken: string } 형태라고 가정
          // 만약 응답 구조가 다르면 백엔드 명세에 맞춰 수정 필요
          const authData = response.data as { accessToken: string };
          
          if (authData?.accessToken) {
            // 1. 토큰 먼저 임시 저장 (인터셉터에서 사용하기 위함)
            // 실제로는 setAuth에서 한꺼번에 처리하지만, 프로필 조회를 위해 accessToken이 필요함
            // 여기서는 단순화를 위해 fetchProfile 호출 시 헤더를 직접 넘기거나,
            // Zustand의 토큰을 먼저 업데이트합니다.
            
            // 임시로 유저 정보 없이 토큰만 먼저 저장하거나, 프로필을 먼저 가져옵니다.
            // 여기서는 프로필을 가져온 후 최종적으로 setAuth를 호출하는 방식을 선택합니다.
            
            // 토큰을 스토어에 세팅 (유저는 아직 null)
            useAuthStore.setState({ accessToken: authData.accessToken });
            
            try {
              const profileResponse = await fetchProfile();
              if (profileResponse.data?.data) {
                setAuth(profileResponse.data.data, authData.accessToken);
                navigate('/');
              } else {
                setErrorMsg('사용자 정보를 가져오는데 실패했습니다.');
              }
            } catch (err) {
              setErrorMsg('로그인 세션 생성 중 오류가 발생했습니다.');
            }
          } else {
            setErrorMsg('로그인 정보가 올바르지 않습니다.');
          }
        },
        onError: () => {
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
