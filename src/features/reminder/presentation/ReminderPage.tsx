import { useRef } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { SaveStatusToast } from '@src/shared/presentation/components/SaveStatusToast';
import { useReminderUI } from './hooks/useReminderUI';
import { useAuthActions } from '@src/features/auth/presentation/hooks/useAuthActions';
import { Input } from '@src/shared/presentation/components/ui/Input';

function ReminderPage() {
  // 1. 통합 훅
  const ui = useReminderUI();
  const { logout } = useAuthActions();

  // 2. 글로벌 설정
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-bg duration-normal flex h-full w-full transition-colors">
      <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onLogout={logout} />

      <div className="p-lg px-md gap-md box-border flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth">
        <div className="px-md mb-sm">
          <div className="group flex w-full items-center gap-2">
            <Input
              type="text"
              className="flex-1 border border-black/5 bg-white !px-4 !py-[10px] focus:shadow-sm dark:border-white/5 dark:bg-black"
              placeholder="검색어를 입력하세요..."
              value={ui.searchQuery}
              onChange={(e) => ui.setSearchQuery(e.target.value)}
            />
            <button
              className={`flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all ${
                ui.hideCompleted
                  ? 'bg-primary border-primary shadow-primary/30 text-white shadow-md hover:brightness-105 active:scale-95'
                  : 'text-text-primary hover:bg-gray-soft active:bg-gray-light/30 border-black/5 bg-white dark:border-white/5 dark:bg-black dark:text-white'
              } `}
              onClick={ui.toggleHideCompleted}
              title="완료된 항목 숨기기"
            >
              <span className="text-[16px] font-extrabold">✓</span>
            </button>
          </div>
        </div>

        <div className="gap-md flex flex-col">
          {ui.searchQuery.trim() && !ui.hasAnyMatches && !ui.isEditingAny ? (
            <div className="py-2xl flex flex-col items-center justify-center opacity-50">
              <p className="text-text-primary text-[15px] font-medium">
                해당하는 리마인더가 없습니다.
              </p>
            </div>
          ) : (
            ui.filteredSections.map((section) => (
              <ReminderSection
                key={section.id}
                title={section.title}
                category={section.id}
                items={section.items}
              />
            ))
          )}
        </div>

        {!ui.searchQuery.trim() && (
          <button
            className="bg-plus-bg text-plus-icon mt-sm mb-2xl duration-normal dark:bg-gray-dark dark:text-gray-medium mx-auto flex h-[var(--plus-btn-size)] w-[var(--plus-btn-size)] shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all hover:scale-105 active:scale-95"
            onClick={ui.addSection}
            title="새 섹션 추가"
          >
            <Icon name="plus" size={30} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ReminderPage;
