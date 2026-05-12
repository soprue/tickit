import { create } from 'zustand';
import { REMINDER_CONFIG } from '@src/shared/constants';

export type FilterMode = 'all' | 'pending' | 'completed';

interface ReminderUIState {
  // 검색 및 필터 상태
  searchQuery: string;
  filterMode: FilterMode;

  // 편집 및 추가 상태
  addingSectionId: string | null;
  editingItemId: number | null;
  editingSectionId: string | null;

  // 타임 피커 상태
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerAMPM: 'AM' | 'PM';
  pickerHour: string;
  pickerMinute: string;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleFilterMode: () => void;
  setAddingSectionId: (id: string | null) => void;
  setEditingItemId: (id: number | null) => void;
  setEditingSectionId: (id: string | null) => void;
  setUIState: (state: Partial<ReminderUIState>) => void;
  resetEditState: () => void;
}

export const useReminderUIStore = create<ReminderUIState>((set) => ({
  searchQuery: '',
  filterMode: 'all',
  addingSectionId: null,
  editingItemId: null,
  editingSectionId: null,
  showTimePopover: false,
  selectedTime: undefined,
  isAllDay: false,
  pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM as 'AM' | 'PM',
  pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
  pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE,

  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleFilterMode: () => set((state) => {
    const nextMode: Record<FilterMode, FilterMode> = {
      all: 'pending',
      pending: 'completed',
      completed: 'all',
    };
    return { filterMode: nextMode[state.filterMode] };
  }),
  setAddingSectionId: (id) =>
    set({ addingSectionId: id, editingItemId: null, editingSectionId: null }),
  setEditingItemId: (id) =>
    set({ editingItemId: id, addingSectionId: null, editingSectionId: null }),
  setEditingSectionId: (id) =>
    set({ editingSectionId: id, addingSectionId: null, editingItemId: null }),
  setUIState: (newState) => set((state) => ({ ...state, ...newState })),
  resetEditState: () =>
    set({
      addingSectionId: null,
      editingItemId: null,
      editingSectionId: null,
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
    }),
}));
