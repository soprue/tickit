import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useAuthControllerLogin } from '@features/auth/infrastructure/api/인증-auth/인증-auth';
import type { UserEntity } from '@features/auth/infrastructure/api/model';
import { ROUTES, IPC_CHANNELS } from '@src/shared/constants';
import { ipc } from '@src/shared/utils/ipc';

interface LoginResponse {
  access_token: string;
  user: UserEntity;
}

/**
 * 로그인 페이지의 상태와 비즈니스 로직을 관리하는 Facade Hook
 */
export function useLoginUI() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { setAuth } = useAuthStore((state) => state.actions);
  const { showToast } = useToastStore((state) => state.actions);

  const loginMutation = useAuthControllerLogin();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate(ROUTES.HOME, { replace: true });
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
          const data = response.data as LoginResponse;
          const { access_token, user: userData } = data;

          if (access_token && userData) {
            setAuth(userData, access_token);
            showToast('로그인에 성공했습니다.', 'success');
            navigate(ROUTES.HOME);
            return;
          }

          setErrorMsg('로그인 응답 형식이 올바르지 않습니다.');
        },
        onError: () => {
          setErrorMsg('이메일 또는 비밀번호가 일치하지 않습니다.');
        },
      }
    );
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await ipc.invoke(IPC_CHANNELS.AUTH_GOOGLE);

      if (result?.access_token && result?.user) {
        setAuth(result.user, result.access_token);
        showToast('구글 로그인에 성공했습니다.', 'success');
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      setErrorMsg('구글 로그인에 실패했습니다.');
    }
  };

  const goToRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  return {
    email,
    password,
    errorMsg,
    isLoading: loginMutation.isPending,
    setEmail,
    setPassword,
    handleLogin,
    handleGoogleLogin,
    goToRegister,
  };
}
