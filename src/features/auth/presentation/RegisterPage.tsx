import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { Card } from '@src/shared/presentation/components/ui/Card';
import { useAuthControllerRegister } from '@features/auth/infrastructure/api/인증-auth/인증-auth';
import logoIcon from '@assets/logo.webp';
import { ROUTES } from '@src/shared/constants';

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToastStore();

  const registerMutation = useAuthControllerRegister();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    // 영문, 숫자, 특수문자 포함 최소 8자 (RegisterDto 패턴 참고)
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return pattern.test(password);
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
        onError: (error: any) => {
          console.error('[Register] API Error:', error);
          // 409 Conflict 등 에러 처리
          if (error.status === 409) {
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorMsg.includes('이메일')}
              autoFocus
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errorMsg.includes('비밀번호') && !errorMsg.includes('일치')}
              helperText="영문, 숫자, 특수문자 포함 8자 이상"
            />
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              error={errorMsg.includes('일치')}
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
              <p className="text-center text-[12px] leading-relaxed font-medium text-red-500">
                {errorMsg}
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg"
            onClick={handleRegister}
            isLoading={registerMutation.isPending}
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
              onClick={handleGoLogin}
            >
              로그인
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
