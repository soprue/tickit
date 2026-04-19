/**
 * 애플리케이션 전반에서 사용되는 상수 정의
 */
export const STORAGE_KEYS = {
  REMINDER: 'tickit_data',
  THEME: 'tickit_theme',
  AUTH: 'tickit_auth',
} as const;

export const DELAYS = {
  SAVE_DEBOUNCE: 300,       // 데이터 저장 디바운싱 지연 시간 (ms)
  FOCUS_RESTORE: 250,      // 리렌더링 시 포커스 복구 대기 시간 (ms)
  UI_TRANSITION: 150,      // 일반적인 UI 전환/닫힘 대기 시간 (ms)
  AUTO_CLOSE: 2500,        // 토스트/알림 자동 닫힘 시간 (ms)
} as const;

export const REMINDER_CONFIG = {
  DEFAULT_TIME: 'All Day',
  NEW_SECTION_TITLE: 'New Section',
  DEFAULT_HOUR: '09',
  DEFAULT_MINUTE: '00',
  DEFAULT_AMPM: 'AM' as const,
} as const;

/**
 * 리마인더 카테고리 정의
 */
export enum Category {
  EVERYDAY = 'Everyday',
  TODO = 'To Do',
  WORK = 'Work',
}

export const CATEGORY_LIST = [
  { title: 'Everyday', value: Category.EVERYDAY },
  { title: 'To Do', value: Category.TODO },
  { title: 'Work', value: Category.WORK },
] as const;

export const NOTIFICATION_MESSAGES = {
  INDIVIDUAL_TITLE: '리마인더 알림',
  INDIVIDUAL_BODY: (text: string) => `${text} 할 시간이에요`,
  NIGHT_CHECK_TITLE: '오늘 마무리 하셨나요?',
  NIGHT_CHECK_BODY: (items: string) => `아직 남은 할 일이 있어요: ${items}`,
} as const;
