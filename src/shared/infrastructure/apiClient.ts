import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 리프레시 토큰(쿠키)을 위해 설정
});

// 요청 인터셉터: 헤더에 토큰 주입
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

// 응답 인터셉터: 401 에러 시 토큰 갱신 로직
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 재시도한 적이 없는 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그인/갱신 API에서 401이 난 거면 바로 실패 처리 (무한 루프 방지)
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh')) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // 토큰 갱신 API 호출
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data as { accessToken: string };

        // 새 토큰 저장
        useAuthStore.getState().setAccessToken(accessToken);

        // 새 토큰으로 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우: 로그아웃 처리
        useAuthStore.getState().clearAuth();
        
        // 세션 만료 모달 표시
        useModalStore.getState().showConfirm({
          title: '세션 만료',
          message: '세션이 만료되었습니다. 다시 로그인해 주세요.',
          onConfirm: () => {
            window.location.href = '#/login'; // HashRouter 사용 중이므로 # 추가
          },
        });
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = axiosInstance({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
