//#region preload.cjs
var { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
	invoke: (channel, data) => {
		if (["reminder:get-all", "reminder:save"].includes(channel)) return ipcRenderer.invoke(channel, data);
		return Promise.reject(/* @__PURE__ */ new Error(`Invalid IPC channel: ${channel}`));
	},
	on: (channel, callback) => {
		if (["reminder:notify"].includes(channel)) ipcRenderer.on(channel, (event, ...args) => callback(...args));
	}
});
contextBridge.exposeInMainWorld("versions", {
	node: process.versions.node,
	chrome: process.versions.chrome,
	electron: process.versions.electron
});
//#endregion
