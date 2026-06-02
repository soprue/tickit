import { useMemo } from 'react';
import { useReminderUIStore } from '@src/features/reminder/domain/ReminderUIStore';
import { useTimePickerState } from './useTimePickerState';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

/**
 * 전역 UI 스토어를 활용하여 리마인더 편집/추가 관련 아이디 상태를 관리하는 커스텀 훅.
 */
export function useEditState(sections: ReminderSectionData[]) {
  const addingSectionId = useReminderUIStore((state) => state.addingSectionId);
  const editingItemId = useReminderUIStore((state) => state.editingItemId);
  const editingSectionId = useReminderUIStore((state) => state.editingSectionId);
  const storeSetEditingItemId = useReminderUIStore((state) => state.setEditingItemId);
  const storeSetEditingSectionId = useReminderUIStore((state) => state.setEditingSectionId);
  const setAddingSectionId = useReminderUIStore((state) => state.setAddingSectionId);
  const resetEditState = useReminderUIStore((state) => state.resetEditState);
  const timePicker = useTimePickerState();

  const itemsById = useMemo(() => {
    const map = new Map<number, { time?: string; isAllDay: boolean }>();
    sections.forEach((section) => {
      section.items.forEach((item) => {
        map.set(item.id, { time: item.time, isAllDay: item.isAllDay });
      });
    });
    return map;
  }, [sections]);

  const setEditingItemId = (reminderId: number | null) => {
    if (reminderId === null) {
      storeSetEditingItemId(null);
      return;
    }

    const foundItem = itemsById.get(reminderId);

    if (foundItem) {
      timePicker.setInitialTime(foundItem.time, foundItem.isAllDay);
      storeSetEditingItemId(reminderId);
    }
  };

  const setEditingSectionId = (sectionId: string | null) => {
    storeSetEditingSectionId(sectionId);
  };

  const setAddingSection = (sectionId: string | null) => {
    timePicker.resetTimeState();
    setAddingSectionId(sectionId);
  };

  const clearEditState = () => {
    resetEditState();
  };

  return {
    editState: {
      addingSectionId,
      editingItemId,
      editingSectionId,
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

export type ReminderEditController = ReturnType<typeof useEditState>;
