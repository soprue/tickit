import { useNavigate } from 'react-router-dom';
import { useReminderStore } from '@src/features/reminder/domain/ReminderStore';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useEditState } from './useEditState';
import { useSearchFilter } from './useSearchFilter';

/**
 * 리마인더 페이지의 모든 상태와 액션을 통합 관리하는 "지휘관(Facade)" 훅.
 * 내부적으로 useEditState와 useSearchFilter를 조립하여 데이터 흐름을 중재합니다.
 */
export const useReminderUI = () => {
  const navigate = useNavigate();
  const { showConfirm } = useModalStore();

  // 1. 스토어 훅을 통해 데이터와 액션 모두 가져오기
  const { 
    sections, 
    addSection: _addSection, 
    updateSectionTitle: _updateSectionTitle,
    deleteSection: _deleteSection,
    toggleReminder: _toggleReminder,
    deleteReminder: _deleteReminder,
    updateReminder: _updateReminder,
    addReminder: _addReminder
  } = useReminderStore();
  
  const edit = useEditState();

  // 2. 상태 간의 연결
  const isEditingAny = !!(
    edit.editState.addingSectionId || 
    edit.editState.editingItemId || 
    edit.editState.editingSectionId
  );

  const filter = useSearchFilter(sections, isEditingAny);

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션                                                                   */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    _addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      _updateSectionTitle(sectionId, title);
    }
    edit.clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    showConfirm({
      title: '섹션 삭제',
      message: '이 섹션을 삭제하시겠습니까? 섹션 내 모든 리마인더가 삭제됩니다.',
      onConfirm: () => _deleteSection(sectionId),
    });
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    _toggleReminder(sectionId, reminderId);
  };

  const deleteReminder = (sectionId: string, reminderId: number) => {
    showConfirm({
      title: '리마인더 삭제',
      message: '이 항목을 삭제하시겠습니까?',
      onConfirm: () => _deleteReminder(sectionId, reminderId),
    });
  };

  const updateReminder = (sectionId: string, reminderId: number, text: string) => {
    const { editingItemId, selectedTime, isAllDay } = edit.editState;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      _updateReminder(sectionId, reminderId, text, selectedTime, isAllDay);
    }
    edit.clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { addingSectionId, selectedTime, isAllDay } = edit.editState;
    if (addingSectionId !== sectionId) return;

    if (!text.trim()) return;

    _addReminder(sectionId, text, selectedTime, isAllDay);
    edit.setAddingSection(null);
  };

  /* -------------------------------------------------------------------------- */
  /* 기타 액션                                                                    */
  /* -------------------------------------------------------------------------- */

  const logout = () => {
    authStore.logout();
    navigate('/login');
  };

  return {
    state: edit.editState,
    isEditingAny,
    setEditingItemId: edit.setEditingItemId,
    setEditingSectionId: edit.setEditingSectionId,
    setAddingSection: edit.setAddingSection,
    toggleTimePopover: edit.toggleTimePopover,
    updatePickerTime: edit.updatePickerTime,
    setAllDay: edit.setAllDay,
    searchQuery: filter.searchQuery,
    hideCompleted: filter.hideCompleted,
    filteredSections: filter.filteredSections,
    hasAnyMatches: filter.hasAnyMatches,
    setSearchQuery: filter.setSearchQuery,
    toggleHideCompleted: filter.toggleHideCompleted,
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
