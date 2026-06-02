import type { Reminder, ReminderSectionData } from './reminder';

export interface ServerSectionLike {
  id: string;
  title: string;
  isFixed: boolean;
}

export interface ServerReminderLike {
  id: number;
  text: string;
  time: string | null;
  isAllDay: boolean;
  notified: boolean;
  done: boolean;
  sectionId: string;
}

interface SortableReminder extends Reminder {
  timeMs: number | null;
}

function isAllDayReminder(reminder: Pick<Reminder, 'time' | 'isAllDay'>) {
  return !reminder.time || reminder.isAllDay;
}

function toReminder(entity: ServerReminderLike): Reminder {
  return {
    id: entity.id,
    text: entity.text,
    time: entity.time || undefined,
    isAllDay: entity.isAllDay,
    notified: entity.notified,
    done: entity.done,
  };
}

function toSortableReminder(entity: ServerReminderLike): SortableReminder {
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

interface MapServerDataOptions {
  sortItems?: boolean;
}

export function mapServerEntitiesToReminderSections(
  sections: ServerSectionLike[],
  reminders: ServerReminderLike[],
  options: MapServerDataOptions = {}
): ReminderSectionData[] {
  const remindersBySectionId = new Map<string, ServerReminderLike[]>();

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
    items: options.sortItems
      ? (remindersBySectionId.get(section.id) || [])
          .map(toSortableReminder)
          .sort(compareReminderDisplayOrder)
          .map(stripSortableFields)
      : (remindersBySectionId.get(section.id) || []).map(toReminder),
  }));
}

export function mapServerDataToReminderSections(
  sectionsData: { data: ServerSectionLike[] } | undefined,
  remindersData: { data: ServerReminderLike[] } | undefined
): ReminderSectionData[] {
  return mapServerEntitiesToReminderSections(sectionsData?.data || [], remindersData?.data || [], {
    sortItems: true,
  });
}
