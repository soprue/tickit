import { useMemo } from 'react';
import { useReminderSearchStore } from '@src/features/reminder/domain/ReminderSearchStore';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

/**
 * 리마인더 검색 및 필터링 로직을 관리하는 커스텀 훅
 */
export function useSearchFilter(sections: ReminderSectionData[], isEditingAny: boolean) {
  const searchQuery = useReminderSearchStore((state) => state.searchQuery);
  const filterMode = useReminderSearchStore((state) => state.filterMode);
  const setSearchQuery = useReminderSearchStore((state) => state.setSearchQuery);
  const toggleFilterMode = useReminderSearchStore((state) => state.toggleFilterMode);

  // 검색어 및 필터 모드에 따른 필터링 결과 계산
  const filteredSections = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isSearching = normalizedQuery.length > 0;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchSearch = item.text.toLowerCase().includes(normalizedQuery);

          let matchStatus = true;
          if (filterMode === 'pending') {
            matchStatus = !item.done;
          } else if (filterMode === 'completed') {
            matchStatus = item.done;
          }

          return matchSearch && matchStatus;
        }),
      }))
      .filter((section) => {
        if (isEditingAny) return true;
        if (isSearching || filterMode !== 'all') return section.items.length > 0;
        return true;
      });
  }, [sections, searchQuery, filterMode, isEditingAny]);

  const hasAnyMatches = useMemo(
    () => filteredSections.some((s) => s.items.length > 0),
    [filteredSections]
  );

  return {
    searchQuery,
    filterMode,
    filteredSections,
    hasAnyMatches,
    setSearchQuery,
    toggleFilterMode,
  };
}
