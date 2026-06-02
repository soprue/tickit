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
  const filter = useSearchFilter(mappedSections, isEditingAny);
  const actions = useReminderActions({ mappedSections, edit });

  useReminderNotificationSync(mappedSections, isInitialLoading);

  return {
    state: edit.editState,
    isEditingAny,
    isLoading: isInitialLoading,
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
    ...actions,
  };
}

export type ReminderUI = ReturnType<typeof useReminderUI>;
