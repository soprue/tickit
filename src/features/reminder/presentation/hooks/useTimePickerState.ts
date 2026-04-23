import { useReminderUIStore } from '@src/features/reminder/domain/ReminderUIStore';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 전역 UI 스토어를 활용하여 타임 피커 상태를 관리하는 커스텀 훅
 */
export const useTimePickerState = () => {
  const state = useReminderUIStore();

  const toggleTimePopover = (currentTime?: Date) => {
    const isOpening = !state.showTimePopover;

    if (isOpening) {
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM';
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      const timeDate = currentTime instanceof Date ? currentTime : (state.selectedTime ? new Date(state.selectedTime) : null);
      
      if (timeDate && !isNaN(timeDate.getTime()) && !state.isAllDay) {
        const h = timeDate.getHours();
        const m = timeDate.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour).padStart(2, '0');
        
        const roundedMinute = Math.round(m / 5) * 5;
        minute = String(roundedMinute >= 60 ? 55 : roundedMinute).padStart(2, '0');
      }

      state.setUIState({ 
        showTimePopover: true,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute
      });
    } else {
      state.setUIState({ showTimePopover: false });
    }
  };

  const updatePickerTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => {
    // 입력값을 기반으로 실제 Date 객체 생성
    const date = new Date();
    let h = parseInt(key === 'pickerHour' ? value : state.pickerHour);
    const ampm = key === 'pickerAMPM' ? value : state.pickerAMPM;
    const minute = key === 'pickerMinute' ? value : state.pickerMinute;

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    date.setHours(h, parseInt(minute), 0, 0);

    state.setUIState({ 
      [key]: value,
      selectedTime: date,
      isAllDay: false,
      showTimePopover: false
    });
  };

  const setAllDay = () => {
    state.setUIState({ 
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    });
  };

  const setInitialTime = (time: Date | undefined, isAllDay: boolean) => {
    let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM';
    let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
    let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

    if (time instanceof Date) {
      const h = time.getHours();
      const m = time.getMinutes();
      ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      hour = String(displayHour);
      minute = String(m).padStart(2, '0');
    }

    state.setUIState({
      selectedTime: time,
      isAllDay,
      pickerAMPM: ampm,
      pickerHour: hour,
      pickerMinute: minute,
      showTimePopover: false
    });
  };

  return {
    timeState: {
      showTimePopover: state.showTimePopover,
      selectedTime: state.selectedTime,
      isAllDay: state.isAllDay,
      pickerAMPM: state.pickerAMPM,
      pickerHour: state.pickerHour,
      pickerMinute: state.pickerMinute,
    },
    toggleTimePopover,
    updatePickerTime,
    setAllDay,
    setInitialTime,
    resetTimeState: state.resetEditState
  };
};
