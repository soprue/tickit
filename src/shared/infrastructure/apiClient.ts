import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  
  // Zustand 스토어에서 토큰 가져오기
  const { accessToken } = useAuthStore.getState();

  const promise = axios({
    ...config,
    baseURL: import.meta.env.VITE_API_URL,
    cancelToken: source.token,
    headers: {
      ...config.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
