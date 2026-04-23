import { useEffect } from 'react';
import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { NOTIFICATION_MESSAGES } from '@src/shared/constants';

/**
 * 시스템 알림 모니터링을 담당하는 커스텀 훅 (React lifecycle 통합)
 */
export const useNotificationMonitor = () => {
  useEffect(() => {
    // 1. 알림 권한 요청
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // 2. 알림 체크 로직
    const checkNotifications = () => {
      const { sections } = reminderStore.getState();
      const allItems = sections.flatMap(s => s.items.map(item => ({ ...item, sectionId: s.id })));
      const now = new Date();
      const nowMs = now.getTime();

      // (1) 밤 9시 확인 알림 (21:00)
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        const unfinishedItems = allItems.filter(item => !item.done);
        if (unfinishedItems.length > 0) {
          const itemNames = unfinishedItems.map(it => it.text).join(', ');
          sendNotification(
            NOTIFICATION_MESSAGES.NIGHT_CHECK_TITLE, 
            NOTIFICATION_MESSAGES.NIGHT_CHECK_BODY(itemNames)
          );
        }
      }

      // (2) 개별 리마인더 알림
      allItems.forEach(item => {
        if (!item.time || item.done || item.notified) return;

        const itemDate = item.time instanceof Date ? item.time : new Date(item.time);
        const itemMs = itemDate.getTime();

        if (nowMs >= itemMs) {
          sendNotification(
            NOTIFICATION_MESSAGES.INDIVIDUAL_TITLE, 
            NOTIFICATION_MESSAGES.INDIVIDUAL_BODY(item.text)
          );
          reminderStore.markAsNotified(item.sectionId, item.id);
        }
      });
    };

    // 3. 실제 알림 발송 헬퍼
    const sendNotification = (title: string, body: string) => {
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
    };

    // 4. 타이머 설정 (1분마다 체크)
    const monitoringTimer = setInterval(checkNotifications, 60000);
    
    // 첫 실행 즉시 체크
    checkNotifications();

    // 5. Cleanup: 언마운트 시 타이머 제거
    return () => {
      clearInterval(monitoringTimer);
    };
  }, []);
};
