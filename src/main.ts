import { BrowserWindow, app, ipcMain, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificationService } from './services/NotificationService';
import { mainStorage } from './infrastructure/MainStorage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 알림 서비스 초기화
const notificationService = new NotificationService();

let pendingSaves = 0;

/**
 * IPC 핸들러: 리마인더 데이터 저장
 */
ipcMain.handle('reminder:save', async (_event, { key, data }) => {
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
ipcMain.handle('reminder:get-all', async (_event, key) => {
  return await mainStorage.read(key);
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
