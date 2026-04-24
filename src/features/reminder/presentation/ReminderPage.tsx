import { useRef } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { SaveStatusToast } from '@src/shared/presentation/components/SaveStatusToast';
import { useReminderUI } from './hooks/useReminderUI';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';
import { Input } from '@src/shared/presentation/components/ui/Input';

function ReminderPage() {
  // 1. 통합 훅
  const ui = useReminderUI();

  // 2. 알림 모니터링
  useNotificationMonitor();

  // 3. 글로벌 설정
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className='flex w-full h-full bg-bg transition-colors duration-normal'
    >
      {/* 전역 Action 기반 선언적 토스트 */}
      <SaveStatusToast />

      <Sidebar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
        onLogout={ui.logout}
      />

      <div className='flex-1 h-full overflow-y-auto overflow-x-hidden p-lg px-md box-border flex flex-col gap-md scroll-smooth'>
        <div className='px-md mb-sm'>
          <div className='flex items-center gap-2 w-full group'>
            <Input
              type='text'
              className='flex-1 !px-4 !py-[10px] border border-black/5 bg-white focus:shadow-sm dark:bg-black dark:border-white/5'
              placeholder='검색어를 입력하세요...'
              value={ui.searchQuery}
              onChange={(e) => ui.setSearchQuery(e.target.value)}
            />
            <button
              className={`
                w-[38px] h-[38px] rounded-lg border flex justify-center items-center cursor-pointer transition-all shrink-0
                ${ui.hideCompleted 
                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/30 hover:brightness-105 active:scale-95' 
                  : 'bg-white border-black/5 text-text-primary hover:bg-gray-50 active:bg-gray-100 dark:bg-black dark:border-white/10 dark:text-white dark:hover:bg-gray-dark'
                }
              `}
              onClick={ui.toggleHideCompleted}
              title='완료된 항목 숨기기'
            >
              <span className='font-extrabold text-[16px]'>✓</span>
            </button>
          </div>
        </div>

        <div className='flex flex-col gap-md'>
          {ui.searchQuery.trim() && !ui.hasAnyMatches && !ui.isEditingAny ? (
            <div className='flex flex-col items-center justify-center py-2xl opacity-50'>
              <p className='text-[15px] font-medium text-text-primary'>
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
            className='w-[var(--plus-btn-size)] h-[var(--plus-btn-size)] bg-plus-bg text-plus-icon rounded-full border-none flex justify-center items-center cursor-pointer mx-auto mt-sm mb-2xl shrink-0 transition-all duration-normal hover:scale-105 active:scale-95 dark:bg-gray-dark dark:text-gray-medium'
            onClick={ui.addSection}
            title='새 섹션 추가'
          >
            <Icon name='plus' size={30} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ReminderPage;
