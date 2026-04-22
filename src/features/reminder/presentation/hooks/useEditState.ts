import { useState } from 'react';
import { useReminderStore } from '@src/features/reminder/domain/ReminderStore';
import { useTimePickerState } from './useTimePickerState';

/**
 * 리마인더 편집/추가 관련 아이디 상태를 관리하는 커스텀 훅.
 * 시간 관련 복잡한 로직은 useTimePickerState에 위임합니다.
 */
export const useEditState = () => {
  const [ids, setIds] = useState({
    addingSectionId: null as string | null,
    editingItemId: null as number | null,
    editingSectionId: null as string | null,
  });

  // 스토어에서 데이터 가져오기 (훅 방식)
  const sections = useReminderStore(state => state.sections);
  const timePicker = useTimePickerState();

  const setEditingItemId = (reminderId: number | null) => {
    if (reminderId === null) {
      setIds(prev => ({ ...prev, editingItemId: null }));
      return;
    }

    const foundItem = sections.flatMap(s => s.items).find(it => it.id === reminderId);

    if (foundItem) {
      // 시간 상태 초기화는 전용 훅에 위임
      timePicker.setInitialTime(foundItem.time, foundItem.isAllDay);

      setIds({ 
        editingItemId: reminderId,
        addingSectionId: null,
        editingSectionId: null,
      });
    }
  };

  const setEditingSectionId = (sectionId: string | null) => {
    setIds({ 
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    });
  };

  const setAddingSection = (sectionId: string | null) => {
    // 추가 모드 진입 시 시간 상태 리셋
    timePicker.resetTimeState();

    setIds({ 
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
    });
  };

  const clearEditState = () => {
    setIds({
      addingSectionId: null,
      editingItemId: null,
      editingSectionId: null
    });
    timePicker.resetTimeState();
  };

  return {
    editState: {
      ...ids,
      ...timePicker.timeState
    },
    setEditingItemId,
    setEditingSectionId,
    setAddingSection,
    toggleTimePopover: timePicker.toggleTimePopover,
    updatePickerTime: timePicker.updatePickerTime,
    setAllDay: timePicker.setAllDay,
    clearEditState
  };
};
