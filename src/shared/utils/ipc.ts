import { IpcInvokeMap } from '../types/ipc-types';

/**
 * Electron IPC 통신을 안전하게 처리하기 위한 서비스 유틸리티
 */
export const ipc = {
  /**
   * 메인 프로세스에 데이터를 보내고 결과를 기다립니다 (invoke)
   * IpcInvokeMap에 정의된 채널과 타입만 허용합니다.
   */
  async invoke<K extends keyof IpcInvokeMap>(
    channel: K,
    data?: IpcInvokeMap[K]['args']
  ): Promise<IpcInvokeMap[K]['returns'] | null> {
    if (typeof window === 'undefined' || !window.api) {
      console.warn(`[IPC] window.api is not available. (Channel: ${channel})`);
      return null;
    }

    try {
      return await window.api.invoke(channel, data);
    } catch (error) {
      console.error(`[Infrastructure] [IPC] Invoke error on channel "${channel}":`, error);
      throw error;
    }
  },

  /**
   * 메인 프로세스에서 보낸 이벤트를 구독합니다 (on)
   * (주의: 컴포넌트 내에서는 useIpc 훅을 사용하는 것이 좋습니다.)
   */
  on(channel: string, callback: (...args: any[]) => void) {
    if (typeof window === 'undefined' || !window.api) return () => {};

    window.api.on(channel, callback);
  },
};
