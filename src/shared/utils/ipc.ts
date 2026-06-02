import { IPC_CHANNELS } from '../constants';
import type {
  IpcInvokeMap,
  StorageKey,
  StorageSavePayload,
  StorageValueMap,
} from '../types/ipc-types';

/**
 * Electron IPC 통신을 안전하게 처리하기 위한 서비스 유틸리티
 */
async function invoke<K extends StorageKey>(
  channel: typeof IPC_CHANNELS.GET_ALL,
  data: K
): Promise<StorageValueMap[K] | null>;
async function invoke<K extends StorageKey>(
  channel: typeof IPC_CHANNELS.SAVE,
  data: StorageSavePayload<K>
): Promise<void | null>;
async function invoke<K extends StorageKey>(
  channel: typeof IPC_CHANNELS.REMOVE,
  data: K
): Promise<void | null>;
async function invoke<
  K extends Exclude<
    keyof IpcInvokeMap,
    typeof IPC_CHANNELS.GET_ALL | typeof IPC_CHANNELS.SAVE | typeof IPC_CHANNELS.REMOVE
  >,
>(channel: K, data?: IpcInvokeMap[K]['args']): Promise<IpcInvokeMap[K]['returns'] | null>;
async function invoke<K extends keyof IpcInvokeMap>(
  channel: K,
  data?: IpcInvokeMap[K]['args']
): Promise<IpcInvokeMap[K]['returns'] | null> {
  if (typeof window === 'undefined' || !window.api) {
    console.warn(`[IPC] window.api is not available. (Channel: ${channel})`);
    return null;
  }

  try {
    return (await window.api.invoke(channel, data)) as IpcInvokeMap[K]['returns'];
  } catch (error) {
    console.error(`[Infrastructure] [IPC] Invoke error on channel "${channel}":`, error);
    throw error;
  }
}

export const ipc = {
  invoke,
  /**
   * 메인 프로세스에서 보낸 이벤트를 구독합니다 (on)
   * (주의: 컴포넌트 내에서는 useIpc 훅을 사용하는 것이 좋습니다.)
   */
  on(channel: string, callback: (...args: unknown[]) => void) {
    if (typeof window === 'undefined' || !window.api) return () => {};

    return window.api.on(channel, callback);
  },
};
