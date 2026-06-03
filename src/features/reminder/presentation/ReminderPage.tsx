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

export default function ReminderPage() {
  const ui = useReminderUI();
  const { logout } = useAuthActions();

  useReminderShortcuts({ addSection: ui.actions.addSection });

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { toggleDarkMode } = useThemeStore((state) => state.actions);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-bg duration-normal flex h-full w-full transition-colors">
      <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onLogout={logout} />

      <div className="p-lg px-md gap-md box-border flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth">
        <ReminderSearchBar
          value={ui.filter.searchQuery}
          onChange={ui.filter.setSearchQuery}
          filterMode={ui.filter.filterMode}
          onToggleFilter={ui.filter.toggleFilterMode}
        />

        <div className="gap-md flex flex-col">
          {ui.status.isLoading ? (
            <ReminderSkeleton />
          ) : ui.filter.searchQuery.trim() &&
            !ui.data.hasAnyMatches &&
            !ui.edit.isEditingAny ? (
            <div className="py-2xl flex flex-col items-center justify-center opacity-50">
              <p className="text-text-primary text-[15px] font-medium">
                해당하는 리마인더가 없습니다.
              </p>
            </div>
          ) : (
            ui.data.filteredSections.map((section) => (
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

        {!ui.filter.searchQuery.trim() && <AddSectionButton onClick={ui.actions.addSection} />}
      </div>
    </div>
  );
}
