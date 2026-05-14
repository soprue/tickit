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
 * 알림 발생 여부를 결정하는 순수 로직 클래스 (SRP: 알림 로직 담당)
 */
export class NotificationLogic {
  /**
   * 현재 상태와 시간을 기반으로 보낼 알림을 계산합니다.
   */
  calculateNotifications(
    state: NotificationPersistedState,
    now: Date
  ): NotificationCheckResult {
    const { sections, lastNightCheckDate } = state;
    const results: NotificationCheckResult = {
      hasChanges: false,
      notifications: [],
      updatedState: { ...state }, // 원본 보호를 위해 복사본 생성
    };

    if (!sections) return results;

    // 모든 리마인더를 평탄화 (섹션 ID 포함)
    const allItems = sections.flatMap((section) =>
      section.items.map((item) => ({ ...item, sectionId: section.id }))
    );
    
    const nowMs = now.getTime();
    const todayDateStr = this.getTodayDateString(now);

    // 1. 밤 9시 할 일 체크 (21:00 이상)
    if (now.getHours() >= 21 && lastNightCheckDate !== todayDateStr) {
      const unfinishedItems = allItems.filter((item) => !item.done);
      if (unfinishedItems.length > 0) {
        results.notifications.push({
          title: NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE,
          body: this.formatNightCheckBody(unfinishedItems),
        });
      }
      results.updatedState.lastNightCheckDate = todayDateStr;
      results.hasChanges = true;
    }

    // 2. 개별 리마인더 알림
    const oneHourAgo = nowMs - 60 * 60 * 1000;

    // updatedState의 섹션을 직접 순회하며 상태 변경 (복사본이므로 안전)
    results.updatedState.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.time || item.done || item.notified) return;

        const itemTime = new Date(item.time);
        const itemMs = itemTime.getTime();

        if (nowMs >= itemMs) {
          const isToday = itemTime.toDateString() === now.toDateString();
          const isRecent = itemMs > oneHourAgo;

          if (isToday && isRecent) {
            results.notifications.push({
              title: NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE,
              body: NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text),
            });
          }

          item.notified = true;
          results.hasChanges = true;
        }
      });
    });

    return results;
  }

  private getTodayDateString(now: Date): string {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatNightCheckBody(items: Array<Reminder & { sectionId: string }>): string {
    const count = items.length;
    const displayItems = items
      .slice(0, 3)
      .map((it) => it.text)
      .join(', ');
    const itemsText = count > 3 ? `${displayItems} 외 ${count - 3}개` : displayItems;
    return `아직 ${count}개의 할 일이 남았어요: ${itemsText}`;
  }
}

export const notificationLogic = new NotificationLogic();
