import { useNavigate } from 'react-router-dom';

import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { Icon } from '@src/shared/presentation/components/Icon';
import logoIcon from '@assets/logo.webp';

function LoginPage() {
  const navigate = useNavigate();

  const { isLoggedIn, user } = authStore.getState();
  const { isDarkMode } = themeStore.getState();

  const handleLogin = () => {
    // 실제 서비스라면 여기서 입력값을 검증하거나 OAuth 등을 처리
    authStore.login('사용자', 'user@example.com');
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 연동 시 구현 예정
  };

  const handleLogout = () => {
    authStore.logout();
  };

  const handleGoMain = () => {
    navigate('/');
  };

  return (
    <div className={`login-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className='login-card'>
        <img src={logoIcon} alt='logo' className='login-logo' />
        <h1>Tickit</h1>
        {isLoggedIn ? (
          <div className='login-form'>
            <p className='status-msg'>
              <strong>{user?.name}</strong>님, 환영합니다! 🎉
            </p>
            <button className='login-button logout-btn' onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className='login-form'>
            <input type='text' className='login-input' placeholder='아이디' />
            <input
              type='password'
              className='login-input'
              placeholder='비밀번호'
            />
            <button
              className='login-button login-submit-btn'
              onClick={handleLogin}
            >
              로그인
            </button>

            <div className='divider'>또는</div>

            <div className='social-buttons'>
              <button
                className='btn-social google-login-btn'
                onClick={handleGoogleLogin}
              >
                <Icon name="google" size={18} style={{ marginRight: '8px' }} />
                Google로 계속하기
              </button>
            </div>
          </div>
        )}
        <button className='go-main-button go-main-btn' onClick={handleGoMain}>
          메인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
