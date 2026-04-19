/**
 * 단일 리마인더 할 일 항목의 구조
 */
export interface Reminder {
  id: number;
  text: string;
  time?: Date;
  isAllDay: boolean;
  notified: boolean;
  done: boolean;
}

/**
 * 리마인더 섹션(카드)의 구조
 * 여러 개의 Reminder 항목을 포함합니다.
 */
export interface ReminderSectionData {
  id: string;       // 시스템 구분용 고유 키 (예: 'EVERYDAY', 'TODO', 'WORK')
  title: string;    // 화면에 표시될 섹션 이름
  isFixed: boolean; // 시스템 고정 섹션 여부 (삭제 불가)
  items: Reminder[];
}
