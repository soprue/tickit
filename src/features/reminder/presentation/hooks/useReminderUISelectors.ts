import { useReminderUIStore } from '../../domain/ReminderUIStore';

export function useIsReminderEditing(reminderId: number) {
  return useReminderUIStore((state) => state.editingItemId === reminderId);
}

export function useIsSectionTitleEditing(sectionId: string) {
  return useReminderUIStore((state) => state.editingSectionId === sectionId);
}

export function useIsAddingReminder(sectionId: string) {
  return useReminderUIStore((state) => state.addingSectionId === sectionId);
}

export function useReminderTimePickerViewState() {
  const selectedTime = useReminderUIStore((state) => state.selectedTime);
  const isAllDay = useReminderUIStore((state) => state.isAllDay);
  const showTimePopover = useReminderUIStore((state) => state.showTimePopover);
  const pickerAMPM = useReminderUIStore((state) => state.pickerAMPM);
  const pickerHour = useReminderUIStore((state) => state.pickerHour);
  const pickerMinute = useReminderUIStore((state) => state.pickerMinute);

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
