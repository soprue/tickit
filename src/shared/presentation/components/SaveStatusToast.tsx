import React, { useEffect, useState } from 'react';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 전역 저장 상태를 표시하는 선언적 토스트 컴포넌트 (Tailwind CSS)
 */
export const SaveStatusToast: React.FC = () => {
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
      className={`
        fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 
        bg-white/90 backdrop-blur-md rounded-full border-[1.5px] 
        shadow-lg z-[2000] pointer-events-none transition-all duration-500
        ${status === 'saving' 
          ? 'border-primary/20 translate-y-0 opacity-100' 
          : 'border-green-500/30 translate-y-0 opacity-100'}
        ${!isPending && status === 'saved' ? 'animate-pulse' : ''}
        dark:bg-black/60 dark:border-white/10 dark:shadow-2xl
      `}
    >
      <div className="flex items-center justify-center w-4 h-4">
        {status === 'saving' ? (
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
        ) : (
          <span className="text-green-500 text-[14px] font-black leading-none">✓</span>
        )}
      </div>
      <span 
        className={`
          text-[12px] font-bold tracking-tight select-none
          ${status === 'saving' ? 'text-primary' : 'text-green-600 dark:text-green-400'}
        `}
      >
        {status === 'saving' ? '저장 중...' : '저장 완료'}
      </span>
    </div>
  );
};

export default SaveStatusToast;
