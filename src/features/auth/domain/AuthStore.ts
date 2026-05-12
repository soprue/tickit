import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@src/shared/constants';
import { UserEntity } from '../infrastructure/api/model';

interface AuthState {
  isLoggedIn: boolean;
  user: UserEntity | null;
  accessToken: string | null;
  setAuth: (user: UserEntity, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

/**
 * 인증 상태 관리 스토어
 * sessionStorage를 사용하여 새로고침 시에는 유지되지만, 앱 종료 시에는 자동으로 로그아웃되도록 설정
 */
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
      storage: createJSONStorage(() => sessionStorage),
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
