import { StateStorage } from 'zustand/middleware';
import { IPC_CHANNELS } from '@src/shared/constants';
import { ipc } from '@src/shared/utils/ipc';
import type { StorageKey, StorageValueMap } from '@src/shared/types/ipc-types';

export function createIpcStateStorage<K extends StorageKey>(key: K, label: string): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      if (name !== key) return null;

      try {
        const data = await ipc.invoke(IPC_CHANNELS.GET_ALL, key);
        if (data) return JSON.stringify({ state: data });
        return null;
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      if (name !== key) return;

      try {
        const data = JSON.parse(value) as { state: StorageValueMap[K] };
        await ipc.invoke(IPC_CHANNELS.SAVE, {
          key,
          data: data.state,
        });
      } catch (error) {
        console.error(`[Infrastructure] [${label}] Save error:`, error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      if (name !== key) return;

      try {
        await ipc.invoke(IPC_CHANNELS.REMOVE, key);
      } catch (error) {
        console.error(`[Infrastructure] [${label}] Remove error:`, error);
      }
    },
  };
}
