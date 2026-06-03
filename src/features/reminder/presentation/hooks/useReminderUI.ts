import { useEditState } from './useEditState';
import { useReminderActions } from './useReminderActions';
import { useReminderData } from './useReminderData';
import { useReminderNotificationSync } from './useReminderNotificationSync';
import { useSearchFilter } from './useSearchFilter';

/**
 * 리마인더 페이지의 서버 데이터, UI 상태, 액션을 조립하는 facade hook.
 */
export function useReminderUI() {
  const { mappedSections, isInitialLoading } = useReminderData();
  const edit = useEditState(mappedSections);
  const isEditingAny = !!(
    edit.editState.addingSectionId ||
    edit.editState.editingItemId ||
    edit.editState.editingSectionId
  );
  const filter = useSearchFilter(mappedSections);
  const actions = useReminderActions();

  useReminderNotificationSync(mappedSections, isInitialLoading);

  return {
    data: {
      sections: mappedSections,
      filteredSections: filter.filteredSections,
      hasAnyMatches: filter.hasAnyMatches,
    },
    filter: {
      searchQuery: filter.searchQuery,
      filterMode: filter.filterMode,
      setSearchQuery: filter.setSearchQuery,
      toggleFilterMode: filter.toggleFilterMode,
    },
    edit: {
      state: edit.editState,
      isEditingAny,
      setEditingItemId: edit.setEditingItemId,
      setEditingSectionId: edit.setEditingSectionId,
      setAddingSection: edit.setAddingSection,
    },
    timePicker: {
      toggleTimePopover: edit.toggleTimePopover,
      updatePickerTime: edit.updatePickerTime,
      setAllDay: edit.setAllDay,
    },
    actions,
    status: {
      isLoading: isInitialLoading,
    },
  };
}

export type ReminderUI = ReturnType<typeof useReminderUI>;
