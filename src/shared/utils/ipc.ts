/**
 * Electron IPC 통신을 안전하게 처리하기 위한 서비스 유틸리티
 */
export const ipc = {
  /**
   * 메인 프로세스에 데이터를 보내고 결과를 기다립니다 (invoke)
   */
  async invoke<T = any>(channel: string, data?: any): Promise<T | null> {
    if (typeof window === 'undefined' || !window.api) {
      console.warn(`[IPC] window.api is not available. (Channel: ${channel})`);
      return null;
    }

    try {
      return await window.api.invoke(channel, data);
    } catch (error) {
      console.error(`[IPC] Invoke error on channel "${channel}":`, error);
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
  }
};
