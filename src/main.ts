import { app, type BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificationService } from './services/NotificationService';
import { AuthDeepLinkService } from './main/AuthDeepLinkService';
import { createMainWindow } from './main/createMainWindow';
import { registerIpcHandlers } from './main/registerIpcHandlers';

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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
