import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { Router } from '@src/core/Router';

// 아이콘 임포트
import googleIcon from '@assets/icons/google.svg';
import logoIcon from '@assets/logo.webp';

export default class LoginPage extends Component<ComponentProps> {
  init() {
    this.subscribe(authStore);
    this.subscribe(themeStore);
  }

  setEvent() {
    this.addEvent('click', '.login-submit-btn', this.handleLogin.bind(this));
    this.addEvent(
      'click',
      '.google-login-btn',
      this.handleGoogleLogin.bind(this)
    );
    this.addEvent('click', '.logout-btn', this.handleLogout.bind(this));
    this.addEvent('click', '.go-main-btn', this.handleGoMain.bind(this));
  }

  handleLogin() {
    // 실제 서비스라면 여기서 입력값을 검증하거나 OAuth 등을 처리
    authStore.login('사용자', 'user@example.com');
    Router.getInstance().navigate('/');
  }

  handleGoogleLogin() {
    // 구글 로그인 연동 시 구현 예정
  }

  handleLogout() {
    authStore.logout();
  }

  handleGoMain() {
    Router.getInstance().navigate('/');
  }

  render() {
    const { isLoggedIn, user } = authStore.getState();
    const { isDarkMode } = themeStore.getState();

    return jsx`
      <div class="login-wrapper ${isDarkMode ? 'dark-mode' : ''}">
        <div class="login-card">
          <img src="${logoIcon}" alt="logo" class="login-logo" />
          <h1>Tickit</h1>

          ${
            isLoggedIn
              ? jsx`
                  <div class="login-form">
                    <p class="status-msg"><strong>${user?.name}</strong>님, 환영합니다! 🎉</p>
                    <button class="login-button logout-btn">로그아웃</button>
                  </div>
                `
              : jsx`
                  <div class="login-form">
                    <input type="text" class="login-input" placeholder="아이디" />
                    <input type="password" class="login-input" placeholder="비밀번호" />
                    <button class="login-button login-submit-btn">로그인</button>
                    
                    <div class="divider">또는</div>

                    <div class="social-buttons">
                      <button class="btn-social google-login-btn">
                        <img src="${googleIcon}" alt="Google" />
                        Google로 계속하기
                      </button>
                    </div>
                  </div>
                `
          }

          <button class="go-main-button go-main-btn">
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    `;
  }
}
