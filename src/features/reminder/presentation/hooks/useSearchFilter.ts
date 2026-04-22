import { useState, useMemo } from 'react';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

/**
 * 리마인더 검색 및 필터링 로직을 관리하는 커스텀 훅
 * 
 * @param sections 전체 리마인더 섹션 데이터
 * @param isEditingAny 현재 어떤 항목이라도 편집 중인지 여부 (편집 중일 때는 빈 섹션도 표시)
 */
export const useSearchFilter = (sections: ReminderSectionData[], isEditingAny: boolean) => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [hideCompleted, setHideCompletedState] = useState(false);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
  };

  const toggleHideCompleted = () => {
    setHideCompletedState(prev => !prev);
  };

  // 검색어 및 완료 여부에 따른 필터링 결과 계산
  const filteredSections = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;

    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
          const matchStatus = !hideCompleted || !item.done;
          return matchSearch && matchStatus;
        })
      }))
      .filter(section => {
        // 편집 중일 때는 구조 유지를 위해 모든 섹션 표시
        if (isEditingAny) return true;
        // 검색 중일 때는 매칭되는 아이템이 있는 섹션만 표시
        if (isSearching) return section.items.length > 0;
        // 기본 상태에서는 모든 섹션 표시 (빈 섹션 포함)
        return true;
      });
  }, [sections, searchQuery, hideCompleted, isEditingAny]);

  const hasAnyMatches = useMemo(() => 
    filteredSections.some(s => s.items.length > 0),
    [filteredSections]
  );

  return {
    searchQuery,
    hideCompleted,
    filteredSections,
    hasAnyMatches,
    setSearchQuery,
    toggleHideCompleted
  };
};
