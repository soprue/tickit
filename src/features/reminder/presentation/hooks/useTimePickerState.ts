import { useState } from 'react';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 타임 피커의 시간 계산, 팝오버 상태, AM/PM 변환 로직을 관리하는 커스텀 훅
 */
export const useTimePickerState = () => {
  const [state, setState] = useState({
    showTimePopover: false,
    selectedTime: undefined as Date | undefined,
    isAllDay: false,
    pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM',
    pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
    pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE,
  });

  const toggleTimePopover = (currentTime?: Date) => {
    const isOpening = !state.showTimePopover;

    if (isOpening) {
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      const timeDate = currentTime instanceof Date ? currentTime : (state.selectedTime ? new Date(state.selectedTime) : null);
      
      if (timeDate && !isNaN(timeDate.getTime()) && !state.isAllDay) {
        const h = timeDate.getHours();
        const m = timeDate.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour).padStart(2, '0');
        
        // 5분 단위 반올림 로직
        const roundedMinute = Math.round(m / 5) * 5;
        minute = String(roundedMinute >= 60 ? 55 : roundedMinute).padStart(2, '0');
      }

      setState(prev => ({ 
        ...prev,
        showTimePopover: true,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute
      }));
    } else {
      setState(prev => ({ ...prev, showTimePopover: false }));
    }
  };

  const updatePickerTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => {
    setState(prev => {
      const newState = { ...prev, [key]: value };
      
      // 입력값을 기반으로 실제 Date 객체 생성
      const date = new Date();
      let h = parseInt(newState.pickerHour);
      if (newState.pickerAMPM === 'PM' && h < 12) h += 12;
      if (newState.pickerAMPM === 'AM' && h === 12) h = 0;
      
      date.setHours(h, parseInt(newState.pickerMinute), 0, 0);

      return { 
        ...newState,
        selectedTime: date,
        isAllDay: false,
        showTimePopover: false
      };
    });
  };

  const setAllDay = () => {
    setState(prev => ({ 
      ...prev,
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    }));
  };

  const setInitialTime = (time: Date | undefined, isAllDay: boolean) => {
    let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
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

    setState(prev => ({
      ...prev,
      selectedTime: time,
      isAllDay,
      pickerAMPM: ampm,
      pickerHour: hour,
      pickerMinute: minute,
      showTimePopover: false
    }));
  };

  const resetTimeState = () => {
    setState(prev => ({
      ...prev,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM',
      pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
      pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE,
      showTimePopover: false
    }));
  };

  return {
    timeState: state,
    toggleTimePopover,
    updatePickerTime,
    setAllDay,
    setInitialTime,
    resetTimeState
  };
};
