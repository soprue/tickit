import { BrowserWindow, app, ipcMain, nativeImage } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
//#region src/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
app.getAppPath();
var DATA_DIR = path.join(app.getPath("userData"), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
var pendingSaves = 0;
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
	const iconFileName = isMac ? "logo.icns" : "logo.ico";
	const iconPath = path.join(__dirname, "../../src/assets", iconFileName);
	const image = nativeImage.createFromPath(iconPath);
	if (isMac && app.dock) app.dock.setIcon(image);
	const mainWindow = new BrowserWindow({
		width: 400,
		height: 750,
		minWidth: 400,
		maxWidth: 600,
		minHeight: 650,
		useContentSize: true,
		icon: image,
		webPreferences: {
			preload: path.join(__dirname, "../preload/preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			spellcheck: false
		}
	});
	path.join(__dirname, "../dist/index.html");
	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
		mainWindow.webContents.openDevTools();
	} else mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
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
//#endregion
