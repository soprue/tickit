import { StateStorage } from 'zustand/middleware';

/**
 * Electron IPC 기반 인증 전용 커스텀 스토리지
 */
export const authStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined' || !(window as any).api) return null;
    try {
      const data = await (window as any).api.invoke('reminder:get-all', name);
      return data ? JSON.stringify({ state: data }) : null;
    } catch (e) {
      console.error(`[AuthStore] Load error:`, e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || !(window as any).api) return;
    try {
      const data = JSON.parse(value);
      await (window as any).api.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      console.error(`[AuthStore] Save error:`, e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // 필요 시 구현
  },
};
