import { STORAGE_KEYS } from '@src/shared/constants';
import { createIpcStateStorage } from './createIpcStateStorage';

/**
 * Electron IPC 기반 테마 설정 저장소
 */
export const themeStorage = createIpcStateStorage(STORAGE_KEYS.THEME, 'ThemeStorage');
