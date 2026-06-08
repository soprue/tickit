import { Notification } from 'electron';

export class NotificationSender {
  send(title: string, body: string) {
    if (!Notification.isSupported()) {
      console.warn('[NotificationSender] Notifications are not supported on this system.');
      return false;
    }

    const notification = new Notification({ title, body, silent: false });
    notification.on('failed', (_event, error) => {
      console.error('[NotificationSender] Notification failed:', error);
    });
    notification.show();
    return true;
  }
}
