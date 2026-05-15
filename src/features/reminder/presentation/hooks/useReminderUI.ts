import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { REMINDER_CONFIG, DELAYS } from '@src/shared/constants';
import { useEditState } from './useEditState';
import { useSearchFilter } from './useSearchFilter';
import { useActionContext } from '@src/shared/context/ActionContext';

// API Hooks
import { 
  useSectionsControllerFindAll, 
  getSectionsControllerFindAllQueryKey,
  useSectionsControllerCreate,
  useSectionsControllerUpdate,
  useSectionsControllerRemove
} from '@src/features/auth/infrastructure/api/sections-섹션/sections-섹션';
import { 
  useRemindersControllerFindAll, 
  getRemindersControllerFindAllQueryKey,
  useRemindersControllerCreate,
  useRemindersControllerUpdate,
  useRemindersControllerRemove
} from '@src/features/auth/infrastructure/api/reminders-리마인더/reminders-리마인더';
import { ReminderSectionData } from '../../domain/reminder';

/**
 * 리마인더 페이지의 모든 상태와 액션을 통합 관리하는 "지휘관(Facade)" 훅.
 * 리마인더 도메인 로직과 UI 상태 필터링을 연결합니다.
 */
export function useReminderUI() {
  const queryClient = useQueryClient();
  const { showConfirm } = useModalStore((state) => state.actions);
  const { runAction } = useActionContext();

  // 1. 서버 데이터 패칭
  const { data: sectionsData, isLoading: isLoadingSections, isPending: isPendingSections } = useSectionsControllerFindAll();
  const { data: remindersData, isLoading: isLoadingReminders, isPending: isPendingReminders } = useRemindersControllerFindAll();

  // 최초 로딩 여부 (데이터가 아예 없을 때만 true)
  const isInitialLoading = (isPendingSections && !sectionsData) || (isPendingReminders && !remindersData);

  // 2. 서버 데이터를 UI 형식으로 매핑
  const mappedSections = useMemo(() => {
    // 서버 응답이 { success: boolean, data: T[] } 구조임
    const sections = (sectionsData as any)?.data || [];
    const reminders = (remindersData as any)?.data || [];

    return sections.map((section: any) => ({
      id: section.id,
      title: section.title,
      isFixed: section.isFixed,
      items: reminders
        .filter((item: any) => item.sectionId === section.id)
        .map((item: any) => ({
          id: item.id,
          text: item.text,
          time: item.time || undefined,
          isAllDay: item.isAllDay,
          notified: item.notified,
          done: item.done,
        })),
    })) as ReminderSectionData[];
  }, [sectionsData, remindersData]);

  // 3. 뮤테이션 설정 (Optimistic Updates)
  const { mutateAsync: createSectionMutation } = useSectionsControllerCreate({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getSectionsControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getSectionsControllerFindAllQueryKey());
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: [...(old?.data || []), { id: 'temp-' + Date.now(), title: data.title, isFixed: false }]
        }));
        return { previous };
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const { mutateAsync: updateSectionMutation } = useSectionsControllerUpdate({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: getSectionsControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getSectionsControllerFindAllQueryKey());
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: old?.data?.map((s: any) => s.id === id ? { ...s, title: data.title } : s)
        }));
        return { previous };
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const { mutateAsync: removeSectionMutation } = useSectionsControllerRemove({
    mutation: {
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({ queryKey: getSectionsControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getSectionsControllerFindAllQueryKey());
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: old?.data?.filter((s: any) => s.id !== id)
        }));
        return { previous };
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getSectionsControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const { mutateAsync: createReminderMutation } = useRemindersControllerCreate({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getRemindersControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getRemindersControllerFindAllQueryKey());
        
        // 낙관적 업데이트: 임시 ID 주입
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: [...(old?.data || []), { 
            id: 'temp-' + Date.now(), 
            ...data, 
            done: false, 
            notified: false 
          }]
        }));
        return { previous };
      },
      onSuccess: (response) => {
        // 성공 즉시 서버에서 준 실제 데이터로 캐시 교체 (깜빡임 방지 핵심)
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), (old: any) => {
          const newData = old?.data?.filter((item: any) => typeof item.id !== 'string') || [];
          return {
            ...old,
            data: [...newData, response.data]
          };
        });
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const { mutateAsync: updateReminderMutation } = useRemindersControllerUpdate({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: getRemindersControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getRemindersControllerFindAllQueryKey());
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: old?.data?.map((r: any) => r.id === id ? { ...r, ...data } : r)
        }));
        return { previous };
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const { mutateAsync: removeReminderMutation } = useRemindersControllerRemove({
    mutation: {
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries({ queryKey: getRemindersControllerFindAllQueryKey() });
        const previous = queryClient.getQueryData(getRemindersControllerFindAllQueryKey());
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), (old: any) => ({
          ...old,
          data: old?.data?.filter((r: any) => r.id !== id)
        }));
        return { previous };
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(getRemindersControllerFindAllQueryKey(), context?.previous);
      },
      onSettled: () => invalidateAll(),
    }
  });

  const edit = useEditState(mappedSections);
  const isEditingAny = !!(
    edit.editState.addingSectionId ||
    edit.editState.editingItemId ||
    edit.editState.editingSectionId
  );

  // 필터링은 매핑된 서버 데이터를 기준으로 수행
  const filter = useSearchFilter(mappedSections, isEditingAny);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getSectionsControllerFindAllQueryKey() });
    queryClient.invalidateQueries({ queryKey: getRemindersControllerFindAllQueryKey() });
  };

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션 (서버 API 호출 - 낙관적 업데이트 활용)                                 */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    runAction(async () => {
      await createSectionMutation({ data: { title: REMINDER_CONFIG.NEW_SECTION_TITLE } });
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      runAction(async () => {
        await updateSectionMutation({ id: sectionId, data: { title: title } });
      });
    }
    edit.clearEditState();
  };

  const deleteSection = (sectionId: string) => {
    showConfirm({
      title: '섹션 삭제',
      message: '이 섹션을 삭제하시겠습니까? 섹션 내 모든 리마인더가 삭제됩니다.',
      onConfirm: () => {
        runAction(async () => {
          await removeSectionMutation({ id: sectionId });
        });
      },
    });
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    const section = mappedSections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === reminderId);
    if (!item) return;

    runAction(async () => {
      await updateReminderMutation({ 
        id: reminderId, 
        data: { done: !item.done } 
      });
    });
  };

  const deleteReminder = (sectionId: string, reminderId: number) => {
    showConfirm({
      title: '리마인더 삭제',
      message: '이 항목을 삭제하시겠습니까?',
      onConfirm: () => {
        runAction(async () => {
          await removeReminderMutation({ id: reminderId });
        });
      },
    });
  };

  const updateReminder = (sectionId: string, reminderId: number, text: string) => {
    const { editingItemId, selectedTime, isAllDay } = edit.editState;
    if (editingItemId !== reminderId) return;

    const section = mappedSections.find((s) => s.id === sectionId);
    const item = section?.items.find((i) => i.id === reminderId);

    if (item && text.trim()) {
      const finalIsAllDay = selectedTime ? isAllDay : true;
      const timeString = selectedTime?.toISOString();

      // 텍스트, 시간, All Day 여부 중 하나라도 바뀌었는지 확인
      const hasTextChanged = item.text !== text;
      const hasTimeChanged = item.time !== timeString;
      const hasAllDayChanged = item.isAllDay !== finalIsAllDay;

      if (hasTextChanged || hasTimeChanged || hasAllDayChanged) {
        runAction(async () => {
          await updateReminderMutation({
            id: reminderId,
            data: {
              text: text,
              time: timeString,
              isAllDay: finalIsAllDay,
            },
          });
        });
      }
    }
    edit.clearEditState();
  };

  const addReminder = (sectionId: string, text: string) => {
    const { addingSectionId, selectedTime, isAllDay } = edit.editState;
    if (addingSectionId !== sectionId) return;
    if (!text.trim()) return;

    // 시간이 명시적으로 선택되지 않았다면 isAllDay를 true로 간주
    const finalIsAllDay = selectedTime ? isAllDay : true;

    runAction(async () => {
      await createReminderMutation({
        data: {
          sectionId,
          text: text,
          time: selectedTime?.toISOString(),
          isAllDay: finalIsAllDay,
        }
      });
    });
    edit.setAddingSection(null);
  };

  return {
    state: edit.editState,
    isEditingAny,
    isLoading: isInitialLoading, // isLoading 대신 isInitialLoading 반환
    setEditingItemId: edit.setEditingItemId,
    setEditingSectionId: edit.setEditingSectionId,
    setAddingSection: edit.setAddingSection,
    toggleTimePopover: edit.toggleTimePopover,
    updatePickerTime: edit.updatePickerTime,
    setAllDay: edit.setAllDay,
    searchQuery: filter.searchQuery,
    filterMode: filter.filterMode,
    filteredSections: filter.filteredSections,
    hasAnyMatches: filter.hasAnyMatches,
    setSearchQuery: filter.setSearchQuery,
    toggleFilterMode: filter.toggleFilterMode,
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
  };
}

