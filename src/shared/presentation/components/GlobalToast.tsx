import { useEffect, useState } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 전역 상태(ActionContext)와 수동 알림(ToastStore)을 모두 처리하는 통합 토스트 컴포넌트
 */
export function GlobalToast() {
  // 1. 수동 알림 상태 (로그인 성공, 에러 등)
  const { isOpen: isManualOpen, message: manualMessage, type: manualType, hideToast } = useToastStore();
  
  // 2. 자동 작업 상태 (저장 중, 로딩 중 등)
  const { isPending } = useActionContext();
  
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [displayState, setDisplayState] = useState<{
    message: string;
    type: 'info' | 'success' | 'error';
    isAuto?: boolean;
  } | null>(null);

  // 자동 상태(isPending) 추적을 위한 로직
  useEffect(() => {
    if (isPending) {
      setDisplayState({ message: '저장 중...', type: 'info', isAuto: true });
    } else if (displayState?.isAuto && displayState.message === '저장 중...') {
      // 저장 중이었다가 끝난 경우 "저장 완료"로 변경
      setDisplayState({ message: '저장 완료', type: 'success', isAuto: true });
      const timer = setTimeout(() => {
        if (!isManualOpen) setDisplayState(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPending, isManualOpen]);

  // 수동 알림이 들어오면 자동 상태보다 우선함
  useEffect(() => {
    if (isManualOpen) {
      setDisplayState({ message: manualMessage, type: manualType, isAuto: false });
    } else if (!isPending) {
      // 수동 알림이 닫혔을 때 진행 중인 자동 작업이 없으면 토스트 닫기
      // 단, "저장 완료" 상태일 때는 위 useEffect의 타이머가 처리하도록 둠
      if (displayState && !displayState.isAuto) {
        setDisplayState(null);
      }
    }
  }, [isManualOpen, manualMessage, manualType, isPending]);

  // 최종 노출 여부 및 애니메이션 제어
  useEffect(() => {
    if (displayState) {
      setShow(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [displayState]);

  if (!show || !displayState) return null;

  const typeConfig = {
    success: {
      borderColor: 'border-green-500/30',
      textColor: 'text-green-600 dark:text-green-400',
      icon: <span className="text-green-500">✓</span>,
    },
    error: {
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600 dark:text-red-400',
      icon: <span className="text-red-500">✕</span>,
    },
    info: {
      borderColor: 'border-primary/20',
      textColor: 'text-primary',
      icon: displayState.message === '저장 중...' 
        ? <div className="bg-primary h-2.5 w-2.5 animate-pulse rounded-full" />
        : <div className="bg-primary h-2.5 w-2.5 rounded-full" />,
    },
  };

  const config = typeConfig[displayState.type];

  return (
    <div
      onClick={!displayState.isAuto ? hideToast : undefined}
      className={`fixed right-6 bottom-6 z-[2500] flex items-center gap-2 rounded-full border-[1.5px] bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-500 ${
        !displayState.isAuto ? 'cursor-pointer' : ''
      } ${
        animate ? 'opacity-100' : 'opacity-0'
      } ${displayState.type === 'success' && animate ? 'animate-pulse' : ''} dark:border-white/10 dark:bg-black/60 dark:shadow-2xl ${config.borderColor}`}
    >
      <div className="flex h-4 w-4 items-center justify-center text-[14px] font-black leading-none">
        {config.icon}
      </div>
      <span className={`text-[12px] font-bold tracking-tight select-none ${config.textColor}`}>
        {displayState.message}
      </span>
    </div>
  );
}

export default GlobalToast;
