import { StateStorage } from 'zustand/middleware';
import type { Reminder, ReminderSectionData } from '../domain/reminder';
import { initialSections } from '../domain/reminder';
import { ipc } from '@src/shared/utils/ipc';
import { IPC_CHANNELS } from '@src/shared/constants';

interface PersistedData {
  sections: ReminderSectionData[];
  lastNightCheckDate: string | null;
}

/**
 * 불러온 데이터의 형식을 복원함 (날짜 객체 변환 및 유실된 필드 복구)
 */
const hydrateState = (data: unknown): PersistedData => {
  if (!data || typeof data !== 'object') {
    return { sections: initialSections, lastNightCheckDate: null };
  }

  const d = data as Partial<PersistedData>;

  const sections = (d.sections || initialSections).map((section: ReminderSectionData) => ({
    ...section,
    items: (section.items || []).map((item: Reminder) => {
      let hydratedTime: string | undefined = undefined;
      // Note: domain의 Reminder 인터페이스는 time이 string (ISO)임. 
      // 여기서 Date 객체로 변환하면 Store 타입과 충돌할 수 있음.
      // initialSections에서는 ISO String을 사용하고 있으므로 string으로 유지하거나 
      // Store의 hydrate 로직을 점검해야 함.
      // 기존 로직은 Date 객체로 변환하고 있었으나, 인터페이스는 string임.
      // 여기서는 런타임 안정성을 위해 string 형식을 보장함.
      if (item.time) {
        const date = new Date(item.time);
        if (!isNaN(date.getTime())) hydratedTime = date.toISOString();
      }
      
      return {
        ...item,
        time: hydratedTime,
        isAllDay: item.isAllDay ?? false,
        notified: item.notified ?? false,
        done: item.done ?? false,
      };
    }),
  }));

  return {
    sections,
    lastNightCheckDate: d.lastNightCheckDate || null,
  };
};

/**
 * Electron IPC 기반 리마인더 전용 커스텀 스토리지
 */
export const reminderStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await ipc.invoke(IPC_CHANNELS.GET_ALL, name);
      if (data) {
        const hydrated = hydrateState(data);
        return JSON.stringify({ state: hydrated });
      }
      return null;
    } catch (e) {
      console.error('[Infrastructure] Failed to load reminder data:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value);
      // data.state에는 sections와 lastNightCheckDate가 포함되어 있음
      await ipc.invoke(IPC_CHANNELS.SAVE, {
        key: name,
        data: data.state,
      });
    } catch (e) {
      console.error('[Infrastructure] Failed to save reminder data:', e);
      throw e;
    }
  },
  removeItem: (name: string) => {},
};
