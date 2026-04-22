import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { ReminderSectionData } from './reminder';
import { STORAGE_KEYS, Category } from '@src/shared/constants';

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

const today = new Date();
const initialSections: ReminderSectionData[] = [
  { id: Category.EVERYDAY, title: 'Everyday', isFixed: true, items: [
    { id: 1, text: '약 먹기', time: new Date(new Date(today).setHours(14, 0, 0, 0)), isAllDay: false, notified: true, done: true },
    { id: 2, text: '알고리즘 문제 풀기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
    { id: 3, text: '산책하기', time: new Date(new Date(today).setHours(23, 0, 0, 0)), isAllDay: false, notified: false, done: true },
  ]},
  { id: Category.TODO, title: 'To Do', isFixed: true, items: [
    { id: 4, text: '책 반납하기', isAllDay: true, notified: false, done: false },
    { id: 5, text: '편의점 택배 보내고 오기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
  ]},
  { id: Category.WORK, title: 'Work', isFixed: false, items: [] },
];

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

const electronStorage: StateStorage = {
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
      storage: createJSONStorage(() => electronStorage),
      partialize: (state) => ({ sections: state.sections }),
    }
  )
);

// 하위 호환성을 위해 reminderStore 객체 유지
export const reminderStore = {
  getState: () => useReminderStore.getState(),
  subscribe: (listener: (state: any) => void) => useReminderStore.subscribe(listener),
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
