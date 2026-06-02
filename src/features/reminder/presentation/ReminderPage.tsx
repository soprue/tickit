import { useRef } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { ReminderSkeleton } from './components/ReminderSkeleton';
import { ReminderSearchBar } from './components/ReminderSearchBar';
import { AddSectionButton } from './components/AddSectionButton';
import { useReminderUI } from './hooks/useReminderUI';
import { useAuthActions } from '@src/features/auth/presentation/hooks/useAuthActions';
import { useReminderShortcuts } from './hooks/useReminderShortcuts';
import { ReminderActionsProvider } from './context/ReminderActionsContext';

export default function ReminderPage() {
  // 1. 통합 훅
  const ui = useReminderUI();
  const { logout } = useAuthActions();

  // 2. 단축키 훅
  useReminderShortcuts({ addSection: ui.addSection });

  // 3. 글로벌 설정
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { toggleDarkMode } = useThemeStore((state) => state.actions);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-bg duration-normal flex h-full w-full transition-colors">
      <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onLogout={logout} />

      <ReminderActionsProvider ui={ui}>
        <div className="p-lg px-md gap-md box-border flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth">
          {/* 상단 검색 및 필터 바 */}
          <ReminderSearchBar
            value={ui.searchQuery}
            onChange={ui.setSearchQuery}
            filterMode={ui.filterMode}
            onToggleFilter={ui.toggleFilterMode}
          />

          <div className="gap-md flex flex-col">
            {ui.isLoading ? (
              <ReminderSkeleton />
            ) : ui.searchQuery.trim() && !ui.hasAnyMatches && !ui.isEditingAny ? (
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
                  isFixed={section.isFixed}
                  items={section.items}
                />
              ))
            )}
          </div>

          {/* 새 섹션 추가 버튼 */}
          {!ui.searchQuery.trim() && <AddSectionButton onClick={ui.addSection} />}
        </div>
      </ReminderActionsProvider>
    </div>
  );
}
