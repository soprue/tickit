import { useToastStore } from '@src/shared/domain/ToastStore';

export function GlobalToast() {
  const { isOpen, message, type, hideToast } = useToastStore();

  if (!isOpen) return null;

  const typeStyles = {
    info: 'border-primary/20 text-primary',
    success: 'border-green-500/30 text-green-600 dark:text-green-400',
    error: 'border-red-500/30 text-red-600 dark:text-red-400',
  };

  const Icon = () => {
    switch (type) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✕</span>;
      default:
        return <div className="bg-primary h-2 w-2 rounded-full" />;
    }
  };

  return (
    <div
      onClick={hideToast}
      className={`fixed right-6 bottom-6 z-[2500] flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 dark:border-white/10 dark:bg-black/60 dark:shadow-2xl ${typeStyles[type]}`}
    >
      <div className="flex h-4 w-4 items-center justify-center text-[14px] font-black leading-none">
        <Icon />
      </div>
      <span className="text-[12px] font-bold tracking-tight select-none">
        {message}
      </span>
    </div>
  );
}

export default GlobalToast;
