import { calculateNotifications, type NotificationPersistedState } from './NotificationLogic';
import { NotificationApiClient } from './NotificationApiClient';
import { NotificationScheduler } from './NotificationScheduler';
import { NotificationSender } from './NotificationSender';
import { mapServerDataToNotificationSections } from './NotificationServerMapper';
import { NotificationStateStore } from './NotificationStateStore';
import type { ReminderSectionData } from '../features/reminder/domain/reminder';

interface NotificationSyncPayload {
  sections: ReminderSectionData[];
  accessToken: string | null;
}

const DAILY_REFRESH_TIME_ZONE = 'Asia/Seoul';
const isNotificationDebugEnabled = () => process.env.TICKIT_DEBUG_NOTIFICATIONS === '1';

function parseDebugDate(value: string | null | undefined) {
  if (!value) {
    return { parsedTime: null, minutesUntil: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { parsedTime: null, minutesUntil: null };
  }

  return {
    parsedTime: parsed.toISOString(),
    minutesUntil: Math.round((parsed.getTime() - Date.now()) / 60000),
  };
}

function markRemindersNotified(
  state: NotificationPersistedState,
  reminderIds: number[]
): NotificationPersistedState {
  const ids = new Set(reminderIds);

  return {
    ...state,
    sections: state.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => (ids.has(item.id) ? { ...item, notified: true } : item)),
    })),
  };
}

interface NotificationServiceDependencies {
  stateStore?: NotificationStateStore;
  apiClient?: NotificationApiClient;
  scheduler?: NotificationScheduler;
  sender?: NotificationSender;
}

/**
 * 메인 프로세스 전용 알림 서비스.
 * 알림 계산, 저장, 서버 동기화, 스케줄링을 조립합니다.
 */
export class NotificationService {
  private state: NotificationPersistedState | null = null;
  private accessToken: string | null = null;
  private isChecking = false;
  private hasPendingCheck = false;
  private checkPromise: Promise<void> | null = null;
  private readonly stateStore: NotificationStateStore;
  private readonly apiClient: NotificationApiClient;
  private readonly scheduler: NotificationScheduler;
  private readonly sender: NotificationSender;

  constructor(dependencies: NotificationServiceDependencies = {}) {
    this.stateStore = dependencies.stateStore ?? new NotificationStateStore();
    this.apiClient = dependencies.apiClient ?? new NotificationApiClient();
    this.scheduler = dependencies.scheduler ?? new NotificationScheduler(() => void this.check());
    this.sender = dependencies.sender ?? new NotificationSender();
  }

  /**
   * 서비스 시작
   */
  async start() {
    // 앱 시작 시 로컬에 저장된 마지막 데이터를 읽어옴 (오프라인 대비)
    try {
      this.state = await this.stateStore.read();
    } catch (e) {
      console.warn('[NotificationService] Failed to load initial state:', e);
    }

    void this.check();

    // 시스템 절전 모드 해제 시 즉시 체크 (Catch-up 로직)
    this.scheduler.start();
  }

  /**
   * 렌더러 프로세스로부터 데이터를 동기화
   */
  async syncData({ sections, accessToken }: NotificationSyncPayload) {
    console.log('[NotificationService] Data synced from renderer');
    this.accessToken = accessToken;

    if (isNotificationDebugEnabled()) {
      const reminders = sections.flatMap((section) => section.items);
      const timedReminders = reminders.filter((item) => item.time && !item.isAllDay);
      console.log('[NotificationService][debug] synced state', {
        sections: sections.length,
        reminders: reminders.length,
        timedReminders: timedReminders.length,
        now: new Date().toISOString(),
        items: timedReminders.map((item) => {
          const debugTime = parseDebugDate(item.time);

          return {
            id: item.id,
            text: item.text,
            time: item.time,
            parsedTime: debugTime.parsedTime,
            minutesUntil: debugTime.minutesUntil,
            isAllDay: item.isAllDay,
            done: item.done,
            notified: item.notified,
          };
        }),
      });
    }

    // 기존의 lastNightCheckDate는 유지하고 섹션만 업데이트
    this.state = {
      sections,
      lastNightCheckDate: this.state?.lastNightCheckDate || null,
      lastServerRefreshDate: this.accessToken ? this.getTodayRefreshDate() : null,
    };

    // 동기화된 데이터를 로컬에도 저장 (앱 재시작 대비)
    await this.stateStore.write(this.state);

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
      this.scheduler.scheduleNext();
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

      if (isNotificationDebugEnabled()) {
        console.log('[NotificationService][debug] check result', {
          notifications,
          notifiedReminderIds,
          hasChanges,
        });
      }

      const sentReminderIds = notifications
        .filter((note) => this.send(note.title, note.body))
        .flatMap((note) => (note.reminderId === undefined ? [] : [note.reminderId]));
      const allNotifiedReminderIds = [...notifiedReminderIds, ...sentReminderIds];
      const nextState =
        sentReminderIds.length > 0
          ? markRemindersNotified(updatedState, sentReminderIds)
          : updatedState;

      // 상태 변경 시(예: notified 필드 업데이트) 상태 업데이트 및 저장
      if (hasChanges || sentReminderIds.length > 0) {
        this.state = nextState;
        await this.stateStore.write(this.state);
      }

      if (allNotifiedReminderIds.length > 0) {
        await this.syncNotifiedReminders(allNotifiedReminderIds);
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

    const accessToken = this.accessToken;
    const uniqueIds = [...new Set(reminderIds)];
    const results = await Promise.allSettled(
      uniqueIds.map((id) => this.apiClient.markReminderNotified(id, accessToken))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          '[NotificationService] Failed to sync notified reminder (' + uniqueIds[index] + '):',
          result.reason
        );
      }
    });
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
        this.apiClient.fetchSections(this.accessToken),
        this.apiClient.fetchReminders(this.accessToken),
      ]);

      this.state = {
        sections: mapServerDataToNotificationSections(sections, reminders),
        lastNightCheckDate: this.state.lastNightCheckDate,
        lastServerRefreshDate: today,
      };

      await this.stateStore.write(this.state);
    } catch (err) {
      console.error('[NotificationService] Failed to refresh reminders after date change:', err);
    }
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
   * 실제 시스템 알림 발송
   */
  private send(title: string, body: string) {
    return this.sender.send(title, body);
  }

  sendTestNotification() {
    this.sender.send('Tickit 알림 테스트', 'Electron 시스템 알림이 표시되는지 확인 중입니다.');
  }

  /**
   * 서비스 정지
   */
  stop() {
    this.scheduler.stop();
  }
}
