import { BrowserWindow, app, ipcMain, nativeImage, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificationService } from './services/NotificationService';
import { mainStorage } from './infrastructure/MainStorage';
import { IPC_CHANNELS } from './shared/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 알림 서비스 초기화
const notificationService = new NotificationService();

let pendingSaves = 0;
let mainWindow: BrowserWindow | null = null;
let googleAuthResolve: ((value: any) => void) | null = null;

// 커스텀 프로토콜 등록 (Deep Linking)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('tickit', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('tickit');
}

/**
 * Deep Link URL 처리 및 토큰 추출
 */
function handleDeepLink(url: string) {
  if (!url.startsWith('tickit://')) return;

  try {
    const parsedUrl = new URL(url.replace('tickit://', 'http://localhost/'));
    const accessToken = parsedUrl.searchParams.get('access_token');
    const refreshToken = parsedUrl.searchParams.get('refresh_token');
    const userDataStr = parsedUrl.searchParams.get('user');

    if (accessToken && userDataStr && googleAuthResolve) {
      const user = JSON.parse(decodeURIComponent(userDataStr));
      googleAuthResolve({ 
        access_token: accessToken, 
        refresh_token: refreshToken || undefined, 
        user 
      });
      googleAuthResolve = null;

      if (mainWindow) {
        mainWindow.focus();
      }
    }
  } catch (e) {
    console.error('Failed to parse deep link data:', e);
  }
}

// macOS에서 앱이 열려있을 때 URL 호출 처리
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux에서 두 번째 인스턴스 실행 시 처리
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.pop();
    if (url) handleDeepLink(url);
  });
}

/**
 * IPC 핸들러: 리마인더 데이터 저장
 */
ipcMain.handle(IPC_CHANNELS.SAVE, async (_event, { key, data }) => {
  pendingSaves++;
  try {
    await mainStorage.write(key, data);
    return { success: true };
  } finally {
    pendingSaves--;
  }
});

/**
 * IPC 핸들러: 모든 리마인더 데이터 불러오기
 */
ipcMain.handle(IPC_CHANNELS.GET_ALL, async (_event, key) => {
  return await mainStorage.read(key);
});

/**
 * IPC 핸들러: 구글 로그인 (시스템 브라우저 사용 방식)
 */
ipcMain.handle(IPC_CHANNELS.AUTH_GOOGLE, async () => {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
  
  // 브라우저로 열기 (서버는 인증 후 tickit://auth?access_token=... 로 리다이렉트해야 함)
  shell.openExternal(`${apiUrl}/api/auth/google`);

  return new Promise((resolve) => {
    googleAuthResolve = resolve;
    // 30초 후 타임아웃 처리 (선택 사항)
    setTimeout(() => {
      if (googleAuthResolve === resolve) {
        googleAuthResolve = null;
        resolve(null);
      }
    }, 60000);
  });
});

/**
 * 브라우저 창 생성 및 초기화
 */
function createWindow() {
  const isMac = process.platform === 'darwin';
  const iconFileName = isMac ? 'logo.icns' : 'logo.ico';
  const iconPath = path.join(__dirname, '../src/assets', iconFileName);
  const image = nativeImage.createFromPath(iconPath);

  if (isMac && app.dock) {
    app.dock.setIcon(image);
  }

  mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    icon: image,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('close', (e) => {
    if (pendingSaves > 0) {
      e.preventDefault();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (pendingSaves === 0 || attempts > 20) {
          clearInterval(interval);
          mainWindow?.destroy();
        }
      }, 100);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  notificationService.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  notificationService.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
