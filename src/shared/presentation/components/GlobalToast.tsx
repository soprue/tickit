import { useEffect, useState } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useSyncStatus } from '@src/shared/context/SyncStatusContext';
import { DELAYS } from '@src/shared/constants';

/**
 * 1. StatusToast: 서버 동기화 상태를 나타냄
 */
function StatusToast() {
  const { isRunning } = useSyncStatus();
  const [displayState, setDisplayState] = useState<'syncing' | 'synced' | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setDisplayState('syncing');
      setShow(true);
    } else if (displayState === 'syncing') {
      setDisplayState('synced');
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => setDisplayState(null), DELAYS.ANIMATION_SMOOTH);
      }, DELAYS.STATUS_DISPLAY);
      return () => clearTimeout(timer);
    }
  }, [isRunning, displayState]);

  if (!displayState) return null;

  const config = {
    syncing: {
      borderColor: 'border-border-alpha',
      textColor: 'text-primary',
      label: '동기화 중...',
    },
    synced: {
      borderColor: 'border-green-500/30',
      textColor: 'text-green-600 dark:text-green-400',
      label: '동기화 완료',
    },
  }[displayState];

  return (
    <div
      className={`fixed right-6 bottom-6 z-[2500] transition-all duration-500 ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div
        className={`flex items-center gap-2.5 rounded-full border-[1.5px] bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-black/60 ${config.borderColor}`}
      >
        <div className="flex h-3 w-3 items-center justify-center">
          {displayState === 'syncing' ? (
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          ) : (
            <span className="text-[14px] font-black leading-none text-green-500">✓</span>
          )}
        </div>
        <span className={`text-[12px] font-bold tracking-tight select-none ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

/**
 * 2. NotificationToast: 로그인 성공, 에러 메시지 등 명시적인 알림
 * StatusToast의 가볍고 심플한 느낌을 그대로 가져와 일관성 유지
 */
function NotificationToast() {
  const isOpen = useToastStore((state) => state.isOpen);
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);
  const { hideToast } = useToastStore((state) => state.actions);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), DELAYS.ANIMATION_SMOOTH);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  const typeConfig = {
    success: {
      borderColor: 'border-green-500/30',
      textColor: 'text-green-600 dark:text-green-400',
      icon: <span className="text-green-500">✓</span>,
    },
    error: {
      borderColor: 'border-red-500/20',
      textColor: 'text-red-500',
      icon: <span className="text-red-500 font-black">!</span>,
    },
    info: {
      borderColor: 'border-border-alpha',
      textColor: 'text-text-primary',
      icon: <div className="bg-primary h-2 w-2 rounded-full" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`fixed top-8 right-8 z-[3000] transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
      }`}
    >
      <div
        onClick={hideToast}
        className={`flex cursor-pointer items-center gap-3 rounded-full border-[1.5px] bg-white/90 px-5 py-2.5 shadow-xl backdrop-blur-md dark:bg-black/60 ${config.borderColor}`}
      >
        <div className="flex h-4 w-4 items-center justify-center text-[14px]">
          {config.icon}
        </div>
        <div className="h-3 w-[1px] bg-black/10 dark:bg-white/10" />
        <span className={`text-[13px] font-bold tracking-tight select-none ${config.textColor}`}>
          {message}
        </span>
      </div>
    </div>
  );
}

/**
 * 최종 통합 토스트 컴포넌트
 */
export function GlobalToast() {
  return (
    <>
      <StatusToast />
      <NotificationToast />
    </>
  );
}

export default GlobalToast;
