import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  updateReminder: (sectionId: string, reminderId: number, text: string, time?: Date, isAllDay?: boolean) => void;
  deleteReminder: (sectionId: string, reminderId: number) => void;
  markAsNotified: (sectionId: string, reminderId: number) => void;
  setLastNightCheckDate: (date: string) => void;
}

/**
 * 리마인더 할 일 목록과 섹션 데이터를 관리하는 메인 스토어
 */
export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      sections: initialSections,
      lastNightCheckDate: null,

      addSection: (title: string) => set((state) => ({
        sections: [...state.sections, {
          id: `SECTION_${Date.now()}`,
          title,
          isFixed: false,
          items: [],
        }]
      })),

      updateSectionTitle: (sectionId: string, title: string) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? { ...s, title } : s)
      })),

      deleteSection: (sectionId: string) => set((state) => ({
        sections: state.sections.filter(s => s.isFixed || s.id !== sectionId)
      })),

      addReminder: (sectionId: string, text: string, time?: Date, isAllDay: boolean = false) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? {
          ...s,
          items: [...s.items, { 
            id: Date.now(), 
            text, 
            time: time?.toISOString(),
            isAllDay, 
            notified: false, 
            done: false 
          }]
        } : s)
      })),

      toggleReminder: (sectionId: string, reminderId: number) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? {
          ...s,
          items: s.items.map(item => item.id === reminderId ? { ...item, done: !item.done } : item)
        } : s)
      })),

      updateReminder: (sectionId: string, reminderId: number, text: string, time?: Date, isAllDay: boolean = false) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? {
          ...s,
          items: s.items.map(item => item.id === reminderId ? { 
            ...item, 
            text, 
            time: time?.toISOString(),
            isAllDay, 
            notified: false 
          } : item)
        } : s)
      })),

      deleteReminder: (sectionId: string, reminderId: number) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? {
          ...s,
          items: s.items.filter(item => item.id !== reminderId)
        } : s)
      })),

      markAsNotified: (sectionId: string, reminderId: number) => set((state) => ({
        sections: state.sections.map(s => s.id === sectionId ? {
          ...s,
          items: s.items.map(item => item.id === reminderId ? { ...item, notified: true } : item)
        } : s)
      })),

      setLastNightCheckDate: (date: string) => set({ lastNightCheckDate: date }),
    }),
    {
      name: STORAGE_KEYS.REMINDER,
      storage: createJSONStorage(() => reminderStorage),
      // partialize 시 sections와 lastNightCheckDate 모두 저장
      partialize: (state) => ({ 
        sections: state.sections,
        lastNightCheckDate: state.lastNightCheckDate
      }),
    }
  )
);

// 컴포넌트 라이프사이클 밖(예: setInterval)에서 최신 상태가 필요한 경우를 위해 유지
export const reminderStore = {
  getState: () => useReminderStore.getState(),
  markAsNotified: (sectionId: string, reminderId: number) => useReminderStore.getState().markAsNotified(sectionId, reminderId),
  setLastNightCheckDate: (date: string) => useReminderStore.getState().setLastNightCheckDate(date),
};
