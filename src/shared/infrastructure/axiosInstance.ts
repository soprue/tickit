import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

// Axios 인스턴스 생성
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// 요청 인터셉터 (인증 토큰 주입)
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (401 에러 및 토큰 갱신 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh')) {
        useAuthStore.getState().actions.clearAuth();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data as { accessToken: string };

        useAuthStore.getState().actions.setAccessToken(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().actions.clearAuth();

        // 로그아웃 요청 중에 발생한 에러라면 모달을 띄우지 않음
        if (originalRequest.url?.includes('/api/auth/logout')) {
          return Promise.reject(refreshError);
        }

        useModalStore.getState().actions.showConfirm({
          title: '세션 만료',
          message: '세션이 만료되었습니다. 다시 로그인해 주세요.',
          onConfirm: () => {
            window.location.href = '#/login';
          },
        });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
