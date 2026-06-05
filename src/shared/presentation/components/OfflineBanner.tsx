import { useNetworkStatusStore } from '@src/shared/domain/NetworkStatusStore';

const STATUS_MESSAGE = {
  offline: '인터넷 연결이 끊어졌습니다. 온라인 상태에서만 변경할 수 있습니다.',
  'server-unreachable': '서버에 연결할 수 없습니다. 연결이 복구된 뒤 변경할 수 있습니다.',
} as const;

export function OfflineBanner() {
  const status = useNetworkStatusStore((state) => state.status);

  if (status === 'online') {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-[2400]">
      <div className="flex min-h-11 items-center justify-start gap-2 border-t border-red-500/25 bg-red-50/95 px-8 py-4 text-left shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-red-400/25 dark:bg-red-950/90">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[13px] font-black leading-none text-white">
          !
        </span>
        <p className="m-0 flex-1 text-left text-[13px] font-bold leading-5 text-red-700 dark:text-red-100">
          {STATUS_MESSAGE[status]}
        </p>
      </div>
    </div>
  );
}
