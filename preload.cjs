const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // 메인 프로세스에 데이터를 보내고 결과를 기다리는 (invoke) 래퍼
  invoke: (channel, data) => {
    // 허용된 채널 목록 (보안 검사)
    const validChannels = ['reminder:get-all', 'reminder:save'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
  },
  // 메인 프로세스에서 보낸 이벤트를 듣는 리스너 (예: 알림)
  on: (channel, callback) => {
    const validChannels = ['reminder:notify'];
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
