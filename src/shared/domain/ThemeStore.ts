import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';
import { themeStorage } from '../infrastructure/themeStorage';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          return { isDarkMode: next };
        }),

    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => themeStorage),
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
