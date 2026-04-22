import { StateStorage } from 'zustand/middleware';

/**
 * Electron IPC 기반 테마 전용 커스텀 스토리지
 */
export const themeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.api) return null;
    try {
      const data = await window.api.invoke('reminder:get-all', name);
      // Zustand persist는 { state, version } 구조를 기대하므로 불러온 데이터를 wrapping 해줍니다.
      return data ? JSON.stringify({ state: data }) : null;
    } catch (e) {
      console.error(`[ThemeStore] Load error:`, e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || !window.api) return;
    try {
      const data = JSON.parse(value);
      // Zustand persist는 전체 상태를 { state, version } 구조로 저장하므로, 
      // 기존 Tickit Main 프로세스의 구조에 맞추기 위해 state만 추출하거나 구조를 맞춰야 함.
      await window.api.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      console.error(`[ThemeStore] Save error:`, e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // 필요 시 구현
  },
};
