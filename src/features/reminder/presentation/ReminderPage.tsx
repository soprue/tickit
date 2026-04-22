import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { useReminderStore, useSaveStatusStore } from '@src/features/reminder/domain/ReminderStore';

import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { useReminderUI } from './hooks/useReminderUI';
import { useSearchFilter } from './hooks/useSearchFilter';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';

const ReminderPage: React.FC = () => {
  // 1. 데이터 가져오기
  const { sections } = useReminderStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { isSaving } = useSaveStatusStore();

  // 2. UI 인터랙션 훅
  const ui = useReminderUI();

  // 3. 필터링 및 검색 훅 (UI의 편집 상태에 의존)
  const isEditingAny = !!(ui.state.addingSectionId || ui.state.editingItemId || ui.state.editingSectionId);
  const { 
    searchQuery, 
    hideCompleted, 
    filteredSections, 
    hasAnyMatches, 
    setSearchQuery, 
    toggleHideCompleted 
  } = useSearchFilter(sections, isEditingAny);

  // 4. 알림 모니터링
  useNotificationMonitor();

  const containerRef = useRef<HTMLDivElement>(null);

  // 5. 포커스 관리
  useEffect(() => {
    if (!containerRef.current) return;
    const input = containerRef.current.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (ui.state.addingSectionId || ui.state.editingItemId || ui.state.editingSectionId) && !ui.state.showTimePopover) {
      input.focus();
    }
  }, [ui.state.addingSectionId, ui.state.editingItemId, ui.state.editingSectionId, ui.state.showTimePopover]);

  return (
    <div ref={containerRef} className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 저장 상태 토스트 */}
      <div className={`save-status-toast ${isSaving ? 'visible saving' : 'saved'}`}>
        <div className="save-icon-wrapper">
          {isSaving ? <div className="spinner-dot" /> : <span className="check-icon">✓</span>}
        </div>
        <span className="save-text">{isSaving ? '저장 중...' : '저장 완료'}</span>
      </div>

      <Sidebar 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleDarkMode} 
        onLogout={ui.logout} 
      />

      <div className="reminder-list-wrapper">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input" 
              placeholder="검색어를 입력하세요..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button 
              className={`filter-toggle-btn ${hideCompleted ? 'active' : ''}`} 
              onClick={toggleHideCompleted}
              title="완료된 항목 숨기기"
            >
              <span className="filter-icon">✓</span>
            </button>
          </div>
        </div>

        <div className="sections-container">
          {searchQuery.trim() && !hasAnyMatches && !isEditingAny ? (
            <div className="empty-search-state"><p className="empty-message">해당하는 리마인더가 없습니다.</p></div>
          ) : (
            filteredSections.map((section) => (
              <ReminderSection 
                key={section.id}
                title={section.title}
                category={section.id}
                items={section.items}
                addingSectionId={ui.state.addingSectionId}
                editingItemId={ui.state.editingItemId}
                isEditingTitle={ui.state.editingSectionId === section.id}
                showTimePopover={ui.state.showTimePopover}
                selectedTime={ui.state.selectedTime}
                isAllDay={ui.state.isAllDay}
                pickerState={{ ampm: ui.state.pickerAMPM, hour: ui.state.pickerHour, minute: ui.state.pickerMinute }}
                onUpdateSectionTitle={ui.updateSectionTitle}
                onDeleteSection={ui.deleteSection}
                onSetEditingSectionId={ui.setEditingSectionId}
                onSetAddingSection={ui.setAddingSection}
                onToggleTimePopover={ui.toggleTimePopover}
                onAddReminder={ui.addReminder}
                onToggleReminder={ui.toggleReminder}
                onDeleteReminder={ui.deleteReminder}
                onUpdateReminder={ui.updateReminder}
                onSetEditingItemId={ui.setEditingItemId}
                onUpdatePickerTime={ui.updatePickerTime}
                onSetAllDay={ui.setAllDay}
              />
            ))
          )}
        </div>

        {!searchQuery.trim() && (
          <button className="plus-btn-container" onClick={ui.addSection}>
            <Icon name="plus" size={30} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;
