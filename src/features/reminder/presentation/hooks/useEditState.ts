import { useState } from 'react';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 리마인더 편집/추가 관련 UI 상태를 관리하는 커스텀 훅
 */
export const useEditState = () => {
  const [state, setState] = useState({
    addingSectionId: null as string | null,
    editingItemId: null as number | null,
    editingSectionId: null as string | null,
    showTimePopover: false,
    selectedTime: undefined as Date | undefined,
    isAllDay: false,
    pickerAMPM: 'AM' as 'AM' | 'PM',
    pickerHour: '09',
    pickerMinute: '00',
  });

  const setEditingItemId = (reminderId: number | null) => {
    if (reminderId === null) {
      setState(prev => ({ ...prev, editingItemId: null }));
      return;
    }

    const { sections } = reminderStore.getState();
    const foundItem = sections.flatMap(s => s.items).find(it => it.id === reminderId);

    if (foundItem) {
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      if (foundItem.time instanceof Date) {
        const h = foundItem.time.getHours();
        const m = foundItem.time.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour);
        minute = String(m).padStart(2, '0');
      }

      setState(prev => ({ 
        ...prev,
        editingItemId: reminderId,
        addingSectionId: null,
        editingSectionId: null,
        selectedTime: foundItem.time,
        isAllDay: foundItem.isAllDay,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute,
        showTimePopover: false
      }));
    }
  };

  const setEditingSectionId = (sectionId: string | null) => {
    setState(prev => ({ 
      ...prev,
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    }));
  };

  const setAddingSection = (sectionId: string | null) => {
    setState(prev => ({ 
      ...prev,
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM,
      pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
      pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE
    }));
  };

  const toggleTimePopover = () => {
    const isOpening = !state.showTimePopover;

    if (isOpening) {
      const { selectedTime, isAllDay } = state;
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      const timeDate = selectedTime instanceof Date ? selectedTime : (selectedTime ? new Date(selectedTime) : null);
      
      if (timeDate && !isNaN(timeDate.getTime()) && !isAllDay) {
        const h = timeDate.getHours();
        const m = timeDate.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour).padStart(2, '0');
        minute = String(m).padStart(2, '0');
        
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
    const newState = { ...state, [key]: value };
    
    const date = new Date();
    let h = parseInt(newState.pickerHour);
    if (newState.pickerAMPM === 'PM' && h < 12) h += 12;
    if (newState.pickerAMPM === 'AM' && h === 12) h = 0;
    
    date.setHours(h, parseInt(newState.pickerMinute), 0, 0);

    setState(prev => ({ 
      ...prev,
      [key]: value,
      selectedTime: date,
      isAllDay: false,
      showTimePopover: false
    }));
  };

  const setAllDay = () => {
    setState(prev => ({ 
      ...prev,
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    }));
  };

  const clearEditState = () => {
    setState(prev => ({
      ...prev,
      addingSectionId: null,
      editingItemId: null,
      editingSectionId: null
    }));
  };

  return {
    editState: state,
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    toggleTimePopover,
    updatePickerTime,
    setAllDay,
    clearEditState
  };
};
