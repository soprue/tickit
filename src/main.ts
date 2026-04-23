import { BrowserWindow, app, ipcMain, nativeImage } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 데이터 저장 디렉토리 설정 (사용자 로컬 데이터 폴더)
const DATA_DIR = path.join(app.getPath("userData"), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pendingSaves = 0;

/**
 * IPC 핸들러: 리마인더 데이터 저장
 */
ipcMain.handle("reminder:save", async (_event, { key, data }) => {
  pendingSaves++;
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error("[Main] Save failed:", err);
    throw err;
  } finally {
    pendingSaves--;
  }
});

/**
 * IPC 핸들러: 모든 리마인더 데이터 불러오기
 */
ipcMain.handle("reminder:get-all", async (_event, key) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(content);
    }
    return null;
  } catch (err) {
    console.error("[Main] Read failed:", err);
    return null;
  }
});

/**
 * 브라우저 창 생성 및 초기화
 */
function createWindow() {
  const isMac = process.platform === "darwin";
  const iconFileName = isMac ? "logo.icns" : "logo.ico";
  const iconPath = path.join(__dirname, "../src/assets", iconFileName);
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
    titleBarStyle: isMac ? 'hiddenInset' : 'default', // macOS에서 깔끔한 상단바
    webPreferences: {
      // 빌드 후 경로 구조에 맞게 preload 경로 설정
      preload: path.join(__dirname, "../preload/preload.mjs"), 
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  // 개발 환경과 빌드 환경에 따른 로드 주소 분기
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 필요 시 개발자 도구를 엽니다.
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  // 앱 종료 시 데이터 유실 방지 로직
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

// 앱 준비 완료 시 창 생성
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
