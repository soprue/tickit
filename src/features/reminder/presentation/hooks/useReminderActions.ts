import { useModalStore } from '@src/shared/domain/ModalStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useSyncStatus } from '@src/shared/context/SyncStatusContext';
import { useReminderEditStore } from '@src/features/reminder/domain/ReminderEditStore';
import type { Reminder } from '@src/features/reminder/domain/reminder';
import { useReminderMutations } from './useReminderMutations';
import { useTimePickerState } from './useTimePickerState';

export function useReminderActions() {
  const { showConfirm } = useModalStore((state) => state.actions);
  const { runSyncAction } = useSyncStatus();
  const addingSectionId = useReminderEditStore((state) => state.addingSectionId);
  const editingItemId = useReminderEditStore((state) => state.editingItemId);
  const setAddingSectionId = useReminderEditStore((state) => state.setAddingSectionId);
  const setEditingItemId = useReminderEditStore((state) => state.setEditingItemId);
  const setEditingSectionId = useReminderEditStore((state) => state.setEditingSectionId);
  const resetEditState = useReminderEditStore((state) => state.resetEditState);
  const timePicker = useTimePickerState();
  const mutations = useReminderMutations();

  const clearEditState = () => {
    resetEditState();
    timePicker.resetTimeState();
  };

  const setAddingSection = (sectionId: string | null) => {
    timePicker.resetTimeState();
    setAddingSectionId(sectionId);
  };

  const startEditingReminder = (reminder: Reminder) => {
    timePicker.setInitialTime(reminder.time, reminder.isAllDay);
    setEditingItemId(reminder.id);
  };

  const addSection = () => {
    runSyncAction(async () => {
      await mutations.createSection.mutateAsync({
        data: { title: REMINDER_CONFIG.NEW_SECTION_TITLE },
      });
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      runSyncAction(async () => {
        await mutations.updateSection.mutateAsync({ id: sectionId, data: { title } });
      });
    }
    clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    showConfirm({
      title: '섹션 삭제',
      message: '이 섹션을 삭제하시겠습니까? 섹션 내 모든 리마인더가 삭제됩니다.',
      onConfirm: () => {
        runSyncAction(async () => {
          await mutations.removeSection.mutateAsync({ id: sectionId });
        });
      },
    });
  };

  const toggleReminder = (reminder: Reminder) => {
    runSyncAction(async () => {
      await mutations.updateReminder.mutateAsync({
        id: reminder.id,
        data: { done: !reminder.done },
      });
    });
  };

  const deleteReminder = (reminderId: number) => {
    showConfirm({
      title: '리마인더 삭제',
      message: '이 항목을 삭제하시겠습니까?',
      onConfirm: () => {
        runSyncAction(async () => {
          await mutations.removeReminder.mutateAsync({ id: reminderId });
        });
      },
    });
  };

  const updateReminder = (reminder: Reminder, text: string) => {
    const { selectedTime, isAllDay } = timePicker.timeState;
    if (editingItemId !== reminder.id) return;

    if (text.trim()) {
      const finalIsAllDay = selectedTime ? isAllDay : true;
      const timeString = selectedTime?.toISOString();

      const hasTextChanged = reminder.text !== text;
      const hasTimeChanged = reminder.time !== timeString;
      const hasAllDayChanged = reminder.isAllDay !== finalIsAllDay;

      if (hasTextChanged || hasTimeChanged || hasAllDayChanged) {
        runSyncAction(async () => {
          await mutations.updateReminder.mutateAsync({
            id: reminder.id,
            data: {
              text,
              time: timeString,
              isAllDay: finalIsAllDay,
            },
          });
        });
      }
    }
    clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { selectedTime, isAllDay } = timePicker.timeState;
    if (addingSectionId !== sectionId) return;
    if (!text.trim()) return;

    const finalIsAllDay = selectedTime ? isAllDay : true;

    runSyncAction(async () => {
      await mutations.createReminder.mutateAsync({
        data: {
          sectionId,
          text,
          time: selectedTime?.toISOString(),
          isAllDay: finalIsAllDay,
        },
      });
    });
    setAddingSection(null);
  };

  return {
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    startEditingReminder,
    toggleTimePopover: timePicker.toggleTimePopover,
    updatePickerTime: timePicker.updatePickerTime,
    setAllDay: timePicker.setAllDay,
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
  };
}
