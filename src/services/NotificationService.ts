import { Notification, powerMonitor } from 'electron';
import { STORAGE_KEYS } from '../shared/constants';
import { mainStorage } from '../infrastructure/MainStorage';
import { notificationLogic, type NotificationPersistedState } from './NotificationLogic';

/**
 * 메인 프로세스 전용 알림 서비스 (SRP: 알림 발송 및 생명주기 관리)
 */
export class NotificationService {
  private timer: NodeJS.Timeout | null = null;
  private readonly resumeHandler = () => {
    this.check();
  };

  /**
   * 서비스 시작
   */
  start() {
    this.check();

    // 시스템 절전 모드 해제 시 즉시 체크 (Catch-up 로직)
    powerMonitor.on('resume', this.resumeHandler);
  }

  /**
   * 알림 체크 및 발송 실행
   */
  private async check() {
    try {
      const state = await mainStorage.read<NotificationPersistedState>(STORAGE_KEYS.REMINDER);
      if (!state) {
        this.scheduleNext();
        return;
      }

      const { hasChanges, notifications, updatedState } = notificationLogic.calculateNotifications(
        state,
        new Date()
      );

      // 알림 발송
      notifications.forEach((note) => this.send(note.title, note.body));

      // 상태 변경 시 저장
      if (hasChanges) {
        await mainStorage.write(STORAGE_KEYS.REMINDER, updatedState);
      }
    } catch (err) {
      console.error('[NotificationService] Check failed:', err);
    }

    this.scheduleNext();
  }

  /**
   * 다음 체크 스케줄링 (1분 간격)
   */
  private scheduleNext() {
    if (this.timer) clearTimeout(this.timer);

    const now = new Date();
    const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 500;
    this.timer = setTimeout(() => this.check(), Math.max(1000, delay));
  }

  /**
   * 실제 시스템 알림 발송
   */
  private send(title: string, body: string) {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  }

  /**
   * 서비스 정지
   */
  stop() {
    if (this.timer) clearTimeout(this.timer);
    powerMonitor.removeListener('resume', this.resumeHandler);
  }
}

