import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';
import type { UserEntity } from '@features/auth/infrastructure/api/model';

/**
 * IPC 채널별 요청(Payload) 및 응답(Result) 타입을 정의하는 계약 파일
 */
export interface IpcInvokeMap {
  /** 전체 리마인더 데이터 또는 특정 키의 데이터 조회 */
  'reminder:get-all': {
    args: string; // key (예: STORAGE_KEYS.REMINDER)
    returns: { state: { sections: ReminderSectionData[] } } | null; // 반환 데이터 (JSON 객체)
  };
  /** 특정 키의 데이터를 파일로 저장 */
  'reminder:save': {
    args: {
      key: string;
      data: { state: { sections: ReminderSectionData[] } };
    };
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
