import { StateStorage } from 'zustand/middleware';
import { ipc } from '@src/shared/utils/ipc';

/**
 * Electron IPC 기반 인증 정보 저장소
 */
export const authStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await ipc.invoke<any>('reminder:get-all', name);
      if (data) return JSON.stringify({ state: data });
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      await ipc.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      console.error(`[AuthStore] Save error:`, e);
    }
  },
  removeItem: (name: string) => {},
};
