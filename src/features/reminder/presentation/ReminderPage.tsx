import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { useSaveStatusStore } from '@src/features/reminder/domain/ReminderStore';

import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { useReminderUI } from './hooks/useReminderUI';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';

const ReminderPage: React.FC = () => {
  // 1. 모든 UI 로직 및 필터링 데이터를 하나의 "통합 훅"에서 가져옵니다.
  const ui = useReminderUI();

  // 2. 알림 모니터링
  useNotificationMonitor();

  // 3. 글로벌 설정 상태 (테마 및 저장 중 여부)
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { isSaving } = useSaveStatusStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // 4. 포커스 관리 (입력창 자동 포커스)
  useEffect(() => {
    if (!containerRef.current) return;
    const input = containerRef.current.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (ui.state.addingSectionId || ui.state.editingItemId || ui.state.editingSectionId) && !ui.state.showTimePopover) {
      input.focus();
    }
  }, [ui.state.addingSectionId, ui.state.editingItemId, ui.state.editingSectionId, ui.state.showTimePopover]);

  return (
    <div ref={containerRef} className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 저장 상태 알림 토스트 */}
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
              value={ui.searchQuery} 
              onChange={(e) => ui.setSearchQuery(e.target.value)} 
            />
            <button 
              className={`filter-toggle-btn ${ui.hideCompleted ? 'active' : ''}`} 
              onClick={ui.toggleHideCompleted}
              title="완료된 항목 숨기기"
            >
              <span className="filter-icon">✓</span>
            </button>
          </div>
        </div>

        <div className="sections-container">
          {/* 검색 결과가 없을 때의 예외 처리 */}
          {ui.searchQuery.trim() && !ui.hasAnyMatches && !ui.isEditingAny ? (
            <div className="empty-search-state"><p className="empty-message">해당하는 리마인더가 없습니다.</p></div>
          ) : (
            ui.filteredSections.map((section) => (
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

        {/* 검색 중이 아닐 때만 섹션 추가 버튼 노출 */}
        {!ui.searchQuery.trim() && (
          <button className="plus-btn-container" onClick={ui.addSection}>
            <Icon name="plus" size={30} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;
