import { useReminderStore, reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useEditState } from './useEditState';
import { useSearchFilter } from './useSearchFilter';

/**
 * 리마인더 페이지의 모든 상태와 액션을 통합 관리하는 "지휘관(Facade)" 훅.
 * 내부적으로 useEditState와 useSearchFilter를 조립하여 데이터 흐름을 중재합니다.
 */
export const useReminderUI = () => {
  // 1. 기초 데이터 및 상태 훅 호출
  const { sections } = useReminderStore();
  const edit = useEditState();

  // 2. 상태 간의 연결 (편집 상태에 따라 필터링 결과가 달라짐)
  const isEditingAny = !!(
    edit.editState.addingSectionId || 
    edit.editState.editingItemId || 
    edit.editState.editingSectionId
  );

  const filter = useSearchFilter(sections, isEditingAny);

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션 (비즈니스 로직과 상태 제어의 결합)                                   */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    reminderStore.addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      reminderStore.updateSectionTitle(sectionId, title);
    }
    edit.clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('이 섹션을 삭제하시겠습니까?')) {
      reminderStore.deleteSection(sectionId);
    }
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    reminderStore.toggleReminder(sectionId, reminderId);
  };

  const deleteReminder = (sectionId: string, reminderId: number) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      reminderStore.deleteReminder(sectionId, reminderId);
    }
  };

  const updateReminder = (sectionId: string, reminderId: number, text: string) => {
    const { editingItemId, selectedTime, isAllDay } = edit.editState;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, selectedTime, isAllDay);
    }
    edit.clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { addingSectionId, selectedTime, isAllDay } = edit.editState;
    if (addingSectionId !== sectionId) return;

    if (!text.trim()) return;

    reminderStore.addReminder(sectionId, text, selectedTime, isAllDay);
    edit.setAddingSection(null);
  };

  /* -------------------------------------------------------------------------- */
  /* 기타 액션                                                                    */
  /* -------------------------------------------------------------------------- */

  const logout = () => {
    authStore.logout();
    window.location.hash = '#/login';
  };

  // 3. 페이지가 필요한 모든 정보를 하나의 객체로 묶어서 반환 (인터페이스 통합)
  return {
    // UI 상태 (from useEditState)
    state: edit.editState,
    isEditingAny,
    
    // 편집 액션 (from useEditState)
    setEditingItemId: edit.setEditingItemId,
    setEditingSectionId: edit.setEditingSectionId,
    setAddingSection: edit.setAddingSection,
    toggleTimePopover: edit.toggleTimePopover,
    updatePickerTime: edit.updatePickerTime,
    setAllDay: edit.setAllDay,

    // 검색 및 필터링 (from useSearchFilter)
    searchQuery: filter.searchQuery,
    hideCompleted: filter.hideCompleted,
    filteredSections: filter.filteredSections,
    hasAnyMatches: filter.hasAnyMatches,
    setSearchQuery: filter.setSearchQuery,
    toggleHideCompleted: filter.toggleHideCompleted,

    // CRUD 및 기타 액션
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
    logout
  };
};
