import { StateStorage } from 'zustand/middleware';
import { Reminder, ReminderSectionData, initialSections } from '../domain/reminder';
import { ipc } from '@src/shared/utils/ipc';

/**
 * 불러온 데이터의 형식을 복원함 (날짜 객체 변환 및 유실된 필드 보구)
 */
const hydrateState = (data: any) => {
  if (!data) return { sections: initialSections, lastNightCheckDate: null };

  const sections = (data.sections || initialSections).map((section: ReminderSectionData) => ({
    ...section,
    items: (section.items || []).map((item: Reminder) => {
      let hydratedTime: Date | undefined = undefined;
      if (item.time) {
        const date = new Date(item.time);
        if (!isNaN(date.getTime())) hydratedTime = date;
      }
      return {
        ...item,
        time: hydratedTime,
        isAllDay: item.isAllDay ?? item.time === 'All Day',
        notified: item.notified ?? false,
        done: item.done ?? false,
      };
    }),
  }));

  return {
    sections,
    lastNightCheckDate: data.lastNightCheckDate || null,
  };
};

/**
 * Electron IPC 기반 리마인더 전용 커스텀 스토리지
 */
export const reminderStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await ipc.invoke<any>('reminder:get-all', name);
      if (data) {
        const hydrated = hydrateState(data);
        return JSON.stringify({ state: hydrated });
      }
      return null;
    } catch (e) {
      console.error('Failed to load reminder data:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      // data.state에는 sections와 lastNightCheckDate가 포함되어 있음
      await ipc.invoke('reminder:save', {
        key: name,
        data: data.state,
      });
    } catch (e) {
      console.error('Failed to save reminder data:', e);
      throw e;
    }
  },
  removeItem: (name: string) => {},
};
