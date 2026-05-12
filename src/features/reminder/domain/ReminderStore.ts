import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ReminderSectionData, initialSections } from './reminder';
import { STORAGE_KEYS } from '@src/shared/constants';
import { reminderStorage } from '../infrastructure/reminderStorage';

interface ReminderState {
  sections: ReminderSectionData[];
  /** 마지막으로 밤 9시 알림을 보낸 날짜 (YYYY-MM-DD) */
  lastNightCheckDate: string | null;

  // Actions
  addSection: (title: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  deleteSection: (sectionId: string) => void;
  addReminder: (sectionId: string, text: string, time?: Date, isAllDay?: boolean) => void;
  toggleReminder: (sectionId: string, reminderId: number) => void;
  updateReminder: (
    sectionId: string,
    reminderId: number,
    text: string,
    time?: Date,
    isAllDay?: boolean
  ) => void;
  deleteReminder: (sectionId: string, reminderId: number) => void;
  markAsNotified: (sectionId: string, reminderId: number) => void;
  setLastNightCheckDate: (date: string) => void;
}

/**
 * 리마인더 할 일 목록과 섹션 데이터를 관리하는 메인 스토어.
 * immer 미들웨어를 사용하여 중첩된 객체의 불변성 업데이트 로직을 간소화했습니다.
 */
export const useReminderStore = create<ReminderState>()(
  persist(
    immer((set) => ({
      sections: initialSections,
      lastNightCheckDate: null,

      addSection: (title: string) =>
        set((state) => {
          state.sections.push({
            id: `SECTION_${Date.now()}`,
            title,
            isFixed: false,
            items: [],
          });
        }),

      updateSectionTitle: (sectionId: string, title: string) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (section) section.title = title;
        }),

      deleteSection: (sectionId: string) =>
        set((state) => {
          state.sections = state.sections.filter((s) => s.isFixed || s.id !== sectionId);
        }),

      addReminder: (sectionId: string, text: string, time?: Date, isAllDay: boolean = false) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (section) {
            section.items.push({
              id: Date.now(),
              text,
              time: time?.toISOString(),
              isAllDay,
              notified: false,
              done: false,
            });
          }
        }),

      toggleReminder: (sectionId: string, reminderId: number) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          const item = section?.items.find((it) => it.id === reminderId);
          if (item) item.done = !item.done;
        }),

      updateReminder: (
        sectionId: string,
        reminderId: number,
        text: string,
        time?: Date,
        isAllDay: boolean = false
      ) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          const item = section?.items.find((it) => it.id === reminderId);
          if (item) {
            item.text = text;
            item.time = time?.toISOString();
            item.isAllDay = isAllDay;
            item.notified = false;
          }
        }),

      deleteReminder: (sectionId: string, reminderId: number) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          if (section) {
            section.items = section.items.filter((item) => item.id !== reminderId);
          }
        }),

      markAsNotified: (sectionId: string, reminderId: number) =>
        set((state) => {
          const section = state.sections.find((s) => s.id === sectionId);
          const item = section?.items.find((it) => it.id === reminderId);
          if (item) item.notified = true;
        }),

      setLastNightCheckDate: (date: string) =>
        set((state) => {
          state.lastNightCheckDate = date;
        }),
    })),
    {
      name: STORAGE_KEYS.REMINDER,
      storage: createJSONStorage(() => reminderStorage),
      partialize: (state) => ({
        sections: state.sections,
        lastNightCheckDate: state.lastNightCheckDate,
      }),
    }
  )
);

// 컴포넌트 라이프사이클 밖(예: setInterval)에서 최신 상태가 필요한 경우를 위해 유지
export const reminderStore = {
  getState: () => useReminderStore.getState(),
  markAsNotified: (sectionId: string, reminderId: number) =>
    useReminderStore.getState().markAsNotified(sectionId, reminderId),
  setLastNightCheckDate: (date: string) => useReminderStore.getState().setLastNightCheckDate(date),
};
