import { create } from 'zustand';

export type NetworkStatus = 'online' | 'offline' | 'server-unreachable';

const getInitialOnlineStatus = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
};

interface NetworkStatusState {
  status: NetworkStatus;
  isCheckingServer: boolean;
  actions: {
    setStatus: (status: NetworkStatus) => void;
    setCheckingServer: (isCheckingServer: boolean) => void;
  };
}

export const useNetworkStatusStore = create<NetworkStatusState>((set) => ({
  status: getInitialOnlineStatus() ? 'online' : 'offline',
  isCheckingServer: false,
  actions: {
    setStatus: (status) => set({ status }),
    setCheckingServer: (isCheckingServer) => set({ isCheckingServer }),
  },
}));
