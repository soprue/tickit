import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useThemeStore } from '@src/shared/domain/ThemeStore';
import { useReminderStore, useSaveStatusStore } from '@src/features/reminder/domain/ReminderStore';

import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { useReminderUI } from './hooks/useReminderUI';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';

const ReminderPage: React.FC = () => {
  // 1. UI 상태 관리 (Custom Hook)
  const { 
    state, 
    setState, 
    setSearchQuery, 
    toggleHideCompleted,
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    toggleTimePopover,
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
    updatePickerTime,
    setAllDay,
    logout
  } = useReminderUI();

  // 2. 알림 모니터링 (React Lifecycle 통합)
  useNotificationMonitor();

  // 3. Zustand 스토어 데이터
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { sections } = useReminderStore();
  const { isSaving } = useSaveStatusStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // 4. DOM 조작 및 포커스 관리
  useEffect(() => {
    if (!containerRef.current) return;
    const input = containerRef.current.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (state.addingSectionId || state.editingItemId || state.editingSectionId) && !state.showTimePopover) {
      input.focus();
    }
  }, [state.addingSectionId, state.editingItemId, state.editingSectionId, state.showTimePopover]);

  // 5. 비즈니스 로직 (메모이제이션 활용)
  const filteredSections = useMemo(() => {
    const isEditingAny = !!(state.addingSectionId || state.editingItemId || state.editingSectionId);
    const isSearching = state.searchQuery.trim().length > 0;

    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const matchSearch = item.text.toLowerCase().includes(state.searchQuery.toLowerCase());
          const matchStatus = !state.hideCompleted || !item.done;
          return matchSearch && matchStatus;
        })
      }))
      .filter(section => {
        if (isEditingAny) return true;
        if (isSearching) return section.items.length > 0;
        return true;
      });
  }, [sections, state.searchQuery, state.hideCompleted, state.addingSectionId, state.editingItemId, state.editingSectionId]);

  const hasAnyMatches = filteredSections.some(s => s.items.length > 0);

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
        onLogout={logout} 
      />

      <div className="reminder-list-wrapper">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input" 
              placeholder="검색어를 입력하세요..." 
              value={state.searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button 
              className={`filter-toggle-btn ${state.hideCompleted ? 'active' : ''}`} 
              onClick={toggleHideCompleted}
              title="완료된 항목 숨기기"
            >
              <span className="filter-icon">✓</span>
            </button>
          </div>
        </div>

        <div className="sections-container">
          {state.searchQuery.trim() && !hasAnyMatches && !(state.addingSectionId || state.editingItemId || state.editingSectionId) ? (
            <div className="empty-search-state"><p className="empty-message">해당하는 리마인더가 없습니다.</p></div>
          ) : (
            filteredSections.map((section) => (
              <ReminderSection 
                key={section.id}
                title={section.title}
                category={section.id}
                items={section.items}
                addingSectionId={state.addingSectionId}
                editingItemId={state.editingItemId}
                isEditingTitle={state.editingSectionId === section.id}
                showTimePopover={state.showTimePopover}
                selectedTime={state.selectedTime}
                isAllDay={state.isAllDay}
                pickerState={{ ampm: state.pickerAMPM, hour: state.pickerHour, minute: state.pickerMinute }}
                onUpdateSectionTitle={updateSectionTitle}
                onDeleteSection={deleteSection}
                onSetEditingSectionId={setEditingSectionId}
                onSetAddingSection={setAddingSection}
                onToggleTimePopover={toggleTimePopover}
                onAddReminder={addReminder}
                onToggleReminder={toggleReminder}
                onDeleteReminder={deleteReminder}
                onUpdateReminder={updateReminder}
                onSetEditingItemId={setEditingItemId}
                onUpdatePickerTime={updatePickerTime}
                onSetAllDay={setAllDay}
              />
            ))
          )}
        </div>

        {!state.searchQuery.trim() && (
          <button className="plus-btn-container" onClick={addSection}>
            <Icon name="plus" size={30} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;
