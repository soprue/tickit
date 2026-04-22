import { StateStorage } from 'zustand/middleware';
import { ReminderSectionData, initialSections } from '../domain/reminder';
import { useSaveStatusStore } from '../domain/ReminderStore';

/**
 * 불러온 데이터의 날짜 형식을 복원함
 */
const hydrateReminders = (data: any): ReminderSectionData[] => {
  if (!data || !data.sections) return initialSections;

  return data.sections.map((section: any) => ({
    ...section,
    items: section.items.map((item: any) => {
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
    if (typeof window === 'undefined' || !(window as any).api) return null;
    try {
      const data = await (window as any).api.invoke('reminder:get-all', name);
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
    if (typeof window === 'undefined' || !(window as any).api) return;
    try {
      const data = JSON.parse(value);
      // useSaveStatusStore를 사용하여 루프를 방지함
      useSaveStatusStore.getState().setIsSaving(true);
      await (window as any).api.invoke('reminder:save', {
        key: name,
        data: data.state
      });
      setTimeout(() => useSaveStatusStore.getState().setIsSaving(false), 500);
    } catch (e) {
      console.error(`[ReminderStore] Save error:`, e);
      useSaveStatusStore.getState().setIsSaving(false);
    }
  },
  removeItem: (name: string) => {},
};
