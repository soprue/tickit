import { useMemo } from 'react';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';
import type { SectionEntity, ReminderEntity } from '@src/features/auth/infrastructure/api/model';
import { useSectionsControllerFindAll } from '@src/features/auth/infrastructure/api/sections-섹션/sections-섹션';
import { useRemindersControllerFindAll } from '@src/features/auth/infrastructure/api/reminders-리마인더/reminders-리마인더';

/**
 * 서버 데이터를 UI 형식으로 매핑하고 정렬 정책에 따라 정렬합니다.
 */
function transformServerData(
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

  return sections.map((section) => {
    const sectionReminders = (remindersBySectionId.get(section.id) || []).map((item) => ({
      id: item.id,
      text: item.text,
      time: item.time || undefined,
      isAllDay: item.isAllDay,
      notified: item.notified,
      done: item.done,
    }));

    const sortedItems = [...sectionReminders].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;

      const aIsAllDay = !a.time || a.isAllDay;
      const bIsAllDay = !b.time || b.isAllDay;

      if (aIsAllDay !== bIsAllDay) return aIsAllDay ? -1 : 1;

      if (!aIsAllDay && !bIsAllDay && a.time && b.time) {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }

      return 0;
    });

    return {
      id: section.id,
      title: section.title,
      isFixed: section.isFixed,
      items: sortedItems,
    };
  });
}

export function useReminderData() {
  const { data: sectionsData, isPending: isPendingSections } = useSectionsControllerFindAll();
  const { data: remindersData, isPending: isPendingReminders } = useRemindersControllerFindAll();

  const isInitialLoading =
    (isPendingSections && !sectionsData) || (isPendingReminders && !remindersData);

  const mappedSections = useMemo(
    () => transformServerData(sectionsData, remindersData),
    [sectionsData, remindersData]
  );

  return {
    mappedSections,
    isInitialLoading,
  };
}
