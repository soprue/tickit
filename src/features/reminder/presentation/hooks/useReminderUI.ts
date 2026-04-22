import { useState } from 'react';
import { useReminderStore, reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 리마인더 페이지의 UI 상태(편집 모드, 타임 피커 등) 및 CRUD 액션을 관리하는 커스텀 훅
 */
export const useReminderUI = () => {
  const { sections } = useReminderStore();
  
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

  /* -------------------------------------------------------------------------- */
  /* 상태 제어 (UI State)                                                        */
  /* -------------------------------------------------------------------------- */

  const setEditingItemId = (reminderId: number | null) => {
    if (reminderId === null) {
      setState(prev => ({ ...prev, editingItemId: null }));
      return;
    }

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

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션                                                                   */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    reminderStore.addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      reminderStore.updateSectionTitle(sectionId, title);
    }
    setState(prev => ({ ...prev, editingSectionId: null }));
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('이 섹션을 삭제하시겠습니까?')) {
      reminderStore.deleteSection(sectionId);
    }
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    reminderStore.toggleReminder(sectionId, reminderId);
  };

  const deleteReminder = (sectionId: string, reminderId: number) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      reminderStore.deleteReminder(sectionId, reminderId);
    }
  };

  const updateReminder = (sectionId: string, reminderId: number, text: string) => {
    const { editingItemId, selectedTime, isAllDay } = state;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, selectedTime, isAllDay);
    }
    setState(prev => ({ ...prev, editingItemId: null }));
  };

  const addReminder = (sectionId: string, text: string) => {
    const { addingSectionId, selectedTime, isAllDay } = state;
    if (addingSectionId !== sectionId) return;

    if (!text.trim()) return;

    reminderStore.addReminder(sectionId, text, selectedTime, isAllDay);
    setAddingSection(null);
  };

  const updatePickerTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => {
    const newState = { ...state, [key]: value };
    
    // Date 객체 생성 (오늘 날짜 기준)
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

  /* -------------------------------------------------------------------------- */
  /* 기타 액션                                                                    */
  /* -------------------------------------------------------------------------- */

  const logout = () => {
    authStore.logout();
    window.location.hash = '#/login';
  };

  return {
    state,
    setState,
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    toggleTimePopover,
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
    updatePickerTime,
    setAllDay,
    logout
  };
};
