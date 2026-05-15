import axios, { AxiosRequestConfig } from 'axios';
import { axiosInstance } from './axiosInstance';

/**
 * Orval용 커스텀 Axios 인스턴스 (SRP: Orval 호환성 래퍼 담당)
 * Orval은 (url, config) 형태로 호출하므로 그에 맞춰 매개변수를 정의합니다.
 */
export function customInstance<T>(
  url: string,
  config: AxiosRequestConfig & { body?: unknown } // fetch 방식의 body 대응
): Promise<T> {
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
}

