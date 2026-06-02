import { useMemo } from 'react';
import { useReminderEditStore } from '@src/features/reminder/domain/ReminderEditStore';
import { useTimePickerState } from './useTimePickerState';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

/**
 * 리마인더 편집/추가 관련 아이디 상태를 관리하는 커스텀 훅.
 */
export function useEditState(sections: ReminderSectionData[]) {
  const addingSectionId = useReminderEditStore((state) => state.addingSectionId);
  const editingItemId = useReminderEditStore((state) => state.editingItemId);
  const editingSectionId = useReminderEditStore((state) => state.editingSectionId);
  const storeSetEditingItemId = useReminderEditStore((state) => state.setEditingItemId);
  const storeSetEditingSectionId = useReminderEditStore((state) => state.setEditingSectionId);
  const setAddingSectionId = useReminderEditStore((state) => state.setAddingSectionId);
  const resetEditState = useReminderEditStore((state) => state.resetEditState);
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
    timePicker.resetTimeState();
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
