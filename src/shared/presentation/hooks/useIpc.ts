import { useEffect } from 'react';
import { ipc } from '../../utils/ipc';

/**
 * 메인 프로세스의 IPC 이벤트를 구독하기 위한 커스텀 훅.
 * 컴포넌트 언마운트 시 자동으로 리스너를 정리할 준비를 합니다.
 * (현재 preload.cjs 구조상 명시적 off 기능이 없다면 메모리 누수에 주의해야 함)
 */
export function useIpc(channel: string, callback: (...args: any[]) => void) {
  useEffect(() => {
    ipc.on(channel, callback);

    // TODO: preload.cjs에 removeListener 로직 추가 시 여기에 cleanup 코드 작성
    return () => {
      // window.api.off(channel, callback);
    };
  }, [channel, callback]);
}

