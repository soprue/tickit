import { useReminderUIStore } from '@src/features/reminder/domain/ReminderUIStore';
import { useTimePickerState } from './useTimePickerState';
import { ReminderSectionData } from '../domain/reminder';

/**
 * 전역 UI 스토어를 활용하여 리마인더 편집/추가 관련 아이디 상태를 관리하는 커스텀 훅.
 */
export function useEditState(sections: ReminderSectionData[]) {
  const ui = useReminderUIStore();
  const timePicker = useTimePickerState();

  const setEditingItemId = (reminderId: number | null) => {
    if (reminderId === null) {
      ui.setEditingItemId(null);
      return;
    }

    const foundItem = sections.flatMap((s) => s.items).find((it) => it.id === reminderId);

    if (foundItem) {
      timePicker.setInitialTime(foundItem.time, foundItem.isAllDay);
      ui.setEditingItemId(reminderId);
    }
  };

  const setEditingSectionId = (sectionId: string | null) => {
    ui.setEditingSectionId(sectionId);
  };

  const setAddingSection = (sectionId: string | null) => {
    timePicker.resetTimeState();
    ui.setAddingSectionId(sectionId);
  };

  const clearEditState = () => {
    ui.resetEditState();
  };

  return {
    editState: {
      addingSectionId: ui.addingSectionId,
      editingItemId: ui.editingItemId,
      editingSectionId: ui.editingSectionId,
      ...timePicker.timeState,
    },
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    toggleTimePopover: timePicker.toggleTimePopover,
    updatePickerTime: timePicker.updatePickerTime,
    setAllDay: timePicker.setAllDay,
    clearEditState,
  };
}

