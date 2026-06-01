import { Notification, powerMonitor } from 'electron';
import { STORAGE_KEYS } from '../shared/constants';
import { mainStorage } from '../infrastructure/MainStorage';
import { calculateNotifications, type NotificationPersistedState } from './NotificationLogic';
import type { ReminderSectionData } from '../features/reminder/domain/reminder';

/**
 * 메인 프로세스 전용 알림 서비스 (SRP: 알림 발송 및 생명주기 관리)
 */
export class NotificationService {
  private timer: NodeJS.Timeout | null = null;
  private state: NotificationPersistedState | null = null;
  private isChecking = false;
  private hasPendingCheck = false;
  private checkPromise: Promise<void> | null = null;
  private readonly resumeHandler = () => {
    void this.check();
  };

  /**
   * 서비스 시작
   */
  async start() {
    // 앱 시작 시 로컬에 저장된 마지막 데이터를 읽어옴 (오프라인 대비)
    try {
      this.state = await mainStorage.read<NotificationPersistedState>(STORAGE_KEYS.REMINDER);
    } catch (e) {
      console.warn('[NotificationService] Failed to load initial state:', e);
    }

    void this.check();

    // 시스템 절전 모드 해제 시 즉시 체크 (Catch-up 로직)
    powerMonitor.on('resume', this.resumeHandler);
  }

  /**
   * 렌더러 프로세스로부터 데이터를 동기화
   */
  async syncData(newSections: ReminderSectionData[]) {
    console.log('[NotificationService] Data synced from renderer');
    
    // 기존의 lastNightCheckDate는 유지하고 섹션만 업데이트
    this.state = {
      sections: newSections,
      lastNightCheckDate: this.state?.lastNightCheckDate || null
    };
    
    // 동기화된 데이터를 로컬에도 저장 (앱 재시작 대비)
    await mainStorage.write(STORAGE_KEYS.REMINDER, this.state);
    
    // 데이터가 오면 즉시 알림 체크
    await this.check();
  }

  /**
   * 알림 체크 및 발송 실행
   */
  private check(): Promise<void> {
    if (this.isChecking) {
      this.hasPendingCheck = true;
      return this.checkPromise ?? Promise.resolve();
    }

    this.checkPromise = this.runQueuedChecks();
    return this.checkPromise;
  }

  /**
   * 동시에 들어온 체크 요청은 현재 체크 이후 한 번 더 실행되도록 직렬화합니다.
   */
  private async runQueuedChecks() {
    this.isChecking = true;

    try {
      do {
        this.hasPendingCheck = false;
        await this.runSingleCheck();
      } while (this.hasPendingCheck);
    } finally {
      this.isChecking = false;
      this.checkPromise = null;
      this.scheduleNext();
    }
  }

  private async runSingleCheck() {
    if (!this.state) {
      return;
    }

    try {
      const { hasChanges, notifications, updatedState } = calculateNotifications(
        this.state,
        new Date()
      );

      // 알림 발송
      notifications.forEach((note) => this.send(note.title, note.body));

      // 상태 변경 시(예: notified 필드 업데이트) 상태 업데이트 및 저장
      if (hasChanges) {
        this.state = updatedState;
        await mainStorage.write(STORAGE_KEYS.REMINDER, this.state);
      }
    } catch (err) {
      console.error('[NotificationService] Check failed:', err);
    }
  }

  /**
   * 다음 체크 스케줄링 (1분 간격)
   */
  private scheduleNext() {
    if (this.timer) clearTimeout(this.timer);

    const now = new Date();
    const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 500;
    this.timer = setTimeout(() => void this.check(), Math.max(1000, delay));
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
