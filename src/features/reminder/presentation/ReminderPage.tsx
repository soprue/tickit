import React, { useRef } from 'react';
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

  // 3. 글로벌 설정 상태
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { isSaving } = useSaveStatusStore();

  const containerRef = useRef<HTMLDivElement>(null);

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
          {ui.searchQuery.trim() && !ui.hasAnyMatches && !ui.isEditingAny ? (
            <div className="empty-search-state"><p className="empty-message">해당하는 리마인더가 없습니다.</p></div>
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
          <button className="plus-btn-container" onClick={ui.addSection}>
            <Icon name="plus" size={30} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;
