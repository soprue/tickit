import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReminderSectionData, initialSections } from './reminder';
import { STORAGE_KEYS } from '@src/shared/constants';
import { reminderStorage } from '../infrastructure/reminderStorage';

// UI 전용 저장 상태 스토어 (영속성 저장 안 함)
interface SaveStatusState {
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
}

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  isSaving: false,
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
}));

interface ReminderState {
  sections: ReminderSectionData[];
  
  // Actions
  addSection: (title: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  deleteSection: (sectionId: string) => void;
  addReminder: (sectionId: string, text: string, time?: Date, isAllDay?: boolean) => void;
  toggleReminder: (sectionId: string, reminderId: number) => void;
  updateReminder: (sectionId: string, reminderId: number, text: string, time?: Date, isAllDay?: boolean) => void;
  deleteReminder: (sectionId: string, reminderId: number) => void;
  markAsNotified: (sectionId: string, reminderId: number) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      sections: initialSections,

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
          items: [...s.items, { id: Date.now(), text, time, isAllDay, notified: false, done: false }]
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
          items: s.items.map(item => item.id === reminderId ? { ...item, text, time, isAllDay, notified: false } : item)
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
    }),
    {
      name: STORAGE_KEYS.REMINDER,
      storage: createJSONStorage(() => reminderStorage),
      partialize: (state) => ({ sections: state.sections }),
    }
  )
);

// 하위 호환성을 위해 reminderStore 객체 유지
export const reminderStore = {
  getState: () => useReminderStore.getState(),
  subscribe: (listener: (state: ReminderState) => void) => useReminderStore.subscribe(listener),
  get isSaving() { return useSaveStatusStore.getState().isSaving; },
  addSection: (title: string) => useReminderStore.getState().addSection(title),
  updateSectionTitle: (sectionId: string, title: string) => useReminderStore.getState().updateSectionTitle(sectionId, title),
  deleteSection: (sectionId: string) => useReminderStore.getState().deleteSection(sectionId),
  addReminder: (sectionId: string, text: string, time?: Date, isAllDay: boolean = false) => useReminderStore.getState().addReminder(sectionId, text, time, isAllDay),
  toggleReminder: (sectionId: string, reminderId: number) => useReminderStore.getState().toggleReminder(sectionId, reminderId),
  updateReminder: (sectionId: string, reminderId: number, text: string, time?: Date, isAllDay: boolean = false) => useReminderStore.getState().updateReminder(sectionId, reminderId, text, time, isAllDay),
  deleteReminder: (sectionId: string, reminderId: number) => useReminderStore.getState().deleteReminder(sectionId, reminderId),
  markAsNotified: (sectionId: string, reminderId: number) => useReminderStore.getState().markAsNotified(sectionId, reminderId),
};
