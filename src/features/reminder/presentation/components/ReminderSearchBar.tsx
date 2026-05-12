import { Icon } from '@src/shared/presentation/components/Icon';

interface ReminderSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filterMode: 'all' | 'active' | 'completed';
  onToggleFilter: () => void;
}

/**
 * 리마인더 검색 및 필터링을 담당하는 상단 바 컴포넌트
 */
export function ReminderSearchBar({
  value,
  onChange,
  filterMode,
  onToggleFilter,
}: ReminderSearchBarProps) {
  return (
    <div className="px-md mb-sm">
      <div className="relative flex w-full items-center">
        <input
          type="text"
          className="bg-black/[0.03] border-black/[0.06] text-text-primary placeholder:text-gray-medium/40 w-full rounded-xl border py-[10px] pr-[120px] pl-4 text-[14px] outline-none transition-all focus:bg-black/[0.05] focus:border-primary/20 dark:border-white/10 dark:bg-white/[0.03] dark:focus:bg-white/[0.06]"
          placeholder="검색어를 입력하세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="absolute right-2 flex items-center gap-2">
          <div className="bg-gray-light/30 h-3.5 w-[1px]" />
          <button
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all active:scale-95 ${
              filterMode !== 'all'
                ? filterMode === 'completed'
                  ? 'bg-blue-500/10 text-blue-500 font-bold'
                  : 'bg-primary/10 text-primary font-bold'
                : 'text-gray-medium/60 hover:text-gray-medium font-medium'
            }`}
            onClick={onToggleFilter}
          >
            <div
              className={`h-1 w-1 rounded-full transition-all ${
                filterMode === 'all'
                  ? 'bg-gray-light/50'
                  : filterMode === 'completed'
                    ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]'
                    : 'bg-primary animate-pulse'
              }`}
            />
            <span className="text-[10px] tracking-tight uppercase">
              {filterMode === 'all'
                ? 'Show All'
                : filterMode === 'completed'
                  ? 'Done Only'
                  : 'Hide Done'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
