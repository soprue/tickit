import { useQueryClient } from '@tanstack/react-query';
import {
  useSectionsControllerCreate,
  useSectionsControllerUpdate,
  useSectionsControllerRemove,
  getSectionsControllerFindAllQueryKey,
  type sectionsControllerFindAllResponse,
} from '@src/shared/infrastructure/api/sections-섹션/sections-섹션';
import {
  useRemindersControllerCreate,
  useRemindersControllerUpdate,
  useRemindersControllerRemove,
  getRemindersControllerFindAllQueryKey,
  type remindersControllerFindAllResponse,
} from '@src/shared/infrastructure/api/reminders-리마인더/reminders-리마인더';
import type { SectionEntity, ReminderEntity } from '@src/shared/infrastructure/api/model';
import { createOptimisticCache } from './optimisticQueryCache';

const emptySectionsResponse = (): sectionsControllerFindAllResponse => ({
  data: [],
  status: 200,
  headers: new Headers(),
});

const emptyRemindersResponse = (): remindersControllerFindAllResponse => ({
  data: [],
  status: 200,
  headers: new Headers(),
});

function createTemporarySection(title: string): SectionEntity {
  const now = new Date().toISOString();

  return {
    id: 'temp-' + Date.now(),
    title,
    isFixed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createTemporaryReminder(
  temporaryId: number,
  data: Pick<ReminderEntity, 'sectionId' | 'text'> &
    Partial<Pick<ReminderEntity, 'time' | 'isAllDay'>>
): ReminderEntity {
  const now = new Date().toISOString();

  return {
    id: temporaryId,
    sectionId: data.sectionId,
    text: data.text,
    time: data.time ?? null,
    isAllDay: data.isAllDay ?? false,
    done: false,
    notified: false,
    lastResetDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 리마인더와 섹션의 서버 통신(Mutation) 및 낙관적 업데이트 로직을 전담하는 훅.
 */
export function useReminderMutations() {
  const queryClient = useQueryClient();
  const sectionsQueryKey = getSectionsControllerFindAllQueryKey();
  const remindersQueryKey = getRemindersControllerFindAllQueryKey();
  const sectionsCache = createOptimisticCache<SectionEntity, sectionsControllerFindAllResponse>(
    queryClient,
    sectionsQueryKey,
    emptySectionsResponse
  );
  const remindersCache = createOptimisticCache<ReminderEntity, remindersControllerFindAllResponse>(
    queryClient,
    remindersQueryKey,
    emptyRemindersResponse
  );

  const invalidateSections = () => {
    sectionsCache.invalidate();
  };

  const invalidateReminders = () => {
    remindersCache.invalidate();
  };

  const invalidateAll = () => {
    invalidateSections();
    invalidateReminders();
  };

  const createSection = useSectionsControllerCreate({
    mutation: {
      onMutate: ({ data }) =>
        sectionsCache.update((sections) => [...sections, createTemporarySection(data.title)]),
      onError: (_err, _new, context) => sectionsCache.rollback(context),
      onSettled: () => invalidateSections(),
    },
  });

  const updateSection = useSectionsControllerUpdate({
    mutation: {
      onMutate: ({ id, data }) =>
        sectionsCache.update((sections) =>
          sections.map((section) =>
            section.id === id ? { ...section, title: data.title ?? section.title } : section
          )
        ),
      onError: (_err, _new, context) => sectionsCache.rollback(context),
      onSettled: () => invalidateSections(),
    },
  });

  const removeSection = useSectionsControllerRemove({
    mutation: {
      onMutate: ({ id }) => sectionsCache.update((sections) => sections.filter((s) => s.id !== id)),
      onError: (_err, _new, context) => sectionsCache.rollback(context),
      onSettled: () => invalidateAll(),
    },
  });

  const createReminder = useRemindersControllerCreate({
    mutation: {
      onMutate: async ({ data }) => {
        const temporaryId = Date.now();
        const context = await remindersCache.update((reminders) => [
          ...reminders,
          createTemporaryReminder(temporaryId, data),
        ]);

        return { ...context, temporaryId };
      },
      onSuccess: (response, _variables, context) => {
        remindersCache.replaceOrAppend((item) => item.id === context?.temporaryId, response.data);
      },
      onError: (_err, _new, context) => remindersCache.rollback(context),
      onSettled: () => invalidateReminders(),
    },
  });

  const updateReminder = useRemindersControllerUpdate({
    mutation: {
      onMutate: ({ id, data }) =>
        remindersCache.update((reminders) =>
          reminders.map((reminder) => (reminder.id === id ? { ...reminder, ...data } : reminder))
        ),
      onError: (_err, _new, context) => remindersCache.rollback(context),
      onSettled: () => invalidateReminders(),
    },
  });

  const removeReminder = useRemindersControllerRemove({
    mutation: {
      onMutate: ({ id }) =>
        remindersCache.update((reminders) => reminders.filter((reminder) => reminder.id !== id)),
      onError: (_err, _new, context) => remindersCache.rollback(context),
      onSettled: () => invalidateReminders(),
    },
  });

  return {
    createSection,
    updateSection,
    removeSection,
    createReminder,
    updateReminder,
    removeReminder,
    invalidateAll,
  };
}
