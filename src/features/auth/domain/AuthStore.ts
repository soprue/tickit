import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';
import { authStorage } from '../infrastructure/authStorage';
import { UserEntity } from '../infrastructure/api/model';

interface AuthState {
  isLoggedIn: boolean;
  user: UserEntity | null;
  accessToken: string | null;
  setAuth: (user: UserEntity, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      setAuth: (user: UserEntity, accessToken: string) =>
        set({ isLoggedIn: true, user, accessToken }),
      setAccessToken: (accessToken: string) => set({ accessToken }),
      clearAuth: () => set({ isLoggedIn: false, user: null, accessToken: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

// 하위 호환성을 위해 authStore 객체 유지
export const authStore = {
  getState: () => useAuthStore.getState(),
  subscribe: (listener: (state: AuthState) => void) => useAuthStore.subscribe(listener),
  setAuth: (user: UserEntity, accessToken: string) => useAuthStore.getState().setAuth(user, accessToken),
  setAccessToken: (accessToken: string) => useAuthStore.getState().setAccessToken(accessToken),
  logout: () => useAuthStore.getState().clearAuth(),
};
