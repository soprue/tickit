import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { NOTIFICATION_MESSAGES } from '@src/shared/constants';

/**
 * 시스템 알림을 담당하는 전용 서비스
 */
export class NotificationService {
  private static instance: NotificationService;
  private monitoringTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 모니터링 시작
   */
  startMonitoring() {
    if (this.monitoringTimer) return;

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    this.monitoringTimer = setInterval(() => this.checkNotifications(), 60000);
    this.checkNotifications();
  }

  /**
   * 알림 모니터링 중지
   */
  stopMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
  }

  private checkNotifications() {
    const { sections } = reminderStore.getState();
    const allItems = sections.flatMap(s => s.items.map(item => ({ ...item, sectionId: s.id })));
    const now = new Date();
    const nowMs = now.getTime();

    // 1. 밤 9시 확인 알림 (21:00)
    if (now.getHours() === 21 && now.getMinutes() === 0) {
      const unfinishedItems = allItems.filter(item => !item.done);
      if (unfinishedItems.length > 0) {
        const itemNames = unfinishedItems.map(it => it.text).join(', ');
        this.sendNotification(
          NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE, 
          NOTIFICATION_MESSAGES.NIGHT_CHECK_BODY(itemNames)
        );
      }
    }

    // 2. 개별 리마인더 알림
    allItems.forEach(item => {
      if (!item.time || item.done || item.notified) return;

      const itemDate = item.time instanceof Date ? item.time : new Date(item.time);
      const itemMs = itemDate.getTime();

      if (nowMs >= itemMs) {
        this.sendNotification(
          NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE, 
          NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text)
        );
        reminderStore.markAsNotified(item.sectionId, item.id);
      }
    });
  }

  private sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, { 
        body, 
        icon: './assets/logo.webp',
        silent: false,
        requireInteraction: true 
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}

export const notificationService = NotificationService.getInstance();
