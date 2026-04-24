import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';
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
    <div className='flex justify-center items-center h-full bg-bg p-lg box-border select-none'>
      <div className='bg-white px-xl py-2xl rounded-xl shadow-lg w-full max-w-[320px] min-h-[500px] text-center flex flex-col items-center justify-center dark:bg-[#151515] transition-colors duration-300'>
        <img
          src={logoIcon}
          alt='logo'
          className='w-[60px] h-[60px] mb-sm rounded-lg object-contain shadow-sm'
        />
        <h1 className='text-[30px] font-black m-0 mb-xl text-black tracking-[-0.05em] leading-none dark:text-white'>
          Tickit
        </h1>

        {isLoggedIn ? (
          <div className='flex flex-col gap-3 w-full animate-in fade-in zoom-in duration-300'>
            <p className='text-sm text-gray-medium py-md'>
              <strong className='text-black dark:text-white font-bold'>
                {user?.name}
              </strong>
              님, 환영합니다! 🎉
            </p>
            <Button
              variant='primary'
              size='lg'
              className='w-full'
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <div className='flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='flex flex-col gap-2 w-full'>
              <Input
                type='text'
                placeholder='아이디'
              />
              <Input
                type='password'
                placeholder='비밀번호'
              />
            </div>

            <Button
              variant='primary'
              size='lg'
              className='w-full'
              onClick={handleLogin}
            >
              로그인
            </Button>

            <div className="flex items-center my-6 text-gray-medium/40 text-[11px] font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:border-b before:border-gray-light/20 after:content-[''] after:flex-1 after:border-b after:border-gray-light/20 gap-3">
              OR
            </div>

            <Button
              variant='secondary'
              className='flex items-center justify-center gap-3 w-full !bg-white dark:!bg-[#2c2c2c] !text-black dark:!text-white border border-gray-light/30'
              onClick={handleGoogleLogin}
            >
              <Icon name='google' size={16} />
              Google로 계속하기
            </Button>
          </div>
        )}

        <button
          className='mt-xl bg-none border-none text-[12px] text-gray-medium/60 cursor-pointer hover:text-black dark:hover:text-white transition-colors hover:underline underline-offset-4'
          onClick={handleGoMain}
        >
          메인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
