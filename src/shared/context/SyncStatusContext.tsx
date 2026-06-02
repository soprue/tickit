import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SyncStatusContextType {
  isRunning: boolean;
  runSyncAction: (fn: () => Promise<void>) => void;
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined);

/**
 * 앱 내 명시적 비동기 액션의 실행 상태를 추적합니다.
 */
export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const [runningCount, setRunningCount] = useState(0);

  const runSyncAction = (fn: () => Promise<void>) => {
    setRunningCount((count) => count + 1);

    void fn()
      .catch((error) => {
        console.error('[SyncStatusContext] Action failed:', error);
      })
      .finally(() => {
        setRunningCount((count) => Math.max(0, count - 1));
      });
  };

  return (
    <SyncStatusContext.Provider value={{ isRunning: runningCount > 0, runSyncAction }}>
      {children}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatus() {
  const context = useContext(SyncStatusContext);
  if (!context) {
    throw new Error('useSyncStatus must be used within SyncStatusProvider');
  }
  return context;
}
