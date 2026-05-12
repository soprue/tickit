import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'error';

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',

  showToast: (message: string, type: ToastType = 'info') => {
    set({ isOpen: true, message, type });
    
    // 3초 후 자동으로 닫기
    setTimeout(() => {
      set({ isOpen: false });
    }, 3000);
  },

  hideToast: () => set({ isOpen: false }),
}));
