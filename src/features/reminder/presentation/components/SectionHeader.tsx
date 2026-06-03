import React from 'react';
import { useReminderActions } from '../hooks/useReminderActions';
import { useIsSectionTitleEditing } from '../hooks/useReminderUISelectors';
import { InlineInput } from '@src/shared/presentation/components/ui/InlineInput';
import { Icon } from '@src/shared/presentation/components/Icon';

interface SectionHeaderProps {
  title: string;
  category: string;
  isFixed: boolean;
}

/**
 * 섹션 헤더 컴포넌트
 */
export function SectionHeader({ title, category, isFixed }: SectionHeaderProps) {
  const actions = useReminderActions();
  const isEditingTitle = useIsSectionTitleEditing(category);

  if (isEditingTitle && !isFixed) {
    return (
      <div className="flex items-center justify-between">
        <InlineInput
          defaultValue={title}
          onSave={(value) => actions.updateSectionTitle(category, value)}
          onCancel={() => actions.setEditingSectionId(null)}
          className="!text-primary !text-xl !font-bold"
          wrapperClassName="w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <h2
        className={`text-primary m-0 text-xl font-bold tracking-tight ${!isFixed ? 'hover:bg-primary/5 cursor-pointer rounded-sm px-1 py-[2px] transition-colors' : ''}`}
        onClick={() => !isFixed && actions.setEditingSectionId(category)}
        title={!isFixed ? '클릭하여 이름 수정' : ''}
      >
        {title}
      </h2>
      {!isFixed && (
        <button
          className="text-gray-light hover:text-primary dark:text-gray-medium dark:hover:text-primary flex cursor-pointer items-center border-none bg-none p-0 transition-transform hover:scale-110"
          onClick={() => actions.deleteSection(category)}
          title="섹션 삭제"
        >
          <Icon name="minusSquare" size={18} />
        </button>
      )}
    </div>
  );
}
