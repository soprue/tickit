import axios, { AxiosRequestConfig } from 'axios';
import { axiosInstance } from './axiosInstance';

type CustomRequestConfig = RequestInit & {
  data?: unknown;
  body?: unknown;
  params?: unknown;
};

type CancelablePromise<T> = Promise<T> & {
  cancel: () => void;
};

/**
 * Orval용 커스텀 Axios 인스턴스 (SRP: Orval 호환성 래퍼 담당)
 * Orval은 (url, config) 형태로 호출하므로 그에 맞춰 매개변수를 정의합니다.
 */
export function customInstance<T>(
  url: string,
  config?: CustomRequestConfig
): CancelablePromise<T> {
  const source = axios.CancelToken.source();
  const { body, data, ...requestConfig } = config ?? {};

  const promise = axiosInstance({
    url,
    ...(requestConfig as AxiosRequestConfig),
    data: data ?? body,
    cancelToken: source.token,
  }).then(({ data }) => data) as CancelablePromise<T>;

  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
}
