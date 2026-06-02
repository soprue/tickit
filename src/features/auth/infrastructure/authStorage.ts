import { STORAGE_KEYS } from '@src/shared/constants';
import { createIpcStateStorage } from '@src/shared/infrastructure/createIpcStateStorage';

/**
 * Electron IPC 기반 인증 정보 저장소
 */
export const authStorage = createIpcStateStorage(STORAGE_KEYS.AUTH, 'AuthStorage');
