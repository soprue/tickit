import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  
  // Actions
  showConfirm: (params: { title: string; message: string; onConfirm: () => void; onCancel?: () => void }) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,

  showConfirm: ({ title, message, onConfirm, onCancel }) => set({
    isOpen: true,
    title,
    message,
    onConfirm,
    onCancel: onCancel || null,
  }),

  closeModal: () => set({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  }),
}));
