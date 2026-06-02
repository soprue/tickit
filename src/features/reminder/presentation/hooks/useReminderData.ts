import { useMemo } from 'react';
import { mapServerDataToReminderSections } from '@src/features/reminder/domain/reminderMapper';
import { useSectionsControllerFindAll } from '@src/features/auth/infrastructure/api/sections-섹션/sections-섹션';
import { useRemindersControllerFindAll } from '@src/features/auth/infrastructure/api/reminders-리마인더/reminders-리마인더';

export function useReminderData() {
  const { data: sectionsData, isPending: isPendingSections } = useSectionsControllerFindAll();
  const { data: remindersData, isPending: isPendingReminders } = useRemindersControllerFindAll();

  const isInitialLoading =
    (isPendingSections && !sectionsData) || (isPendingReminders && !remindersData);

  const mappedSections = useMemo(
    () => mapServerDataToReminderSections(sectionsData, remindersData),
    [sectionsData, remindersData]
  );

  return {
    mappedSections,
    isInitialLoading,
  };
}
