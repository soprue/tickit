import { mapServerEntitiesToReminderSections } from '../features/reminder/domain/reminderMapper';
import type { ReminderSectionData } from '../features/reminder/domain/reminder';
import type { ServerReminder, ServerSection } from './NotificationApiClient';

export function mapServerDataToNotificationSections(
  sections: ServerSection[],
  reminders: ServerReminder[]
): ReminderSectionData[] {
  return mapServerEntitiesToReminderSections(sections, reminders);
}
