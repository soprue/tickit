import { app, type BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificationService } from './services/NotificationService';
import { AuthDeepLinkService } from './main/AuthDeepLinkService';
import { createMainWindow } from './main/createMainWindow';
import { registerIpcHandlers } from './main/registerIpcHandlers';

const WINDOWS_APP_USER_MODEL_ID = 'com.tickit.app';
const DEV_USER_DATA_DIR = path.join(app.getPath('temp'), 'tickit-electron-user-data');
const TEST_NOTIFICATION_DELAY_MS = 2000;

if (!app.isPackaged) {
  fs.mkdirSync(DEV_USER_DATA_DIR, { recursive: true });
  app.setPath('userData', DEV_USER_DATA_DIR);
}

if (process.platform === 'win32') {
  app.setAppUserModelId(app.isPackaged ? WINDOWS_APP_USER_MODEL_ID : process.execPath);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notificationService = new NotificationService();
let mainWindow: BrowserWindow | null = null;

const PROTOCOL = 'tickit';
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const authDeepLinkService = new AuthDeepLinkService({
  protocol: PROTOCOL,
  apiUrl: API_URL,
  getMainWindow: () => mainWindow,
});

authDeepLinkService.registerProtocol();
authDeepLinkService.registerAppListeners();

// Windows/Linux/macOS 중복 실행 방지 및 URL 가로채기
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    authDeepLinkService.handleSecondInstance(commandLine);
  });
}

registerIpcHandlers({
  notificationService,
  authDeepLinkService,
});

app.whenReady().then(() => {
  mainWindow = createMainWindow(__dirname);
  notificationService.start();

  if (process.env.TICKIT_TEST_NOTIFICATION === '1') {
    setTimeout(() => {
      notificationService.sendTestNotification();
    }, TEST_NOTIFICATION_DELAY_MS);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
