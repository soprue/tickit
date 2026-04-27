import { useEffect, useRef } from 'react';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { NOTIFICATION_MESSAGES } from '@src/shared/constants';

/**
 * 시스템 알림 모니터링을 담당하는 커스텀 훅
 * 밤 9시 일괄 확인 및 개별 리마인더 알림을 처리합니다.
 */
export function useNotificationMonitor() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. 알림 권한 요청
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // 2. 알림 발송 공통 함수
    const sendNotification = (title: string, body: string) => {
      if (Notification.permission === 'granted') {
        try {
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
        } catch (e) {
          console.error('[NotificationMonitor] Failed to send notification:', e);
        }
      }
    };

    // 3. 메인 체크 로직
    const checkNotifications = () => {
      const { sections, lastNightCheckDate } = reminderStore.getState();
      const allItems = sections.flatMap(s => s.items.map(item => ({ ...item, sectionId: s.id })));
      const now = new Date();
      
      // 로컬 날짜 기준 YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      // (1) 밤 9시 할 일 체크 알림 (21:00 이상이고 오늘 아직 안 보냈을 때)
      if (now.getHours() >= 21 && lastNightCheckDate !== todayDateStr) {
        const unfinishedItems = allItems.filter(item => !item.done);
        if (unfinishedItems.length > 0) {
          const itemNames = unfinishedItems.map(it => it.text).join(', ');
          sendNotification(
            NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE,
            NOTIFICATION_MESSAGES.NIGHT_CHECK_BODY(itemNames)
          );
        }
        // 알림 발송 여부와 상관없이 오늘 체크 완료 표시 (중복 발송 방지)
        reminderStore.setLastNightCheckDate(todayDateStr);
      }

      // (2) 개별 리마인더 알림
      allItems.forEach(item => {
        if (!item.time || item.done || item.notified) return;

        const itemTime = new Date(item.time);
        if (now.getTime() >= itemTime.getTime()) {
          sendNotification(
            NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE,
            NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text)
          );
          reminderStore.markAsNotified(item.sectionId, item.id);
        }
      });

      scheduleNextCheck();
    };

    // 4. 다음 체크 스케줄링 (매 분 정각 근처에서 실행되도록)
    const scheduleNextCheck = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      const now = new Date();
      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 100;
      timerRef.current = setTimeout(checkNotifications, Math.max(1000, delay));
    };

    // 최초 실행
    checkNotifications();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
