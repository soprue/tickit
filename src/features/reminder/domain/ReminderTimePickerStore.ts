import { create } from 'zustand';
import { REMINDER_CONFIG } from '@src/shared/constants';

interface ReminderTimePickerFields {
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerAMPM: 'AM' | 'PM';
  pickerHour: string;
  pickerMinute: string;
}

interface ReminderTimePickerState extends ReminderTimePickerFields {
  setTimePickerState: (state: Partial<ReminderTimePickerFields>) => void;
  resetTimePickerState: () => void;
}

export const useReminderTimePickerStore = create<ReminderTimePickerState>((set) => ({
  showTimePopover: false,
  selectedTime: undefined,
  isAllDay: false,
  pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM,
  pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
  pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE,
  setTimePickerState: (newState) => set((state) => ({ ...state, ...newState })),
  resetTimePickerState: () =>
    set({
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM,
      pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
      pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE,
    }),
}));
