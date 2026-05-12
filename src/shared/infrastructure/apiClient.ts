import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// 요청 인터셉터
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

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh')) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data as { accessToken: string };

        useAuthStore.getState().setAccessToken(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        useModalStore.getState().showConfirm({
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

/**
 * Orval용 커스텀 Axios 인스턴스
 * Orval은 (url, config) 형태로 호출하므로 그에 맞춰 매개변수를 정의합니다.
 */
export const customInstance = <T>(
  url: string,
  config: AxiosRequestConfig & { body?: any } // fetch 방식의 body 대응
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = axiosInstance({
    url,
    ...config,
    data: config.data || config.body, // body가 있으면 data로 매핑
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
