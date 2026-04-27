import { useMemo } from 'react';
import { useReminderUIStore } from '@src/features/reminder/domain/ReminderUIStore';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

/**
 * 전역 UI 스토어를 활용하여 리마인더 검색 및 필터링 로직을 관리하는 커스텀 훅
 */
export const useSearchFilter = (sections: ReminderSectionData[], isEditingAny: boolean) => {
  const { searchQuery, hideCompleted, setSearchQuery, toggleHideCompleted } = useReminderUIStore();

  // 검색어 및 완료 여부에 따른 필터링 결과 계산
  const filteredSections = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
          const matchStatus = !hideCompleted || !item.done;
          return matchSearch && matchStatus;
        }),
      }))
      .filter((section) => {
        if (isEditingAny) return true;
        if (isSearching) return section.items.length > 0;
        return true;
      });
  }, [sections, searchQuery, hideCompleted, isEditingAny]);

  const hasAnyMatches = useMemo(
    () => filteredSections.some((s) => s.items.length > 0),
    [filteredSections]
  );

  return {
    searchQuery,
    hideCompleted,
    filteredSections,
    hasAnyMatches,
    setSearchQuery,
    toggleHideCompleted,
  };
};
