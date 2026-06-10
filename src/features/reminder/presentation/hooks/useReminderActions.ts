import { useModalStore } from '@src/shared/domain/ModalStore';
import { useNetworkStatusStore } from '@src/shared/domain/NetworkStatusStore';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useSyncStatus } from '@src/shared/context/SyncStatusContext';
import { useReminderEditStore } from '@src/features/reminder/domain/ReminderEditStore';
import type { Reminder } from '@src/features/reminder/domain/reminder';
import { useReminderMutations } from './useReminderMutations';
import { useTimePickerState } from './useTimePickerState';

export function useReminderActions() {
  const { showConfirm } = useModalStore((state) => state.actions);
  const networkStatus = useNetworkStatusStore((state) => state.status);
  const { showToast } = useToastStore((state) => state.actions);
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

  const ensureOnline = () => {
    if (networkStatus === 'online') {
      return true;
    }

    showToast(
      networkStatus === 'offline'
        ? '인터넷 연결 후 다시 시도해 주세요.'
        : '서버 연결이 복구된 뒤 다시 시도해 주세요.',
      'error'
    );

    return false;
  };

  const runOnlineSyncAction = (action: () => Promise<void>) => {
    if (!ensureOnline()) {
      return false;
    }

    runSyncAction(action);
    return true;
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
    runOnlineSyncAction(async () => {
      await mutations.createSection.mutateAsync({
        data: { title: REMINDER_CONFIG.NEW_SECTION_TITLE },
      });
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      const didStart = runOnlineSyncAction(async () => {
        await mutations.updateSection.mutateAsync({ id: sectionId, data: { title } });
      });

      if (!didStart) {
        return;
      }
    }
    clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    if (!ensureOnline()) {
      return;
    }

    showConfirm({
      title: '섹션 삭제',
      message: '이 섹션을 삭제하시겠습니까? 섹션 내 모든 리마인더가 삭제됩니다.',
      onConfirm: () => {
        runOnlineSyncAction(async () => {
          await mutations.removeSection.mutateAsync({ id: sectionId });
        });
      },
    });
  };

  const toggleReminder = (reminder: Reminder) => {
    runOnlineSyncAction(async () => {
      await mutations.updateReminder.mutateAsync({
        id: reminder.id,
        data: { done: !reminder.done },
      });
    });
  };

  const deleteReminder = (reminderId: number) => {
    if (!ensureOnline()) {
      return;
    }

    showConfirm({
      title: '리마인더 삭제',
      message: '이 항목을 삭제하시겠습니까?',
      onConfirm: () => {
        runOnlineSyncAction(async () => {
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
      const shouldResetNotification = hasTimeChanged || hasAllDayChanged;

      if (hasTextChanged || hasTimeChanged || hasAllDayChanged) {
        const didStart = runOnlineSyncAction(async () => {
          await mutations.updateReminder.mutateAsync({
            id: reminder.id,
            data: {
              text,
              time: timeString,
              isAllDay: finalIsAllDay,
              ...(shouldResetNotification ? { notified: false } : {}),
            },
          });
        });

        if (!didStart) {
          return;
        }
      }
    }
    clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { selectedTime, isAllDay } = timePicker.timeState;
    if (addingSectionId !== sectionId) return;
    if (!text.trim()) return;

    const finalIsAllDay = selectedTime ? isAllDay : true;

    const didStart = runOnlineSyncAction(async () => {
      await mutations.createReminder.mutateAsync({
        data: {
          sectionId,
          text,
          time: selectedTime?.toISOString(),
          isAllDay: finalIsAllDay,
        },
      });
    });
    if (!didStart) {
      return;
    }

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
