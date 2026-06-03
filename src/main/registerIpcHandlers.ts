import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { mainStorage } from '../infrastructure/MainStorage';
import { IPC_CHANNELS } from '../shared/constants';
import type { NotificationService } from '../services/NotificationService';
import type { StorageKey, StorageSavePayload, StorageValueMap } from '../shared/types/ipc-types';
import type { AuthDeepLinkService } from './AuthDeepLinkService';

interface RegisterIpcHandlersParams {
  notificationService: NotificationService;
  authDeepLinkService: AuthDeepLinkService;
}

export function registerIpcHandlers({
  notificationService,
  authDeepLinkService,
}: RegisterIpcHandlersParams) {
  ipcMain.handle(IPC_CHANNELS.SAVE, async (_event, { key, data }: StorageSavePayload) => {
    return await mainStorage.write(key, data);
  });

  ipcMain.handle(
    IPC_CHANNELS.GET_ALL,
    async <K extends StorageKey>(_event: IpcMainInvokeEvent, key: K) => {
      return await mainStorage.read<StorageValueMap[K]>(key);
    }
  );

  ipcMain.handle(IPC_CHANNELS.REMOVE, async (_event, key: StorageKey) => {
    return await mainStorage.remove(key);
  });

  ipcMain.handle(IPC_CHANNELS.SYNC_NOTIFICATIONS, async (_event, data) => {
    return await notificationService.syncData(data);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_GOOGLE, async () => {
    return await authDeepLinkService.startGoogleAuth();
  });
}
