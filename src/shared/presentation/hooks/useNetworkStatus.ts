import { useCallback, useEffect, useRef } from 'react';
import { useNetworkStatusStore } from '@src/shared/domain/NetworkStatusStore';
import { checkServerHealth } from '@src/shared/infrastructure/serverHealth';

const SERVER_UNREACHABLE_RETRY_MS = 10000;

const logNetworkStatus = (message: string, data?: Record<string, unknown>) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info('[NetworkStatus]', message, data ?? '');
};

export function useNetworkStatus() {
  const status = useNetworkStatusStore((state) => state.status);
  const isCheckingServer = useNetworkStatusStore((state) => state.isCheckingServer);
  const setStatus = useNetworkStatusStore((state) => state.actions.setStatus);
  const setCheckingServer = useNetworkStatusStore((state) => state.actions.setCheckingServer);
  const healthCheckId = useRef(0);

  const verifyServerHealth = useCallback(async () => {
    const checkId = healthCheckId.current + 1;
    healthCheckId.current = checkId;

    logNetworkStatus('Checking server health');
    setCheckingServer(true);

    const isServerReachable = await checkServerHealth();

    if (healthCheckId.current !== checkId) {
      logNetworkStatus('Ignored stale server health result', { checkId });
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      logNetworkStatus('Browser reported offline during health check');
      setStatus('offline');
    } else {
      logNetworkStatus('Server health check finished', {
        isServerReachable,
        nextStatus: isServerReachable ? 'online' : 'server-unreachable',
      });
      setStatus(isServerReachable ? 'online' : 'server-unreachable');
    }

    setCheckingServer(false);
  }, [setCheckingServer, setStatus]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        healthCheckId.current += 1;
        logNetworkStatus('Browser reported offline');
        setCheckingServer(false);
        setStatus('offline');
        return;
      }

      logNetworkStatus('Browser reported online');
      void verifyServerHealth();
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      healthCheckId.current += 1;
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [setCheckingServer, setStatus, verifyServerHealth]);

  useEffect(() => {
    if (
      status !== 'server-unreachable' ||
      typeof navigator === 'undefined' ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const retryId = window.setInterval(() => {
      if (navigator.onLine) {
        logNetworkStatus('Retrying server health check');
        void verifyServerHealth();
      }
    }, SERVER_UNREACHABLE_RETRY_MS);

    return () => window.clearInterval(retryId);
  }, [status, verifyServerHealth]);

  return {
    status,
    isOnline: status === 'online',
    isCheckingServer,
  };
}
