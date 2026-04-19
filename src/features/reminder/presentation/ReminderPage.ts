import { Component, ComponentProps } from '@core/Component';
import jsx from '@core/JSX';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';

// 부품 컴포넌트 및 서비스 임포트
import { Sidebar } from '@src/shared/presentation/Sidebar';
import { ReminderSection } from './components/ReminderSection';
import { reminderService } from './ReminderService';
import { notificationService } from './NotificationService';
import plusIcon from '@assets/icons/plus.svg';

interface ReminderState {
  addingSectionId: string | null;
  editingItemId: number | null;
  editingSectionId: string | null;
  searchQuery: string;
  hideCompleted: boolean; // 필터: 완료된 항목 숨기기 (유지)
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerAMPM: 'AM' | 'PM';
  pickerHour: string;
  pickerMinute: string;
}

/**
 * 리마인더 메인 페이지 컴포넌트
 */
export default class ReminderPage extends Component<ComponentProps, ReminderState> {
  init() {
    reminderService.setComponent(this);
    notificationService.startMonitoring();
    
    this.state = {
      addingSectionId: null,
      editingItemId: null,
      editingSectionId: null,
      searchQuery: '',
      hideCompleted: false,
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: 'AM',
      pickerHour: '09',
      pickerMinute: '00',
    };
    
    this.subscribe(authStore);
    this.subscribe(themeStore);
    this.subscribe(reminderStore);
  }

  componentDidUpdate() {
    // 1. 입력창 포커스 복구
    const input = this.target.querySelector('.reminder-inline-input, .section-title-input') as HTMLInputElement;
    if (input && (this.state.addingSectionId || this.state.editingItemId || this.state.editingSectionId) && !this.state.showTimePopover) {
      input.focus();
      const val = input.value;
      input.value = ''; input.value = val;
    }

    // 2. 시간 피커 자동 스크롤 (중앙 정렬)
    if (this.state.showTimePopover) {
      const columns = this.target.querySelectorAll('.mini-column');
      columns.forEach(column => {
        const selectedItem = column.querySelector('.mini-item.selected') as HTMLElement;
        if (selectedItem) {
          // 선택된 아이템이 컬럼의 중앙에 오도록 스크롤 위치 계산
          const columnHeight = column.clientHeight;
          const itemHeight = selectedItem.clientHeight;
          const itemOffsetTop = selectedItem.offsetTop;
          
          column.scrollTop = itemOffsetTop - (columnHeight / 2) + (itemHeight / 2);
        }
      });
    }
  }

  toggleHideCompleted() {
    this.setState({ hideCompleted: !this.state.hideCompleted });
  }

  render() {
    const { addingSectionId, editingItemId, editingSectionId, searchQuery, hideCompleted, showTimePopover, selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute } = this.state;
    const { isDarkMode } = themeStore.getState();
    const { sections } = reminderStore.getState();
    const isSaving = reminderStore.isSaving;

    const isEditingAny = !!(addingSectionId || editingItemId || editingSectionId);
    const isSearching = searchQuery.trim().length > 0;

    // 통합 필터링 로직
    const filteredSections = sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
          const matchStatus = !hideCompleted || !item.done;
          return matchSearch && matchStatus;
        })
      }))
      .filter(section => {
        if (isEditingAny) return true;
        // 검색 중일 때만 검색 결과가 있는 섹션으로 필터링
        if (isSearching) return section.items.length > 0;
        // 검색 중이 아닐 때는 모든 섹션(Work 등 빈 섹션 포함) 유지
        return true;
      });

    const hasAnyMatches = filteredSections.some(s => s.items.length > 0);

    return jsx`
      <div class="app-container ${isDarkMode ? 'dark-mode' : ''}">
        <div class="save-status-toast ${isSaving ? 'visible saving' : 'saved'}">
          <div class="save-icon-wrapper">${isSaving ? jsx`<div class="spinner-dot"></div>` : jsx`<span class="check-icon">✓</span>`}</div>
          <span class="save-text">${isSaving ? '저장 중...' : '저장 완료'}</span>
        </div>

        ${Sidebar({
          isDarkMode,
          onToggleTheme: () => reminderService.toggleDarkMode(),
          onLogout: () => reminderService.handleLogout(),
        })}

        <div class="reminder-list-wrapper">
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <input type="text" class="search-input" placeholder="검색어를 입력하세요..." value="${searchQuery}" oninput="${(e: Event) => reminderService.handleSearch(e)}" />
              <button class="filter-toggle-btn ${hideCompleted ? 'active' : ''}" onclick="${() => this.toggleHideCompleted()}" title="완료된 항목 숨기기">
                <span class="filter-icon">✓</span>
              </button>
            </div>
          </div>

          <div class="sections-container">
            ${isSearching && !hasAnyMatches && !isEditingAny
                ? jsx`<div class="empty-search-state"><p class="empty-message">해당하는 리마인더가 없습니다.</p></div>`
                : filteredSections.map((section) => ReminderSection({
                    title: section.title,
                    category: section.id,
                    items: section.items,
                    addingSectionId,
                    editingItemId,
                    isEditingTitle: editingSectionId === section.id,
                    showTimePopover,
                    selectedTime,
                    isAllDay,
                    pickerState: { ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute },
                  }))
            }
          </div>

          ${!isSearching ? jsx`
            <button class="plus-btn-container" onclick="${() => reminderService.addSection()}">
              <img src="${plusIcon}" alt="add" />
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }
}
