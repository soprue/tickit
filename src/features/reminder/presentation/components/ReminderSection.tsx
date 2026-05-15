import React from 'react';
import { ReminderItem } from './ReminderItem';
import { Reminder } from '../../domain/reminder';
import { SectionHeader } from './SectionHeader';
import { SectionFooter } from './SectionFooter';

interface ReminderSectionProps {
  title: string;
  category: string;
  isFixed: boolean;
  items: Reminder[];
}

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export function ReminderSection({ title, category, isFixed, items }: ReminderSectionProps) {
  return (
    <section className="p-lg mb-md duration-normal gap-md box-border flex w-full min-w-[303px] flex-col rounded-lg bg-white shadow-sm transition-colors dark:bg-[#151515]">
      <SectionHeader title={title} category={category} isFixed={isFixed} />
      <div className={`flex flex-col gap-3 ${items.length === 0 ? 'hidden' : 'flex'}`}>
        {items.map((item) => (
          <ReminderItem key={item.id} sectionId={category} item={item} />
        ))}
      </div>
      <SectionFooter category={category} />
    </section>
  );
}

export default ReminderSection;

