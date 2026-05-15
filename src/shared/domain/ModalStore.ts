import { create } from 'zustand';

interface ModalData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

interface ModalActions {
  showConfirm: (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeModal: () => void;
}

type ModalState = ModalData & { actions: ModalActions };

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,

  actions: {
    showConfirm: ({ title, message, onConfirm, onCancel }) =>
      set({
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel: onCancel || null,
      }),

    closeModal: () =>
      set({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      }),
  },
}));
