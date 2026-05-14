import { create } from 'zustand';
import { DELAYS } from '@src/shared/constants';

export type ToastType = 'info' | 'success' | 'error';

interface ToastData {
  isOpen: boolean;
  message: string;
  type: ToastType;
}

interface ToastActions {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

type ToastState = ToastData & { actions: ToastActions };

export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',

  actions: {
    showToast: (message: string, type: ToastType = 'info') => {
      set({ isOpen: true, message, type });

      // 자동으로 닫기
      setTimeout(() => {
        set({ isOpen: false });
      }, DELAYS.AUTO_CLOSE);
    },

    hideToast: () => set({ isOpen: false }),
  },
}));
