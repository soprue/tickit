import React, { useState, useEffect, useRef, useMemo } from 'react';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';

// 부품 컴포넌트 및 서비스 (이들도 나중에 React로 변환되어야 합니다!)
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { Icon } from '@src/shared/presentation/components/Icon';
import { reminderService } from './ReminderService';
import { notificationService } from './NotificationService';

const ReminderPage: React.FC = () => {
  // 1. 상태 관리 (Vanilla의 this.state 대체)
  const [state, setState] = useState({
    addingSectionId: null as string | null,
    editingItemId: null as number | null,
    editingSectionId: null as string | null,
    searchQuery: '',
    hideCompleted: false,
    showTimePopover: false,
    selectedTime: undefined as Date | undefined,
    isAllDay: false,
    pickerAMPM: 'AM' as 'AM' | 'PM',
    pickerHour: '09',
    pickerMinute: '00',
  });

  // 스토어 데이터 (나중에 Zustand로 바꾸면 더 깔끔해집니다!)
  const [auth, setAuth] = useState(authStore.getState());
  const [theme, setTheme] = useState(themeStore.getState());
  const [reminders, setReminders] = useState(reminderStore.getState());

  const containerRef = useRef<HTMLDivElement>(null);

  // 2. 초기화 및 스토어 구독 (Vanilla의 init 대체)
  useEffect(() => {
    // 서비스 초기화
    reminderService.setComponent({ setState } as any); // 임시 우회
    notificationService.startMonitoring();

    // 스토어 구독
    const unsubs = [
      authStore.subscribe(() => setAuth(authStore.getState())),
      themeStore.subscribe(() => setTheme(themeStore.getState())),
      reminderStore.subscribe(() => setReminders(reminderStore.getState())),
    ];

    return () => unsubs.forEach(unsub => unsub()); // 언마운트 시 구독 해제
  }, []);

  // 3. DOM 조작 및 포커스 관리 (Vanilla의 componentDidUpdate 대체)
  useEffect(() => {
    if (!containerRef.current) return;

    // 입력창 포커스 복구 로직
    const input = containerRef.current.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (state.addingSectionId || state.editingItemId || state.editingSectionId) && !state.showTimePopover) {
      input.focus();
    }
  }, [state.addingSectionId, state.editingItemId, state.editingSectionId, state.showTimePopover]);

  // 4. 비즈니스 로직 (메모이제이션 활용)
  const filteredSections = useMemo(() => {
    const isEditingAny = !!(state.addingSectionId || state.editingItemId || state.editingSectionId);
    const isSearching = state.searchQuery.trim().length > 0;

    return reminders.sections
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
  }, [reminders.sections, state.searchQuery, state.hideCompleted, state.addingSectionId, state.editingItemId, state.editingSectionId]);

  const hasAnyMatches = filteredSections.some(s => s.items.length > 0);

  // 5. 렌더링 (Vanilla의 render 대체)
  return (
    <div ref={containerRef} className={`app-container ${theme.isDarkMode ? 'dark-mode' : ''}`}>
      {/* 저장 상태 토스트 */}
      <div className={`save-status-toast ${reminderStore.isSaving ? 'visible saving' : 'saved'}`}>
        <div className="save-icon-wrapper">
          {reminderStore.isSaving ? <div className="spinner-dot" /> : <span className="check-icon">✓</span>}
        </div>
        <span className="save-text">{reminderStore.isSaving ? '저장 중...' : '저장 완료'}</span>
      </div>

      {/* 사이드바 */}
      <Sidebar 
        isDarkMode={theme.isDarkMode} 
        onToggleTheme={() => reminderService.toggleDarkMode()} 
        onLogout={() => reminderService.handleLogout()} 
      />

      <div className="reminder-list-wrapper">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input" 
              placeholder="검색어를 입력하세요..." 
              value={state.searchQuery} 
              onChange={(e) => reminderService.handleSearch(e.target as any)} 
            />
            <button 
              className={`filter-toggle-btn ${state.hideCompleted ? 'active' : ''}`} 
              onClick={() => setState(s => ({ ...s, hideCompleted: !s.hideCompleted }))}
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
              />
            ))
          )}
        </div>

        {!state.searchQuery.trim() && (
          <button className="plus-btn-container" onClick={() => reminderService.addSection()}>
            <Icon name="plus" size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;
