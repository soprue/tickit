import { useReminderUIStore } from '@src/features/reminder/domain/ReminderUIStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { parseDateToPickerState, createDateFromPickerState } from '@src/shared/utils/date';

/**
 * 전역 UI 스토어와 공통 시간 유틸리티를 활용하여 타임 피커 상태를 관리하는 커스텀 훅
 */
export function useTimePickerState() {
  const showTimePopover = useReminderUIStore((state) => state.showTimePopover);
  const selectedTime = useReminderUIStore((state) => state.selectedTime);
  const isAllDay = useReminderUIStore((state) => state.isAllDay);
  const pickerAMPM = useReminderUIStore((state) => state.pickerAMPM);
  const pickerHour = useReminderUIStore((state) => state.pickerHour);
  const pickerMinute = useReminderUIStore((state) => state.pickerMinute);
  const setUIState = useReminderUIStore((state) => state.setUIState);
  const resetEditState = useReminderUIStore((state) => state.resetEditState);

  const toggleTimePopover = (currentTime?: Date) => {
    const state = useReminderUIStore.getState();
    const isOpening = !state.showTimePopover;

    if (isOpening) {
      const timeDate =
        currentTime instanceof Date
          ? currentTime
          : state.selectedTime
            ? new Date(state.selectedTime)
            : null;

      // 유틸리티를 활용한 선언적 상태 변환
      const pickerState =
        timeDate && !isNaN(timeDate.getTime()) && !state.isAllDay
          ? parseDateToPickerState(timeDate)
          : {
              ampm: REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM',
              hour: REMINDER_CONFIG.DEFAULT_HOUR,
              minute: REMINDER_CONFIG.DEFAULT_MINUTE,
            };

      setUIState({
        showTimePopover: true,
        pickerAMPM: pickerState.ampm,
        pickerHour: pickerState.hour,
        pickerMinute: pickerState.minute,
      });
    } else {
      setUIState({ showTimePopover: false });
    }
  };

  const updatePickerTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => {
    const state = useReminderUIStore.getState();

    // 입력값을 기반으로 실제 Date 객체 생성 (유틸리티 활용)
    const ampm = key === 'pickerAMPM' ? (value as 'AM' | 'PM') : state.pickerAMPM;
    const hour = key === 'pickerHour' ? value : state.pickerHour;
    const minute = key === 'pickerMinute' ? value : state.pickerMinute;

    const date = createDateFromPickerState(ampm, hour, minute);

    setUIState({
      [key]: value,
      selectedTime: date,
      isAllDay: false,
      showTimePopover: false,
    });
  };

  const setAllDay = () => {
    setUIState({
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false,
    });
  };

  const setInitialTime = (time: Date | string | undefined, isAllDay: boolean) => {
    const timeDate = time ? (time instanceof Date ? time : new Date(time)) : undefined;
    const isValidDate = timeDate && !isNaN(timeDate.getTime());

    const pickerState = isValidDate
      ? parseDateToPickerState(timeDate)
      : {
          ampm: REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM',
          hour: REMINDER_CONFIG.DEFAULT_HOUR,
          minute: REMINDER_CONFIG.DEFAULT_MINUTE,
        };

    setUIState({
      selectedTime: timeDate,
      isAllDay,
      pickerAMPM: pickerState.ampm,
      pickerHour: pickerState.hour,
      pickerMinute: pickerState.minute,
      showTimePopover: false,
    });
  };

  return {
    timeState: {
      showTimePopover,
      selectedTime,
      isAllDay,
      pickerAMPM,
      pickerHour,
      pickerMinute,
    },
    toggleTimePopover,
    updatePickerTime,
    setAllDay,
    setInitialTime,
    resetTimeState: resetEditState,
  };
}
