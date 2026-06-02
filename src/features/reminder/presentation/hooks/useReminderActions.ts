import { useModalStore } from '@src/shared/domain/ModalStore';
import { REMINDER_CONFIG } from '@src/shared/constants';
import { useActionContext } from '@src/shared/context/ActionContext';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';
import { useReminderMutations } from './useReminderMutations';
import type { ReminderEditController } from './useEditState';

interface UseReminderActionsParams {
  mappedSections: ReminderSectionData[];
  edit: ReminderEditController;
}

export function useReminderActions({ mappedSections, edit }: UseReminderActionsParams) {
  const { showConfirm } = useModalStore((state) => state.actions);
  const { runAction } = useActionContext();
  const mutations = useReminderMutations();

  const addSection = () => {
    runAction(async () => {
      await mutations.createSection.mutateAsync({
        data: { title: REMINDER_CONFIG.NEW_SECTION_TITLE },
      });
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (title.trim()) {
      runAction(async () => {
        await mutations.updateSection.mutateAsync({ id: sectionId, data: { title } });
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
    const section = mappedSections.find((s) => s.id === sectionId);
    const item = section?.items.find((i) => i.id === reminderId);
    if (!item) return;

    runAction(async () => {
      await mutations.updateReminder.mutateAsync({
        id: reminderId,
        data: { done: !item.done },
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

      const hasTextChanged = item.text !== text;
      const hasTimeChanged = item.time !== timeString;
      const hasAllDayChanged = item.isAllDay !== finalIsAllDay;

      if (hasTextChanged || hasTimeChanged || hasAllDayChanged) {
        runAction(async () => {
          await mutations.updateReminder.mutateAsync({
            id: reminderId,
            data: {
              text,
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

    const finalIsAllDay = selectedTime ? isAllDay : true;

    runAction(async () => {
      await mutations.createReminder.mutateAsync({
        data: {
          sectionId,
          text,
          time: selectedTime?.toISOString(),
          isAllDay: finalIsAllDay,
        },
      });
    });
    edit.setAddingSection(null);
  };

  return {
    addSection,
    updateSectionTitle,
    deleteSection,
    toggleReminder,
    deleteReminder,
    updateReminder,
    addReminder,
  };
}
