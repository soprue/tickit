import { create } from 'zustand';

interface ReminderEditState {
  addingSectionId: string | null;
  editingItemId: number | null;
  editingSectionId: string | null;
  setAddingSectionId: (id: string | null) => void;
  setEditingItemId: (id: number | null) => void;
  setEditingSectionId: (id: string | null) => void;
  resetEditState: () => void;
}

export const useReminderEditStore = create<ReminderEditState>((set) => ({
  addingSectionId: null,
  editingItemId: null,
  editingSectionId: null,
  setAddingSectionId: (id) =>
    set({ addingSectionId: id, editingItemId: null, editingSectionId: null }),
  setEditingItemId: (id) =>
    set({ editingItemId: id, addingSectionId: null, editingSectionId: null }),
  setEditingSectionId: (id) =>
    set({ editingSectionId: id, addingSectionId: null, editingItemId: null }),
  resetEditState: () =>
    set({
      addingSectionId: null,
      editingItemId: null,
      editingSectionId: null,
    }),
}));
