import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

// Electron IPC 기반 커스텀 스토리지 (재사용 가능하도록 별도 유틸리티로 빼면 좋지만, 일단 여기 작성)
const electronStorage: StateStorage = {
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
    // 구현 생략
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (name: string, email: string) => set({ isLoggedIn: true, user: { name, email } }),
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => electronStorage),
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);

// 하위 호환성을 위해 authStore 객체 유지
export const authStore = {
  getState: () => useAuthStore.getState(),
  subscribe: (listener: (state: AuthState) => void) => useAuthStore.subscribe(listener),
  login: (name: string, email: string) => useAuthStore.getState().login(name, email),
  logout: () => useAuthStore.getState().logout(),
};
