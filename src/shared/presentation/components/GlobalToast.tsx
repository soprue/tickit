import { useEffect, useState } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 1. StatusToast: "저장 중...", "저장 완료" 등 시스템 상태를 나타냄
 * NotificationToast와 디자인 언어를 통일하여 일관된 경험 제공
 */
function StatusToast() {
  const { isPending } = useActionContext();
  const [displayState, setDisplayState] = useState<'saving' | 'saved' | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPending) {
      setDisplayState('saving');
      setShow(true);
    } else if (displayState === 'saving') {
      setDisplayState('saved');
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => setDisplayState(null), 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  if (!displayState) return null;

  const config = {
    saving: {
      color: 'bg-primary',
      glow: 'shadow-primary/20',
      label: '저장 중...',
    },
    saved: {
      color: 'bg-green-500',
      glow: 'shadow-green-500/20',
      label: '저장 완료',
    },
  }[displayState];

  return (
    <div
      className={`fixed right-8 bottom-8 z-[2500] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
      }`}
    >
      <div className="relative flex min-w-[140px] items-center justify-start gap-3 rounded-2xl border border-black/[0.03] bg-white/80 px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.04)] backdrop-blur-3xl dark:border-white/[0.05] dark:bg-black/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {/* Subtle Inner Glow Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none dark:border-white/5" />

        {/* Dynamic Indicator Dot */}
        <div className="relative flex h-2 w-2 items-center justify-center shrink-0">
          {displayState === 'saving' && (
            <div className={`absolute h-full w-full animate-ping rounded-full opacity-20 ${config.color}`} />
          )}
          <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] transition-all duration-500 ${config.color} ${config.glow}`} />
        </div>
        
        <span className="text-text-primary text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-300 leading-tight">
          {config.label}
        </span>
      </div>
    </div>
  );
}

/**
 * 2. NotificationToast: 로그인 성공, 에러 메시지 등 명시적인 알림
 * 우측 상단에 배치하여 화면 프레임과 연결된 느낌(Anchored)을 줌
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
      color: 'bg-green-500',
      glow: 'shadow-green-500/20',
      text: 'text-text-primary',
    },
    error: {
      color: 'bg-red-500',
      glow: 'shadow-red-500/20',
      text: 'text-text-primary',
    },
    info: {
      color: 'bg-primary',
      glow: 'shadow-primary/20',
      text: 'text-text-primary',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`fixed top-8 right-8 z-[3000] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
      }`}
    >
      <div
        onClick={hideToast}
        className="group relative flex min-w-[200px] max-w-[360px] cursor-pointer items-center justify-start gap-3.5 rounded-2xl border border-black/[0.03] bg-white/80 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.04)] backdrop-blur-3xl transition-all hover:bg-white/90 active:scale-[0.97] dark:border-white/[0.05] dark:bg-black/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        {/* Subtle Inner Glow Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none dark:border-white/5" />

        {/* Dynamic Indicator Dot */}
        <div className="relative flex h-2 w-2 items-center justify-center shrink-0">
          <div className={`absolute h-full w-full animate-ping rounded-full opacity-20 ${config.color}`} />
          <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${config.color} ${config.glow}`} />
        </div>
        
        <span className={`text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-300 leading-tight ${config.text}`}>
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
