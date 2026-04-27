import { Category } from '@src/shared/constants';

/**
 * 단일 리마인더 할 일 항목의 구조
 */
export interface Reminder {
  id: number;
  text: string;
  /** ISO String 형식의 시간 데이터 */
  time?: string;
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

const today = new Date();
export const initialSections: ReminderSectionData[] = [
  { id: Category.EVERYDAY, title: 'Everyday', isFixed: true, items: [
    { id: 1, text: '약 먹기', time: new Date(new Date(today).setHours(14, 0, 0, 0)).toISOString(), isAllDay: false, notified: true, done: true },
    { id: 2, text: '알고리즘 문제 풀기', time: new Date(new Date(today).setHours(16, 0, 0, 0)).toISOString(), isAllDay: false, notified: false, done: false },
    { id: 3, text: '산책하기', time: new Date(new Date(today).setHours(23, 0, 0, 0)).toISOString(), isAllDay: false, notified: false, done: true },
  ]},
  { id: Category.TODO, title: 'To Do', isFixed: true, items: [
    { id: 4, text: '책 반납하기', isAllDay: true, notified: false, done: false },
    { id: 5, text: '편의점 택배 보내고 오기', time: new Date(new Date(today).setHours(16, 0, 0, 0)).toISOString(), isAllDay: false, notified: false, done: false },
  ]},
  { id: Category.WORK, title: 'Work', isFixed: false, items: [] },
];
