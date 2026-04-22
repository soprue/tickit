import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';
import { authStorage } from '../infrastructure/authStorage';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

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
      storage: createJSONStorage(() => authStorage),
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
