import { create } from 'zustand';

export type FilterMode = 'all' | 'pending' | 'completed';

interface ReminderSearchState {
  searchQuery: string;
  filterMode: FilterMode;
  setSearchQuery: (query: string) => void;
  toggleFilterMode: () => void;
}

export const useReminderSearchStore = create<ReminderSearchState>((set) => ({
  searchQuery: '',
  filterMode: 'all',
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleFilterMode: () =>
    set((state) => {
      const nextMode: Record<FilterMode, FilterMode> = {
        all: 'pending',
        pending: 'completed',
        completed: 'all',
      };

      return { filterMode: nextMode[state.filterMode] };
    }),
}));
