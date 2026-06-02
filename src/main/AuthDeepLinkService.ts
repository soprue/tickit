import { app, shell, type BrowserWindow } from 'electron';
import path from 'node:path';
import type { UserEntity } from '../features/auth/infrastructure/api/model';

type AuthResult = {
  access_token: string;
  refresh_token?: string;
  user: UserEntity;
} | null;

interface AuthSession {
  resolve: (value: AuthResult) => void;
  timeout: NodeJS.Timeout;
}

interface AuthDeepLinkServiceOptions {
  protocol: string;
  apiUrl: string;
  getMainWindow: () => BrowserWindow | null;
}

const AUTH_TIMEOUT_MS = 120000;

export class AuthDeepLinkService {
  private currentSession: AuthSession | null = null;
  private readonly protocol: string;
  private readonly apiUrl: string;
  private readonly getMainWindow: () => BrowserWindow | null;

  constructor({ protocol, apiUrl, getMainWindow }: AuthDeepLinkServiceOptions) {
    this.protocol = protocol;
    this.apiUrl = apiUrl;
    this.getMainWindow = getMainWindow;
  }

  registerProtocol() {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(this.protocol, process.execPath, [
          path.resolve(process.argv[1]),
        ]);
      }
      return;
    }

    app.setAsDefaultProtocolClient(this.protocol);
  }

  registerAppListeners() {
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.handleDeepLink(url);
    });
  }

  handleSecondInstance(commandLine: string[]) {
    this.focusMainWindow({ show: false });

    const url = commandLine.find((arg) => arg.startsWith(`${this.protocol}://`));
    if (url) {
      this.handleDeepLink(url);
    }
  }

  startGoogleAuth() {
    this.cancelCurrentSession();
    shell.openExternal(`${this.apiUrl}/api/auth/google`);

    return new Promise<AuthResult>((resolve) => {
      const timeout = setTimeout(() => {
        if (this.currentSession?.resolve === resolve) {
          console.warn('[Auth] Timeout: User did not complete login in time');
          this.currentSession = null;
          resolve(null);
        }
      }, AUTH_TIMEOUT_MS);

      this.currentSession = { resolve, timeout };
    });
  }

  private handleDeepLink(url: string) {
    if (!url || !url.startsWith(`${this.protocol}://`)) return;

    try {
      const urlObj = new URL(url);
      const accessToken = urlObj.searchParams.get('access_token');
      const refreshToken = urlObj.searchParams.get('refresh_token');
      const userDataStr = urlObj.searchParams.get('user');

      if (!accessToken || !userDataStr || !this.currentSession) {
        return;
      }

      const user = JSON.parse(decodeURIComponent(userDataStr));
      this.currentSession.resolve({
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        user,
      });

      clearTimeout(this.currentSession.timeout);
      this.currentSession = null;
      this.focusMainWindow({ show: true });
    } catch (e) {
      console.error('[DeepLink] Failed to parse URL or data:', e);
    }
  }

  private cancelCurrentSession() {
    if (!this.currentSession) {
      return;
    }

    clearTimeout(this.currentSession.timeout);
    this.currentSession.resolve(null);
    this.currentSession = null;
  }

  private focusMainWindow({ show }: { show: boolean }) {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (show) {
      mainWindow.show();
    }
    mainWindow.focus();
  }
}
