import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { 
  useSectionsControllerCreate, 
  useSectionsControllerUpdate, 
  useSectionsControllerRemove,
  getSectionsControllerFindAllQueryKey,
  sectionsControllerFindAllResponse
} from '@src/features/auth/infrastructure/api/sections-섹션/sections-섹션';
import { 
  useRemindersControllerCreate, 
  useRemindersControllerUpdate, 
  useRemindersControllerRemove,
  getRemindersControllerFindAllQueryKey,
  remindersControllerFindAllResponse
} from '@src/features/auth/infrastructure/api/reminders-리마인더/reminders-리마인더';
import { SectionEntity, ReminderEntity } from '@src/features/auth/infrastructure/api/model';

type QueryResponse<TItem> = {
  data: TItem[];
  status: number;
  headers: Headers;
};

type MutationContext<TResponse> = {
  previous: TResponse | undefined;
};

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

/**
 * 리마인더와 섹션의 서버 통신(Mutation) 및 낙관적 업데이트 로직을 전담하는 훅.
 */
export function useReminderMutations() {
  const queryClient = useQueryClient();

  const invalidateSections = () => {
    queryClient.invalidateQueries({ queryKey: getSectionsControllerFindAllQueryKey() });
  };

  const invalidateReminders = () => {
    queryClient.invalidateQueries({ queryKey: getRemindersControllerFindAllQueryKey() });
  };

  const invalidateAll = () => {
    invalidateSections();
    invalidateReminders();
  };

  const handleOnMutate = async <TItem, TResponse extends QueryResponse<TItem>>(
    queryKey: QueryKey,
    fallback: () => TResponse,
    updater: (old: TResponse) => TResponse
  ) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<TResponse>(queryKey);
    queryClient.setQueryData<TResponse>(queryKey, (old) => updater(old ?? fallback()));
    return { previous };
  };

  const handleOnError = <TResponse>(queryKey: QueryKey, context: MutationContext<TResponse> | undefined) => {
    if (context?.previous) {
      queryClient.setQueryData(queryKey, context.previous);
    }
  };

  // 1. 섹션 관련 Mutations
  const createSection = useSectionsControllerCreate({
    mutation: {
      onMutate: ({ data }) => 
        handleOnMutate<SectionEntity, sectionsControllerFindAllResponse>(getSectionsControllerFindAllQueryKey(), emptySectionsResponse, (old) => ({
          ...old,
          data: [...(old?.data || []), { 
            id: 'temp-' + Date.now(), 
            title: data.title, 
            isFixed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as SectionEntity]
        })),
      onError: (_err, _new, context) => handleOnError(getSectionsControllerFindAllQueryKey(), context),
      onSettled: () => invalidateSections(),
    }
  });

  const updateSection = useSectionsControllerUpdate({
    mutation: {
      onMutate: ({ id, data }) =>
        handleOnMutate<SectionEntity, sectionsControllerFindAllResponse>(getSectionsControllerFindAllQueryKey(), emptySectionsResponse, (old) => ({
          ...old,
          data: old?.data?.map((s) => s.id === id ? { ...s, title: data.title ?? s.title } : s) || []
        })),
      onError: (_err, _new, context) => handleOnError(getSectionsControllerFindAllQueryKey(), context),
      onSettled: () => invalidateSections(),
    }
  });

  const removeSection = useSectionsControllerRemove({
    mutation: {
      onMutate: ({ id }) =>
        handleOnMutate<SectionEntity, sectionsControllerFindAllResponse>(getSectionsControllerFindAllQueryKey(), emptySectionsResponse, (old) => ({
          ...old,
          data: old?.data?.filter((s) => s.id !== id) || []
        })),
      onError: (_err, _new, context) => handleOnError(getSectionsControllerFindAllQueryKey(), context),
      onSettled: () => invalidateAll(),
    }
  });

  // 2. 리마인더 관련 Mutations
  const createReminder = useRemindersControllerCreate({
    mutation: {
      onMutate: async ({ data }) => {
        const temporaryId = Date.now();
        const now = new Date().toISOString();

        const context = await handleOnMutate<ReminderEntity, remindersControllerFindAllResponse>(
          getRemindersControllerFindAllQueryKey(),
          emptyRemindersResponse,
          (old) => ({
            ...old,
            data: [...(old?.data || []), { 
              id: temporaryId,
              sectionId: data.sectionId,
              text: data.text,
              time: data.time ?? null,
              isAllDay: data.isAllDay ?? false,
              done: false, 
              notified: false,
              createdAt: now,
              updatedAt: now
            }]
          })
        );

        return { ...context, temporaryId };
      },
      onSuccess: (response, _variables, context) => {
        queryClient.setQueryData<remindersControllerFindAllResponse>(getRemindersControllerFindAllQueryKey(), (old) => {
          const current = old ?? emptyRemindersResponse();
          const hasTemporaryItem = current.data.some((item) => item.id === context?.temporaryId);

          return {
            ...current,
            data: hasTemporaryItem
              ? current.data.map((item) => item.id === context?.temporaryId ? response.data : item)
              : [...current.data, response.data]
          };
        });
      },
      onError: (_err, _new, context) => handleOnError(getRemindersControllerFindAllQueryKey(), context),
      onSettled: () => invalidateReminders(),
    }
  });

  const updateReminder = useRemindersControllerUpdate({
    mutation: {
      onMutate: ({ id, data }) =>
        handleOnMutate<ReminderEntity, remindersControllerFindAllResponse>(getRemindersControllerFindAllQueryKey(), emptyRemindersResponse, (old) => ({
          ...old,
          data: old?.data?.map((r) => r.id === id ? { ...r, ...data } : r) || []
        })),
      onError: (_err, _new, context) => handleOnError(getRemindersControllerFindAllQueryKey(), context),
      onSettled: () => invalidateReminders(),
    }
  });

  const removeReminder = useRemindersControllerRemove({
    mutation: {
      onMutate: ({ id }) =>
        handleOnMutate<ReminderEntity, remindersControllerFindAllResponse>(getRemindersControllerFindAllQueryKey(), emptyRemindersResponse, (old) => ({
          ...old,
          data: old?.data?.filter((r) => r.id !== id) || []
        })),
      onError: (_err, _new, context) => handleOnError(getRemindersControllerFindAllQueryKey(), context),
      onSettled: () => invalidateReminders(),
    }
  });

  return {
    createSection,
    updateSection,
    removeSection,
    createReminder,
    updateReminder,
    removeReminder,
    invalidateAll
  };
}
