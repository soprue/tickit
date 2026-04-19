import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import path from "path";
import fs from "fs";

// 앱의 루트 경로를 구합니다.
const APP_PATH = app.getAppPath();

const DATA_DIR = path.join(app.getPath("userData"), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pendingSaves = 0;

ipcMain.handle("reminder:save", async (event, { key, data }) => {
  pendingSaves++;
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error("Save failed:", err);
    throw err;
  } finally {
    pendingSaves--;
  }
});

ipcMain.handle("reminder:get-all", async (event, key) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(content);
    }
    return null;
  } catch (err) {
    console.error("Read failed:", err);
    return null;
  }
});

function createWindow() {
  const isMac = process.platform === "darwin";
  
  // 에셋 경로 설정
  const iconFileName = isMac ? "logo.icns" : "logo.ico";
  const iconPath = path.join(APP_PATH, "src", "assets", iconFileName);

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
    webPreferences: {
      preload: path.join(APP_PATH, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  const indexPath = path.join(APP_PATH, "dist", "index.html");

  // electron-is-dev 대신 app.isPackaged 사용
  if (!app.isPackaged) {
    const devUrl = "http://localhost:9000";
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(indexPath);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("close", (e) => {
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

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
