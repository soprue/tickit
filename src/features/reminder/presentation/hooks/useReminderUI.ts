import { useReminderStore } from '@src/features/reminder/domain/ReminderStore';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useEditState } from './useEditState';
import { useSearchFilter } from './useSearchFilter';
import { useActionContext } from '@src/shared/context/ActionContext';

/**
 * 리마인더 페이지의 모든 상태와 액션을 통합 관리하는 "지휘관(Facade)" 훅.
 * 리마인더 도메인 로직과 UI 상태 필터링을 연결합니다.
 */
export const useReminderUI = () => {
  const { showConfirm } = useModalStore();
  const { runAction } = useActionContext(); // 전역 액션 실행 도구

  const {
    sections,
    addSection: _addSection,
    updateSectionTitle: _updateSectionTitle,
    deleteSection: _deleteSection,
    toggleReminder: _toggleReminder,
    deleteReminder: _deleteReminder,
    updateReminder: _updateReminder,
    addReminder: _addReminder,
  } = useReminderStore();

  const edit = useEditState();

  const isEditingAny = !!(
    edit.editState.addingSectionId ||
    edit.editState.editingItemId ||
    edit.editState.editingSectionId
  );

  const filter = useSearchFilter(sections, isEditingAny);

  // 저장 완료를 체감할 수 있도록 약간의 대기 시간을 줌
  const waitSave = () => new Promise((resolve) => setTimeout(resolve, 300));

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션 (전역 runAction으로 래핑)                                           */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    runAction(async () => {
      _addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
      await waitSave();
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      runAction(async () => {
        _updateSectionTitle(sectionId, title);
        await waitSave();
      });
    }
    edit.clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    showConfirm({
      title: '섹션 삭제',
      message: '이 섹션을 삭제하시겠습니까? 섹션 내 모든 리마인더가 삭제됩니다.',
      onConfirm: () => {
        runAction(async () => {
          _deleteSection(sectionId);
          await waitSave();
        });
      },
    });
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    runAction(async () => {
      _toggleReminder(sectionId, reminderId);
      await waitSave();
    });
  };

  const deleteReminder = (sectionId: string, reminderId: number) => {
    showConfirm({
      title: '리마인더 삭제',
      message: '이 항목을 삭제하시겠습니까?',
      onConfirm: () => {
        runAction(async () => {
          _deleteReminder(sectionId, reminderId);
          await waitSave();
        });
      },
    });
  };

  const updateReminder = (sectionId: string, reminderId: number, text: string) => {
    const { editingItemId, selectedTime, isAllDay } = edit.editState;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      runAction(async () => {
        _updateReminder(sectionId, reminderId, text, selectedTime, isAllDay);
        await waitSave();
      });
    }
    edit.clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { addingSectionId, selectedTime, isAllDay } = edit.editState;
    if (addingSectionId !== sectionId) return;

    if (!text.trim()) return;

    runAction(async () => {
      _addReminder(sectionId, text, selectedTime, isAllDay);
      await waitSave();
    });
    edit.setAddingSection(null);
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
  };
};
