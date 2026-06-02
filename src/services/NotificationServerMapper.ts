import type { ReminderSectionData } from '../features/reminder/domain/reminder';
import type { ServerReminder, ServerSection } from './NotificationApiClient';

export function mapServerDataToNotificationSections(
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
