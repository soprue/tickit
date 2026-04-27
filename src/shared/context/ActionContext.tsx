import React, { createContext, useContext, useTransition, ReactNode } from 'react';

interface ActionContextType {
  isPending: boolean;
  runAction: (fn: () => Promise<void>) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

/**
 * React 19의 useTransition을 전역으로 공유하기 위한 Provider.
 * 앱 내의 모든 비동기 액션 상태를 하나의 isPending으로 추적할 수 있게 합니다.
 */
export const ActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPending, startTransition] = useTransition();

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await fn();
      } catch (error) {
        console.error('[ActionContext] Action failed:', error);
      }
    });
  };

  return (
    <ActionContext.Provider value={{ isPending, runAction }}>{children}</ActionContext.Provider>
  );
};

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActionContext must be used within an ActionProvider');
  }
  return context;
};
