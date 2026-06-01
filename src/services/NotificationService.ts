import { Notification, powerMonitor } from 'electron';
import { STORAGE_KEYS } from '../shared/constants';
import { mainStorage } from '../infrastructure/MainStorage';
import { calculateNotifications, type NotificationPersistedState } from './NotificationLogic';
import type { ReminderSectionData } from '../features/reminder/domain/reminder';

interface NotificationSyncPayload {
  sections: ReminderSectionData[];
  accessToken: string | null;
}

interface ApiResponse<T> {
  data: T;
}

interface ServerSection {
  id: string;
  title: string;
  isFixed: boolean;
}

interface ServerReminder {
  id: number;
  text: string;
  time: string | null;
  isAllDay: boolean;
  notified: boolean;
  done: boolean;
  sectionId: string;
}

const DAILY_REFRESH_TIME_ZONE = 'Asia/Seoul';

/**
 * 메인 프로세스 전용 알림 서비스 (SRP: 알림 발송 및 생명주기 관리)
 */
export class NotificationService {
  private timer: NodeJS.Timeout | null = null;
  private state: NotificationPersistedState | null = null;
  private accessToken: string | null = null;
  private readonly apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
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
  async syncData({ sections, accessToken }: NotificationSyncPayload) {
    console.log('[NotificationService] Data synced from renderer');
    this.accessToken = accessToken;

    // 기존의 lastNightCheckDate는 유지하고 섹션만 업데이트
    this.state = {
      sections,
      lastNightCheckDate: this.state?.lastNightCheckDate || null,
      lastServerRefreshDate: this.accessToken ? this.getTodayRefreshDate() : null,
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
      await this.refreshFromServerAfterDateChange();

      const { hasChanges, notifications, notifiedReminderIds, updatedState } =
        calculateNotifications(this.state, new Date());

      // 알림 발송
      notifications.forEach((note) => this.send(note.title, note.body));

      // 상태 변경 시(예: notified 필드 업데이트) 상태 업데이트 및 저장
      if (hasChanges) {
        this.state = updatedState;
        await mainStorage.write(STORAGE_KEYS.REMINDER, this.state);
      }

      if (notifiedReminderIds.length > 0) {
        await this.syncNotifiedReminders(notifiedReminderIds);
      }
    } catch (err) {
      console.error('[NotificationService] Check failed:', err);
    }
  }

  /**
   * 알림 발송 여부를 서버에도 반영하여 다음 동기화 때 notified 상태가 되돌아가지 않게 합니다.
   */
  private async syncNotifiedReminders(reminderIds: number[]) {
    if (!this.accessToken) {
      console.warn('[NotificationService] Cannot sync notified reminders: missing access token');
      return;
    }

    const uniqueIds = [...new Set(reminderIds)];
    const results = await Promise.allSettled(uniqueIds.map((id) => this.markReminderNotified(id)));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          '[NotificationService] Failed to sync notified reminder (' + uniqueIds[index] + '):',
          result.reason
        );
      }
    });
  }

  private async markReminderNotified(reminderId: number) {
    const response = await fetch(this.apiUrl + '/api/reminders/' + reminderId, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.accessToken,
      },
      body: JSON.stringify({ notified: true }),
    });

    if (!response.ok) {
      throw new Error('PATCH /api/reminders/' + reminderId + ' failed with ' + response.status);
    }
  }

  private async refreshFromServerAfterDateChange() {
    if (!this.state || !this.accessToken) {
      return;
    }

    const today = this.getTodayRefreshDate();
    if (this.state.lastServerRefreshDate === today) {
      return;
    }

    try {
      const [sections, reminders] = await Promise.all([
        this.fetchSectionsFromServer(),
        this.fetchRemindersFromServer(),
      ]);

      this.state = {
        sections: this.mapServerData(sections, reminders),
        lastNightCheckDate: this.state.lastNightCheckDate,
        lastServerRefreshDate: today,
      };

      await mainStorage.write(STORAGE_KEYS.REMINDER, this.state);
    } catch (err) {
      console.error('[NotificationService] Failed to refresh reminders after date change:', err);
    }
  }

  private async fetchSectionsFromServer() {
    const response = await fetch(this.apiUrl + '/api/sections', {
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('GET /api/sections failed with ' + response.status);
    }

    const body = (await response.json()) as ApiResponse<ServerSection[]>;
    return body.data;
  }

  private async fetchRemindersFromServer() {
    const response = await fetch(this.apiUrl + '/api/reminders', {
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('GET /api/reminders failed with ' + response.status);
    }

    const body = (await response.json()) as ApiResponse<ServerReminder[]>;
    return body.data;
  }

  private mapServerData(
    sections: ServerSection[],
    reminders: ServerReminder[]
  ): ReminderSectionData[] {
    const remindersBySectionId = new Map<string, ServerReminder[]>();

    reminders.forEach((reminder) => {
      const sectionReminders = remindersBySectionId.get(reminder.sectionId);

      if (sectionReminders) {
        sectionReminders.push(reminder);
        return;
      }

      remindersBySectionId.set(reminder.sectionId, [reminder]);
    });

    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      isFixed: section.isFixed,
      items: (remindersBySectionId.get(section.id) || []).map((item) => ({
        id: item.id,
        text: item.text,
        time: item.time || undefined,
        isAllDay: item.isAllDay,
        notified: item.notified,
        done: item.done,
      })),
    }));
  }

  private getTodayRefreshDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: DAILY_REFRESH_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return `${values.year}-${values.month}-${values.day}`;
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
