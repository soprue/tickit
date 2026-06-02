import { useReminderEditStore } from '../../domain/ReminderEditStore';
import { useReminderTimePickerStore } from '../../domain/ReminderTimePickerStore';

export function useIsReminderEditing(reminderId: number) {
  return useReminderEditStore((state) => state.editingItemId === reminderId);
}

export function useIsSectionTitleEditing(sectionId: string) {
  return useReminderEditStore((state) => state.editingSectionId === sectionId);
}

export function useIsAddingReminder(sectionId: string) {
  return useReminderEditStore((state) => state.addingSectionId === sectionId);
}

export function useReminderTimePickerViewState() {
  const selectedTime = useReminderTimePickerStore((state) => state.selectedTime);
  const isAllDay = useReminderTimePickerStore((state) => state.isAllDay);
  const showTimePopover = useReminderTimePickerStore((state) => state.showTimePopover);
  const pickerAMPM = useReminderTimePickerStore((state) => state.pickerAMPM);
  const pickerHour = useReminderTimePickerStore((state) => state.pickerHour);
  const pickerMinute = useReminderTimePickerStore((state) => state.pickerMinute);

  return {
    selectedTime,
    isAllDay,
    showTimePopover,
    pickerState: {
      ampm: pickerAMPM,
      hour: pickerHour,
      minute: pickerMinute,
    },
  };
}
