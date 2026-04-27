import { useEffect, useState } from 'react';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 전역 저장 상태를 표시하는 선언적 토스트 컴포넌트
 */
export function SaveStatusToast() {
  const { isPending } = useActionContext();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'saving' | 'saved'>('saving');

  useEffect(() => {
    if (isPending) {
      setShow(true);
      setStatus('saving');
    } else if (show && !isPending) {
      // 저장 중이었다가 완료된 경우
      setStatus('saved');
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500); // 2.5초 후 사라짐
      return () => clearTimeout(timer);
    }
  }, [isPending, show]);

  if (!show) return null;

  return (
    <div
      className={`pointer-events-none fixed right-6 bottom-6 z-[2000] flex items-center gap-2 rounded-full border-[1.5px] bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-500 ${
        status === 'saving'
          ? 'border-primary/20 translate-y-0 opacity-100'
          : 'translate-y-0 border-green-500/30 opacity-100'
      } ${!isPending && status === 'saved' ? 'animate-pulse' : ''} dark:border-white/10 dark:bg-black/60 dark:shadow-2xl`}
    >
      <div className="flex h-4 w-4 items-center justify-center">
        {status === 'saving' ? (
          <div className="bg-primary h-2.5 w-2.5 animate-pulse rounded-full" />
        ) : (
          <span className="text-[14px] leading-none font-black text-green-500">✓</span>
        )}
      </div>
      <span
        className={`text-[12px] font-bold tracking-tight select-none ${status === 'saving' ? 'text-primary' : 'text-green-600 dark:text-green-400'} `}
      >
        {status === 'saving' ? '저장 중...' : '저장 완료'}
      </span>
    </div>
  );
}

export default SaveStatusToast;
