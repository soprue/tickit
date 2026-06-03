import { mainStorage } from '../infrastructure/MainStorage';
import { STORAGE_KEYS } from '../shared/constants';
import type { StorageValueMap } from '../shared/types/ipc-types';
import type { NotificationPersistedState } from './NotificationLogic';

export class NotificationStateStore {
  read() {
    return mainStorage.read<StorageValueMap[typeof STORAGE_KEYS.REMINDER]>(STORAGE_KEYS.REMINDER);
  }

  write(state: NotificationPersistedState) {
    return mainStorage.write(STORAGE_KEYS.REMINDER, state);
  }
}
