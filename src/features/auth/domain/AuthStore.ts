import { Store } from '@core/Store';
import { STORAGE_KEYS } from '@src/shared/constants';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
}

class AuthStore extends Store<AuthState> {
  constructor() {
    super({
      isLoggedIn: false,
      user: null,
    }, STORAGE_KEYS.AUTH);
  }

  login(name: string, email: string) {
    this.setState({ isLoggedIn: true, user: { name, email } });
  }

  logout() {
    this.setState({ isLoggedIn: false, user: null });
  }
}

export const authStore = new AuthStore();
