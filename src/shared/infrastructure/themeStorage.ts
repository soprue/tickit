import { StateStorage } from 'zustand/middleware';
import { ipc } from '@src/shared/utils/ipc';
import { IPC_CHANNELS, STORAGE_KEYS } from '@src/shared/constants';
import type { StorageValueMap } from '@src/shared/types/ipc-types';

/**
 * Electron IPC 기반 테마 설정 저장소
 */
export const themeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (name !== STORAGE_KEYS.THEME) return null;

    try {
      const data = await ipc.invoke(IPC_CHANNELS.GET_ALL, STORAGE_KEYS.THEME);
      if (data) return JSON.stringify({ state: data });
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (name !== STORAGE_KEYS.THEME) return;

    try {
      const data = JSON.parse(value) as { state: StorageValueMap[typeof STORAGE_KEYS.THEME] };
      await ipc.invoke(IPC_CHANNELS.SAVE, {
        key: STORAGE_KEYS.THEME,
        data: data.state,
      });
    } catch (e) {
      console.error(`[Infrastructure] [ThemeStorage] Save error:`, e);
    }
  },
  removeItem: (name: string) => {},
};
