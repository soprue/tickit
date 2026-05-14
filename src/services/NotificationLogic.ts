import { produce } from 'immer';
import { NOTIFICATION_MESSAGES } from '../shared/constants';
import type { Reminder, ReminderSectionData } from '../features/reminder/domain/reminder';

/**
 * 알림 로직에서 사용하는 영속성 상태 구조
 */
export interface NotificationPersistedState {
  sections: ReminderSectionData[];
  lastNightCheckDate: string | null;
}

interface NotificationCheckResult {
  hasChanges: boolean;
  notifications: Array<{ title: string; body: string }>;
  updatedState: NotificationPersistedState;
}

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
function getTodayDateString(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 밤 9시 체크 메시지 포맷팅
 */
function formatNightCheckBody(items: Array<Reminder & { sectionId: string }>): string {
  const count = items.length;
  const displayItems = items
    .slice(0, 3)
    .map((it) => it.text)
    .join(', ');
  const itemsText = count > 3 ? `${displayItems} 외 ${count - 3}개` : displayItems;
  return `아직 ${count}개의 할 일이 남았어요: ${itemsText}`;
}

/**
 * 현재 상태와 시간을 기반으로 보낼 알림을 계산합니다.
 * immer의 produce를 사용하여 구조적 공유를 유지하며 안전하게 새로운 상태를 반환합니다.
 */
export function calculateNotifications(
  state: NotificationPersistedState,
  now: Date
): NotificationCheckResult {
  const notifications: Array<{ title: string; body: string }> = [];
  let hasChanges = false;

  const updatedState = produce(state, (draft) => {
    const { sections, lastNightCheckDate } = draft;
    if (!sections) return;

    // 모든 리마인더를 평탄화 (섹션 ID 포함) - 알림 메시지 생성용 (읽기 전용)
    const allItems = sections.flatMap((section) =>
      section.items.map((item) => ({ ...item, sectionId: section.id }))
    );

    const nowMs = now.getTime();
    const todayDateStr = getTodayDateString(now);

    // 1. 밤 9시 할 일 체크 (21:00 이상)
    if (now.getHours() >= 21 && lastNightCheckDate !== todayDateStr) {
      const unfinishedItems = allItems.filter((item) => !item.done);
      if (unfinishedItems.length > 0) {
        notifications.push({
          title: NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE,
          body: formatNightCheckBody(unfinishedItems),
        });
      }
      draft.lastNightCheckDate = todayDateStr;
      hasChanges = true;
    }

    // 2. 개별 리마인더 알림
    const oneHourAgo = nowMs - 60 * 60 * 1000;

    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.time || item.done || item.notified) return;

        const itemTime = new Date(item.time);
        const itemMs = itemTime.getTime();

        if (nowMs >= itemMs) {
          const isToday = itemTime.toDateString() === now.toDateString();
          const isRecent = itemMs > oneHourAgo;

          if (isToday && isRecent) {
            notifications.push({
              title: NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE,
              body: NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text),
            });
          }

          item.notified = true;
          hasChanges = true;
        }
      });
    });
  });

  return {
    hasChanges,
    notifications,
    updatedState,
  };
}
