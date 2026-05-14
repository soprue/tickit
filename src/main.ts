import { BrowserWindow, app, ipcMain, nativeImage } from 'electron';
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
 * IPC 핸들러: 구글 로그인
 */
ipcMain.handle(IPC_CHANNELS.AUTH_GOOGLE, async (event) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
  
  const authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    parent: parentWindow || undefined,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  authWindow.loadURL(`${apiUrl}/api/auth/google`);
  authWindow.once('ready-to-show', () => authWindow.show());

  return new Promise((resolve) => {
    // 공통 파싱 로직
    const extractAndResolve = (data: any) => {
      // 서버 응답 구조: { success: true, data: { access_token, user, ... } }
      // 또는 { access_token, user } 형태 모두 대응
      const token = data.access_token || data.data?.access_token;
      const user = data.user || data.data?.user;

      if (token && user) {
        resolve({ access_token: token, user });
        authWindow.destroy();
        return true;
      }
      return false;
    };

    const handleContentCheck = async () => {
      try {
        // 화면의 텍스트를 읽어 JSON으로 파싱 시도
        const content = await authWindow.webContents.executeJavaScript('document.body.innerText');
        const data = JSON.parse(content);
        extractAndResolve(data);
      } catch (e) {
        // JSON 형식이 아니면 아직 로그인 진행 중이거나 다른 페이지임
      }
    };

    const handleUrlCheck = (url: string) => {
      if (url.includes('access_token=')) {
        try {
          const parsedUrl = new URL(url);
          const params = new URLSearchParams(parsedUrl.search || parsedUrl.hash.substring(1));
          const accessToken = params.get('access_token');
          const userDataStr = params.get('user');
          
          if (accessToken && userDataStr) {
            const user = JSON.parse(decodeURIComponent(userDataStr));
            resolve({ access_token: accessToken, user });
            authWindow.destroy();
          }
        } catch (e) {
          console.error('Failed to parse URL auth data:', e);
        }
      }
    };

    // 1. URL 변경 감시 (리다이렉트 방식 대응)
    authWindow.webContents.on('will-navigate', (_e, url) => handleUrlCheck(url));
    authWindow.webContents.on('did-get-redirect-request', (_e, _oldUrl, newUrl) => handleUrlCheck(newUrl));

    // 2. 페이지 로딩 완료 감시 (JSON 텍스트 출력 방식 대응)
    authWindow.webContents.on('did-finish-load', () => {
      const url = authWindow.webContents.getURL();
      handleUrlCheck(url);
      handleContentCheck();
    });

    // 창이 닫히면 취소된 것으로 간주
    authWindow.on('closed', () => resolve(null));
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

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    icon: image,
    // titleBarStyle: isMac ? 'hiddenInset' : 'default', // macOS에서 깔끔한 상단바
    webPreferences: {
      // 빌드 후 경로 구조에 맞게 preload 경로 설정
      preload: path.join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // 개발 환경과 빌드 환경에 따른 로드 주소 분기
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 필요 시 개발자 도구를 엽니다.
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // 앱 종료 시 데이터 유실 방지 로직
  mainWindow.on('close', (e) => {
    if (pendingSaves > 0) {
      e.preventDefault();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (pendingSaves === 0 || attempts > 20) {
          clearInterval(interval);
          mainWindow.destroy();
        }
      }, 100);
    }
  });
}

// 앱 준비 완료 시 창 생성
app.whenReady().then(() => {
  createWindow();
  notificationService.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 앱 종료 시 알림 서비스 정지
app.on('will-quit', () => {
  notificationService.stop();
});

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
