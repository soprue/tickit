const { contextBridge, ipcRenderer } = require('electron');

// Note: 이 파일은 vite-plugin-electron에 의해 빌드되므로, 
// 필요한 경우 다른 모듈을 import/require 할 수 있습니다.
// 하지만 보안을 위해 IPC 채널 목록은 명시적으로 관리합니다.
const IPC_CHANNELS = {
  GET_ALL: 'reminder:get-all',
  SAVE: 'reminder:save',
  NOTIFY: 'reminder:notify',
  AUTH_GOOGLE: 'auth:google',
};

contextBridge.exposeInMainWorld('api', {
  // 메인 프로세스에 데이터를 보내고 결과를 기다리는 (invoke) 래퍼
  invoke: (channel, data) => {
    // 허용된 채널 목록 (보안 검사)
    const validChannels = [IPC_CHANNELS.GET_ALL, IPC_CHANNELS.SAVE, IPC_CHANNELS.AUTH_GOOGLE];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
  },
  // 메인 프로세스에서 보낸 이벤트를 듣는 리스너 (예: 알림)
  on: (channel, callback) => {
    const validChannels = [IPC_CHANNELS.NOTIFY];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});

contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
});
