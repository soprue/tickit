import { StateStorage } from 'zustand/middleware';
import { Reminder, ReminderSectionData, initialSections } from '../domain/reminder';
import { ipc } from '@src/shared/utils/ipc';

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
 * Electron IPC 기반 리마인더 전용 커스텀 스토리지
 */
export const reminderStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await ipc.invoke<{ sections: ReminderSectionData[] }>('reminder:get-all', name);
      if (data) {
        const hydratedSections = hydrateReminders(data);
        return JSON.stringify({ state: { sections: hydratedSections } });
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      await ipc.invoke('reminder:save', {
        key: name,
        data: data.state
      });
    } catch (e) {
      throw e;
    }
  },
  removeItem: (name: string) => {},
};
