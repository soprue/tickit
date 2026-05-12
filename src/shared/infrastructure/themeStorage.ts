import { StateStorage } from 'zustand/middleware';
import { ipc } from '@src/shared/utils/ipc';
import { IPC_CHANNELS } from '@src/shared/constants';

/**
 * Electron IPC 기반 테마 설정 저장소
 */
export const themeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await ipc.invoke(IPC_CHANNELS.GET_ALL, name);
      if (data) return JSON.stringify({ state: data });
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      await ipc.invoke(IPC_CHANNELS.SAVE, {
        key: name,
        data: data.state,
      });
    } catch (e) {
      console.error(`[ThemeStore] Save error:`, e);
    }
  },
  removeItem: (name: string) => {},
};
