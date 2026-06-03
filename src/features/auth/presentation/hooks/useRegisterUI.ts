import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useAuthControllerRegister } from '@src/shared/infrastructure/api/인증-auth/인증-auth';
import { ROUTES } from '@src/shared/constants';
import { isApiError } from '@src/shared/utils/error';

/**
 * 회원가입 페이지의 상태와 비즈니스 로직을 관리하는 Facade Hook
 */
export function useRegisterUI() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToastStore((state) => state.actions);
  const registerMutation = useAuthControllerRegister();

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePassword = (val: string) => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return pattern.test(val);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMsg('모든 필드를 입력해 주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('유효한 이메일 형식이 아닙니다.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMsg('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    setErrorMsg('');

    registerMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: () => {
          showToast('회원가입에 성공했습니다. 로그인 해 주세요.', 'success');
          navigate(ROUTES.LOGIN);
        },
        onError: (error) => {
          if (isApiError(error) && error.status === 409) {
            setErrorMsg('이미 존재하는 이메일입니다.');
          } else {
            setErrorMsg('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
          }
        },
      }
    );
  };

  const handleGoLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return {
    email,
    password,
    confirmPassword,
    errorMsg,
    isLoading: registerMutation.isPending,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister,
    handleGoLogin,
  };
}
