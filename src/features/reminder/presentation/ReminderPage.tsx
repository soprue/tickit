import { useRef, useEffect } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { useReminderUI } from './hooks/useReminderUI';
import { useAuthActions } from '@src/features/auth/presentation/hooks/useAuthActions';
import { Input } from '@src/shared/presentation/components/ui/Input';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

function ReminderPage() {
  // 1. 통합 훅
  const ui = useReminderUI();
  const { logout } = useAuthActions();
  const { hideToast, isOpen: isToastOpen } = useToastStore();
  const { closeModal, isOpen: isModalOpen } = useModalStore();

  // 2. 글로벌 설정
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // 단축키 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc: 토스트나 모달 닫기
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isToastOpen) hideToast();
      }

      // 2. Cmd/Ctrl + N: 새 섹션 추가
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        ui.addSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isToastOpen, closeModal, hideToast, ui]);

  return (
    <div ref={containerRef} className="bg-bg duration-normal flex h-full w-full transition-colors">
      <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onLogout={logout} />

      <div className="p-lg px-md gap-md box-border flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth">
        <div className="px-md mb-sm">
          <div className="relative flex w-full items-center">
            <input
              type="text"
              className="bg-black/[0.03] border-black/[0.06] text-text-primary placeholder:text-gray-medium/40 w-full rounded-xl border py-[10px] pr-[120px] pl-4 text-[14px] outline-none transition-all focus:bg-black/[0.05] focus:border-primary/20 dark:border-white/10 dark:bg-white/[0.03] dark:focus:bg-white/[0.06]"
              placeholder="검색어를 입력하세요..."
              value={ui.searchQuery}
              onChange={(e) => ui.setSearchQuery(e.target.value)}
            />
            
            <div className="absolute right-2 flex items-center gap-2">
              <div className="bg-gray-light/30 h-3.5 w-[1px]" />
              <button
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all active:scale-95 ${
                  ui.hideCompleted 
                    ? 'text-primary font-bold' 
                    : 'text-gray-medium/60 hover:text-gray-medium font-medium'
                }`}
                onClick={ui.toggleHideCompleted}
              >
                <div className={`h-1 w-1 rounded-full ${ui.hideCompleted ? 'bg-primary animate-pulse' : 'bg-gray-light/50'}`} />
                <span className="text-[10px] tracking-tight uppercase">
                  {ui.hideCompleted ? 'Hide Done' : 'Show All'}
                </span>
              </button>
            </div>
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
