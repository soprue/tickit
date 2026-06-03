import { BrowserWindow } from 'electron';
import path from 'node:path';

export function createMainWindow(mainDir: string) {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    icon: path.join(mainDir, '../src/assets/logo.webp'),
    webPreferences: {
      preload: path.join(mainDir, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(mainDir, '../../dist/index.html'));
  }

  return mainWindow;
}
