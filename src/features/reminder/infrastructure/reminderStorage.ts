import { StateStorage } from 'zustand/middleware';
import { Reminder, ReminderSectionData, initialSections } from '../domain/reminder';

/**
 * 불러온 데이터의 날짜 형식을 복원함
 */
const hydrateReminders = (data: { sections: ReminderSectionData[] } | null): ReminderSectionData[] => {
  if (!data || !data.sections) return initialSections;

  return data.sections.map((section: ReminderSectionData) => ({
    ...section,
    items: section.items.map((item: Reminder) => {
      let hydratedTime: Date | undefined = undefined;
      if (item.time) {
        const date = new Date(item.time);
        if (!isNaN(date.getTime())) hydratedTime = date;
      }
      return {
        ...item,
        time: hydratedTime,
        isAllDay: item.isAllDay ?? (item.time === 'All Day'),
        notified: item.notified ?? false,
        done: item.done ?? false
      };
    })
  }));
};

/**
 * Electron IPC 기반 리마인더 전용 커스텀 스토리지.
 * React 19 Action과의 연동을 위해 수동 상태 제어를 제거하고 순수 비동기 함수로 유지합니다.
 */
export const reminderStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.api) return null;
    try {
      const data = await window.api.invoke('reminder:get-all', name);
      if (data) {
        const hydratedSections = hydrateReminders(data);
        return JSON.stringify({ state: { sections: hydratedSections } });
      }
      return null;
    } catch (e) {
      console.error(`[ReminderStore] Load error:`, e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || !window.api) return;
    try {
      const data = JSON.parse(value);
      // 실제 IPC 통신 (비동기)
      await window.api.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      console.error(`[ReminderStore] Save error:`, e);
      throw e; // 에러를 상위(Action)로 전파
    }
  },
  removeItem: (name: string) => {},
};
