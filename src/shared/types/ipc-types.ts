import type { UserEntity } from '@src/shared/infrastructure/api/model';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';
import type { NotificationPersistedState } from '@src/services/NotificationLogic';

export interface StorageValueMap {
  tickit_data: NotificationPersistedState;
  tickit_theme: {
    isDarkMode: boolean;
  };
  tickit_auth: {
    isLoggedIn: boolean;
    user: UserEntity | null;
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export type StorageKey = keyof StorageValueMap;

export type StorageSavePayload<K extends StorageKey = StorageKey> = {
  [Key in K]: {
    key: Key;
    data: StorageValueMap[Key];
  };
}[K];

/**
 * IPC 채널별 요청(Payload) 및 응답(Result) 타입을 정의하는 계약 파일
 */
export interface IpcInvokeMap {
  /** 특정 storage key의 데이터 조회 */
  'reminder:get-all': {
    args: StorageKey;
    returns: StorageValueMap[StorageKey] | null;
  };
  /** 특정 키의 데이터를 파일로 저장 */
  'reminder:save': {
    args: StorageSavePayload;
    returns: void;
  };
  /** 특정 storage key의 데이터 삭제 */
  'reminder:remove': {
    args: StorageKey;
    returns: void;
  };
  /** 렌더러의 최신 리마인더 데이터를 메인 프로세스 알림 서비스와 동기화 */
  'reminder:sync-notifications': {
    args: {
      sections: ReminderSectionData[];
      accessToken: string | null;
    };
    returns: void;
  };
  /** 구글 로그인 실행 및 결과 반환 */
  'auth:google': {
    args: void;
    returns: { access_token: string; refresh_token?: string; user: UserEntity } | null;
  };
}
