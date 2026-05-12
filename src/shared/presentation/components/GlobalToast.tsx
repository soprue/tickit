import { useEffect, useState } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 1. StatusToast: "저장 중...", "저장 완료" 등 시스템 상태를 나타냄 (우측 하단, 미니멀)
 */
function StatusToast() {
  const { isPending } = useActionContext();
  const [displayState, setDisplayState] = useState<'saving' | 'saved' | null>(null);
  const [show, setShow] = useState(false);

  // isPending 상태 변화에 따른 displayState 제어
  useEffect(() => {
    if (isPending) {
      setDisplayState('saving');
      setShow(true);
    } else {
      // 저장 중이었다가 끝난 경우에만 '저장 완료' 표시
      if (displayState === 'saving') {
        setDisplayState('saved');
        // 2초 후에 사라지도록 설정
        const timer = setTimeout(() => {
          setShow(false);
          // 애니메이션이 끝난 후(500ms) 상태 초기화
          setTimeout(() => setDisplayState(null), 500);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isPending]);

  if (!displayState) return null;

  return (
    <div
      className={`fixed right-6 bottom-6 z-[2500] flex items-center gap-2.5 rounded-full border-[1.5px] bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-500 ease-out dark:bg-black/60 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${
        displayState === 'saving'
          ? 'border-primary/20 text-primary'
          : 'border-green-500/30 text-green-600 dark:text-green-400'
      }`}
    >
      <div className="flex h-3 w-3 items-center justify-center">
        {displayState === 'saving' ? (
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
        ) : (
          <span className="text-[14px] font-black leading-none">✓</span>
        )}
      </div>
      <span className="text-[12px] font-bold tracking-tight select-none">
        {displayState === 'saving' ? '저장 중...' : '저장 완료'}
      </span>
    </div>
  );
}

/**
 * 2. NotificationToast: 로그인 성공, 에러 메시지 등 명시적인 알림
 * 더 세련된 Glassmorphism 스타일과 부드러운 애니메이션 적용
 */
function NotificationToast() {
  const { isOpen, message, type, hideToast } = useToastStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  const typeConfig = {
    success: {
      bg: 'bg-white/80 dark:bg-[#1a1a1a]/80',
      border: 'border-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      indicator: 'bg-green-500',
    },
    error: {
      bg: 'bg-white/80 dark:bg-[#1a1a1a]/80',
      border: 'border-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      indicator: 'bg-red-500',
    },
    info: {
      bg: 'bg-white/80 dark:bg-[#1a1a1a]/80',
      border: 'border-primary/20',
      text: 'text-text-primary',
      indicator: 'bg-primary',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`fixed top-6 left-1/2 z-[3000] -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
      }`}
    >
      <div
        onClick={hideToast}
        className={`flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-[1px] px-5 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl ${config.bg} ${config.border}`}
      >
        {/* 상태 인디케이터 라인 */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.indicator}`} />
        
        <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-opacity-10 ${config.indicator.replace('bg-', 'bg-opacity-10 text-')}`}>
           {type === 'success' && <span className="text-[12px] font-bold">✓</span>}
           {type === 'error' && <span className="text-[12px] font-bold">!</span>}
           {type === 'info' && <div className={`h-1.5 w-1.5 rounded-full ${config.indicator}`} />}
        </div>
        
        <span className={`text-[13px] font-semibold tracking-tight ${config.text}`}>
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
