import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Electron IPC 기반 커스텀 스토리지
const electronStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined' || !(window as any).api) return null;
    try {
      const data = await (window as any).api.invoke('reminder:get-all', name);
      // Zustand persist는 { state, version } 구조를 기대하므로 불러온 데이터를 wrapping 해줍니다.
      return data ? JSON.stringify({ state: data }) : null;
    } catch (e) {
      console.error(`[ThemeStore] Load error:`, e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || !(window as any).api) return;
    try {
      const data = JSON.parse(value);
      // Zustand persist는 전체 상태를 { state, version } 구조로 저장하므로, 
      // 기존 Tickit Main 프로세스의 구조에 맞추기 위해 state만 추출하거나 구조를 맞춰야 함.
      // 여기서는 기존 Store.ts가 하던 방식대로 저장하도록 함.
      await (window as any).api.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      console.error(`[ThemeStore] Save error:`, e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // 구현 생략 (필요 시 추가)
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => electronStorage),
      // persist 시 state만 저장하고 actions는 제외
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);

// 하위 호환성을 위해 themeStore 객체 유지 (필요 시 점진적 교체)
export const themeStore = {
  getState: () => useThemeStore.getState(),
  subscribe: (listener: (state: ThemeState) => void) => useThemeStore.subscribe(listener),
  toggleDarkMode: () => useThemeStore.getState().toggleDarkMode(),
};
