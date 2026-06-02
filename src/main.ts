import { BrowserWindow, app, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificationService } from './services/NotificationService';
import { mainStorage } from './infrastructure/MainStorage';
import { IPC_CHANNELS } from './shared/constants';
import type { UserEntity } from './features/auth/infrastructure/api/model';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notificationService = new NotificationService();
let mainWindow: BrowserWindow | null = null;

/**
 * 인증 상태 관리 객체
 */
interface AuthSession {
  resolve: (value: AuthResult) => void;
  timeout: NodeJS.Timeout;
}

type AuthResult = {
  access_token: string;
  refresh_token?: string;
  user: UserEntity;
} | null;
let currentAuthSession: AuthSession | null = null;

const PROTOCOL = 'tickit';
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 커스텀 프로토콜 등록
 */
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

/**
 * URL에서 인증 데이터를 추출 및 처리
 */
function handleDeepLink(url: string) {
  if (!url || !url.startsWith(`${PROTOCOL}://`)) return;

  try {
    const urlObj = new URL(url);
    const accessToken = urlObj.searchParams.get('access_token');
    const refreshToken = urlObj.searchParams.get('refresh_token');
    const userDataStr = urlObj.searchParams.get('user');

    if (accessToken && userDataStr && currentAuthSession) {
      const user = JSON.parse(decodeURIComponent(userDataStr));
      currentAuthSession.resolve({ 
        access_token: accessToken, 
        refresh_token: refreshToken || undefined, 
        user 
      });
      
      // 세션 종료
      clearTimeout(currentAuthSession.timeout);
      currentAuthSession = null;

      // 앱 윈도우 포커스
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    }
  } catch (e) {
    console.error('[DeepLink] Failed to parse URL or data:', e);
  }
}

// macOS: 앱이 실행 중일 때 URL 수신
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux/macOS 중복 실행 방지 및 URL 가로채기
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
    if (url) handleDeepLink(url);
  });
}

/**
 * IPC 핸들러
 */
ipcMain.handle(IPC_CHANNELS.SAVE, async (_event, { key, data }) => {
  return await mainStorage.write(key, data);
});

ipcMain.handle(IPC_CHANNELS.GET_ALL, async (_event, key) => {
  return await mainStorage.read(key);
});

ipcMain.handle(IPC_CHANNELS.SYNC_NOTIFICATIONS, async (_event, data) => {
  return await notificationService.syncData(data);
});

ipcMain.handle(IPC_CHANNELS.AUTH_GOOGLE, async () => {
  // 이전 세션이 있다면 취소 (새로운 요청 우선)
  if (currentAuthSession) {
    clearTimeout(currentAuthSession.timeout);
    currentAuthSession.resolve(null);
    currentAuthSession = null;
  }

  shell.openExternal(`${API_URL}/api/auth/google`);

  return new Promise<AuthResult>((resolve) => {
    const timeout = setTimeout(() => {
      if (currentAuthSession && currentAuthSession.resolve === resolve) {
        console.warn('[Auth] Timeout: User did not complete login in time');
        currentAuthSession = null;
        resolve(null);
      }
    }, 120000); // 2분 제한

    currentAuthSession = { resolve, timeout };
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    icon: path.join(__dirname, '../src/assets/logo.webp'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // 개발자 도구 (개발 모드일 때만 수동으로 열 수 있게 하거나 필요 시 제거)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  notificationService.start();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
