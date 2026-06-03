import { Notification } from 'electron';

export class NotificationSender {
  send(title: string, body: string) {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  }
}
