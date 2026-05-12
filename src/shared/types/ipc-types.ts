/**
 * IPC 채널별 요청(Payload) 및 응답(Result) 타입을 정의하는 계약 파일
 */
export interface IpcInvokeMap {
  /** 전체 리마인더 데이터 또는 특정 키의 데이터 조회 */
  'reminder:get-all': {
    args: string; // key (예: STORAGE_KEYS.REMINDER)
    returns: any; // 반환 데이터 (JSON 객체)
  };
  /** 특정 키의 데이터를 파일로 저장 */
  'reminder:save': {
    args: {
      key: string;
      data: any;
    };
    returns: void;
  };
}
