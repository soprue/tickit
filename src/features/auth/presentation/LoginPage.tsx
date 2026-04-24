import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();

  const { isLoggedIn, user, login, logout } = useAuthStore();
  const { isDarkMode } = useThemeStore();

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
            <button
              className='w-full p-[14px] bg-primary text-white border-none rounded-lg text-base font-bold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/20'
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='flex flex-col gap-2 w-full'>
              <input
                type='text'
                className='w-full p-[14px] border border-gray-light/30 rounded-lg text-[14px] bg-bg text-black outline-none focus:border-primary focus:bg-white dark:bg-[#2c2c2c] dark:border-white/5 dark:text-white transition-all placeholder:text-gray-medium/50'
                placeholder='아이디'
              />
              <input
                type='password'
                className='w-full p-[14px] border border-gray-light/30 rounded-lg text-[14px] bg-bg text-black outline-none focus:border-primary focus:bg-white dark:bg-[#2c2c2c] dark:border-white/5 dark:text-white transition-all placeholder:text-gray-medium/50'
                placeholder='비밀번호'
              />
            </div>

            <button
              className='w-full p-[14px] bg-primary text-white border-none rounded-lg text-base font-bold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/20'
              onClick={handleLogin}
            >
              로그인
            </button>

            <div className="flex items-center my-6 text-gray-medium/40 text-[11px] font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:border-b before:border-gray-light/20 after:content-[''] after:flex-1 after:border-b after:border-gray-light/20 gap-3">
              OR
            </div>

            <button
              className='flex items-center justify-center gap-3 w-full p-[12px] rounded-lg text-[14px] border border-gray-light/30 bg-white text-black font-medium cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all dark:bg-[#2c2c2c] dark:border-white/5 dark:text-white dark:hover:bg-white/5'
              onClick={handleGoogleLogin}
            >
              <Icon name='google' size={16} />
              Google로 계속하기
            </button>
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
