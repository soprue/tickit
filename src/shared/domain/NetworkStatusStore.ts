import { create } from 'zustand';

const getInitialOnlineStatus = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
};

interface NetworkStatusState {
  isOnline: boolean;
  actions: {
    setOnlineStatus: (isOnline: boolean) => void;
  };
}

export const useNetworkStatusStore = create<NetworkStatusState>((set) => ({
  isOnline: getInitialOnlineStatus(),
  actions: {
    setOnlineStatus: (isOnline) => set({ isOnline }),
  },
}));

