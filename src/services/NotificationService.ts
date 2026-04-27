import { Notification, app, powerMonitor } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// 상수 직접 정의
const STORAGE_KEY = 'tickit_data';
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const FILE_PATH = path.join(DATA_DIR, `${STORAGE_KEY}.json`);

const NOTIFICATION_MESSAGES = {
  INDIVIDUAL_TITLE: '리마인더 알림',
  INDIVIDUAL_BODY: (text: string) => `${text} 할 시간이에요`,
  NIGHT_CHECK_TITLE: '오늘 마무리 하셨나요?',
};

/**
 * 메인 프로세스 전용 알림 서비스
 */
export class NotificationService {
  private timer: NodeJS.Timeout | null = null;
  private readonly resumeHandler = () => {
    console.log('[NotificationService] System resumed from sleep, checking notifications...');
    this.check();
  };

  constructor() {
    console.log('[NotificationService] Initialized');
  }

  /**
   * 서비스 시작
   */
  start() {
    this.check();
    
    // 시스템 절전 모드 해제 시 즉시 체크 (Catch-up 로직)
    powerMonitor.on('resume', this.resumeHandler);
  }

  /**
   * 알림 체크 메인 로직
   */
  private async check() {
    try {
      if (!fs.existsSync(FILE_PATH)) {
        this.scheduleNext();
        return;
      }

      const content = await fs.promises.readFile(FILE_PATH, 'utf-8');
      const state = JSON.parse(content);
      const { sections, lastNightCheckDate } = state;

      if (!sections) {
        this.scheduleNext();
        return;
      }

      const allItems = sections.flatMap((s: any) => s.items.map((item: any) => ({ ...item, sectionId: s.id })));
      const now = new Date();
      const nowMs = now.getTime();
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      let hasChanges = false;

      // 1. 밤 9시 할 일 체크 (21:00 이상)
      if (now.getHours() >= 21 && lastNightCheckDate !== todayDateStr) {
        const unfinishedItems = allItems.filter((item: any) => !item.done);
        const count = unfinishedItems.length;

        if (count > 0) {
          const displayItems = unfinishedItems.slice(0, 3).map((it: any) => it.text).join(', ');
          const itemsText = count > 3 ? `${displayItems} 외 ${count - 3}개` : displayItems;
          const body = `아직 ${count}개의 할 일이 남았어요: ${itemsText}`;

          this.send(
            NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE,
            body
          );
        }
        state.lastNightCheckDate = todayDateStr;
        hasChanges = true;
      }

      // 2. 개별 리마인더 알림
      const oneHourAgo = nowMs - (60 * 60 * 1000);
      
      sections.forEach((section: any) => {
        section.items.forEach((item: any) => {
          if (!item.time || item.done || item.notified) return;

          const itemTime = new Date(item.time);
          const itemMs = itemTime.getTime();

          if (nowMs >= itemMs) {
            // 오늘 날짜이고 1시간 이내인 경우만 알림 발송
            const isToday = itemTime.toDateString() === now.toDateString();
            const isRecent = itemMs > oneHourAgo;

            if (isToday && isRecent) {
              this.send(
                NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE,
                NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text)
              );
            }
            
            item.notified = true;
            hasChanges = true;
          }
        });
      });

      // 변경사항이 있으면 파일 저장
      if (hasChanges) {
        await fs.promises.writeFile(FILE_PATH, JSON.stringify(state, null, 2));
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
      const notification = new Notification({
        title,
        body,
        silent: false,
      });
      notification.show();
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    powerMonitor.removeListener('resume', this.resumeHandler);
  }
}
