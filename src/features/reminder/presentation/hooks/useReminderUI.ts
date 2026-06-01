import { useMemo, useEffect } from 'react';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { REMINDER_CONFIG, IPC_CHANNELS, DELAYS } from '@src/shared/constants';
import { useEditState } from './useEditState';
import { useSearchFilter } from './useSearchFilter';
import { useActionContext } from '@src/shared/context/ActionContext';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { useReminderMutations } from './useReminderMutations';
import { ipc } from '@src/shared/utils/ipc';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

// API Hooks
import type { SectionEntity, ReminderEntity } from '@src/features/auth/infrastructure/api/model';
import { useSectionsControllerFindAll } from '@src/features/auth/infrastructure/api/sections-섹션/sections-섹션';
import { useRemindersControllerFindAll } from '@src/features/auth/infrastructure/api/reminders-리마인더/reminders-리마인더';

/**
 * 서버 데이터를 UI 형식으로 매핑하고 정렬 정책에 따라 정렬합니다.
 */
function transformServerData(sectionsData: { data: SectionEntity[] } | undefined, remindersData: { data: ReminderEntity[] } | undefined): ReminderSectionData[] {
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
    const sectionReminders = (remindersBySectionId.get(section.id) || [])
      .map((item) => ({
        id: item.id,
        text: item.text,
        time: item.time || undefined,
        isAllDay: item.isAllDay,
        notified: item.notified,
        done: item.done,
      }));

    // 정렬 정책:
    // 1. 미완료 우선: 아직 안 끝낸 일이 위로.
    // 2. 하루 종일 우선: 미완료 중에서도 시간 정해지지 않은 일이 위로.
    // 3. 시간 오름차순: 시간이 빠른 순서대로 정렬.
    // 4. 완료 항목은 아래로: 다 끝낸 일은 맨 밑으로.
    const sortedItems = [...sectionReminders].sort((a, b) => {
      // 1. 완료 여부 기준 (미완료가 위로)
      if (a.done !== b.done) return a.done ? 1 : -1;

      // 2. 미완료 중에서도 "종일(시간 없음)" 우선
      const aIsAllDay = !a.time || a.isAllDay;
      const bIsAllDay = !b.time || b.isAllDay;

      if (aIsAllDay !== bIsAllDay) return aIsAllDay ? -1 : 1;

      // 3. 둘 다 시간이 있는 경우 시간 오름차순
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
  }) as ReminderSectionData[];
}

/**
 * 리마인더 페이지의 모든 상태와 액션을 통합 관리하는 "지휘관(Facade)" 훅.
 * 리마인더 도메인 로직과 UI 상태 필터링을 연결합니다.
 */
export function useReminderUI() {
  const { showConfirm } = useModalStore((state) => state.actions);
  const { runAction } = useActionContext();
  const mutations = useReminderMutations();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. 서버 데이터 패칭
  const { data: sectionsData, isLoading: isLoadingSections, isPending: isPendingSections } = useSectionsControllerFindAll();
  const { data: remindersData, isLoading: isLoadingReminders, isPending: isPendingReminders } = useRemindersControllerFindAll();

  // 최초 로딩 여부 (데이터가 아예 없을 때만 true)
  const isInitialLoading = (isPendingSections && !sectionsData) || (isPendingReminders && !remindersData);

  // 2. 서버 데이터를 UI 형식으로 매핑 및 정렬
  const mappedSections = useMemo(
    () => transformServerData(sectionsData, remindersData),
    [sectionsData, remindersData]
  );

  const edit = useEditState(mappedSections);
  const isEditingAny = !!(
    edit.editState.addingSectionId ||
    edit.editState.editingItemId ||
    edit.editState.editingSectionId
  );

  // 필터링은 매핑된 서버 데이터를 기준으로 수행
  const filter = useSearchFilter(mappedSections, isEditingAny);

  // 3. 데이터 동기화 (Main 프로세스의 알림 서비스를 위해 최신 데이터 전달)
  useEffect(() => {
    if (isInitialLoading) return;

    const timer = setTimeout(async () => {
      try {
        // 메인 프로세스의 NotificationService로 데이터와 서버 반영용 토큰 전달
        await ipc.invoke(IPC_CHANNELS.SYNC_NOTIFICATIONS, {
          sections: mappedSections,
          accessToken,
        });
      } catch (e) {
        console.error('[useReminderUI] Sync notifications failed:', e);
      }
    }, DELAYS.SAVE_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [mappedSections, accessToken, isInitialLoading]);

  /* -------------------------------------------------------------------------- */
  /* CRUD 액션 (서버 API 호출 - 낙관적 업데이트 활용)                                 */
  /* -------------------------------------------------------------------------- */

  const addSection = () => {
    runAction(async () => {
      await mutations.createSection.mutateAsync({ data: { title: REMINDER_CONFIG.NEW_SECTION_TITLE } });
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      runAction(async () => {
        await mutations.updateSection.mutateAsync({ id: sectionId, data: { title: title } });
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
          await mutations.removeSection.mutateAsync({ id: sectionId });
        });
      },
    });
  };

  const toggleReminder = (sectionId: string, reminderId: number) => {
    const section = mappedSections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === reminderId);
    if (!item) return;

    runAction(async () => {
      await mutations.updateReminder.mutateAsync({ 
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
          await mutations.removeReminder.mutateAsync({ id: reminderId });
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
          await mutations.updateReminder.mutateAsync({
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
      await mutations.createReminder.mutateAsync({
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

export type ReminderUI = ReturnType<typeof useReminderUI>;
