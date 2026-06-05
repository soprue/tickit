import { useEffect } from 'react';
import { useNetworkStatusStore } from '@src/shared/domain/NetworkStatusStore';

export function useNetworkStatus() {
  const isOnline = useNetworkStatusStore((state) => state.isOnline);
  const setOnlineStatus = useNetworkStatusStore((state) => state.actions.setOnlineStatus);

  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const updateOnlineStatus = () => {
      setOnlineStatus(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [setOnlineStatus]);

  return { isOnline };
}
