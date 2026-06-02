import type { SectionEntity, ReminderEntity } from '@src/features/auth/infrastructure/api/model';
import type { Reminder, ReminderSectionData } from './reminder';

interface SortableReminder extends Reminder {
  timeMs: number | null;
}

function isAllDayReminder(reminder: Pick<Reminder, 'time' | 'isAllDay'>) {
  return !reminder.time || reminder.isAllDay;
}

function toReminder(entity: ReminderEntity): Reminder {
  return {
    id: entity.id,
    text: entity.text,
    time: entity.time || undefined,
    isAllDay: entity.isAllDay,
    notified: entity.notified,
    done: entity.done,
  };
}

function toSortableReminder(entity: ReminderEntity): SortableReminder {
  const reminder = toReminder(entity);

  return {
    ...reminder,
    timeMs: reminder.time ? Date.parse(reminder.time) : null,
  };
}

function compareReminderDisplayOrder(a: SortableReminder, b: SortableReminder) {
  if (a.done !== b.done) return a.done ? 1 : -1;

  const aIsAllDay = isAllDayReminder(a);
  const bIsAllDay = isAllDayReminder(b);

  if (aIsAllDay !== bIsAllDay) return aIsAllDay ? -1 : 1;

  if (!aIsAllDay && !bIsAllDay && a.timeMs !== null && b.timeMs !== null) {
    return a.timeMs - b.timeMs;
  }

  return 0;
}

function stripSortableFields(reminder: SortableReminder): Reminder {
  const { timeMs: _timeMs, ...displayReminder } = reminder;
  return displayReminder;
}

export function mapServerDataToReminderSections(
  sectionsData: { data: SectionEntity[] } | undefined,
  remindersData: { data: ReminderEntity[] } | undefined
): ReminderSectionData[] {
  const sections = sectionsData?.data || [];
  const reminders = remindersData?.data || [];
  const remindersBySectionId = new Map<string, ReminderEntity[]>();

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
    items: (remindersBySectionId.get(section.id) || [])
      .map(toSortableReminder)
      .sort(compareReminderDisplayOrder)
      .map(stripSortableFields),
  }));
}
