import { mainStorage } from '../infrastructure/MainStorage';
import { STORAGE_KEYS } from '../shared/constants';
import type { NotificationPersistedState } from './NotificationLogic';

export class NotificationStateStore {
  read() {
    return mainStorage.read<NotificationPersistedState>(STORAGE_KEYS.REMINDER);
  }

  write(state: NotificationPersistedState) {
    return mainStorage.write(STORAGE_KEYS.REMINDER, state);
  }
}
