import React from 'react';
import { ReminderItem } from './ReminderItem';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { Reminder } from '../../domain/reminder';
import { Category } from '@src/shared/constants';
import { useReminderUI } from '../hooks/useReminderUI';
import { InlineInput } from '@src/shared/presentation/components/ui/InlineInput';
import { TimePickerTrigger } from './TimePickerTrigger';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: Reminder[];
}

/**
 * 섹션 헤더
 */
function SectionHeader({
  title,
  category,
  isFixed,
}: {
  title: string;
  category: string;
  isFixed: boolean;
}) {
  const ui = useReminderUI();
  const isEditingTitle = ui.state.editingSectionId === category;

  if (isEditingTitle && !isFixed) {
    return (
      <div className="flex items-center justify-between">
        <InlineInput
          defaultValue={title}
          onSave={(value) => ui.updateSectionTitle(category, value)}
          onCancel={() => ui.setEditingSectionId(null)}
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
        onClick={() => !isFixed && ui.setEditingSectionId(category)}
        title={!isFixed ? '클릭하여 이름 수정' : ''}
      >
        {title}
      </h2>
      {!isFixed && (
        <button
          className="text-gray-light hover:text-primary dark:text-gray-medium dark:hover:text-primary flex cursor-pointer items-center border-none bg-none p-0 transition-transform hover:scale-110"
          onClick={() => ui.deleteSection(category)}
          title="섹션 삭제"
        >
          <Icon name="minusSquare" size={18} />
        </button>
      )}
    </div>
  );
}

/**
 * 섹션 푸터
 */
function SectionFooter({ category }: { category: string }) {
  const ui = useReminderUI();
  const isAdding = ui.state.addingSectionId === category;
  const { showTimePopover, selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute } =
    ui.state;

  if (!isAdding) {
    return (
      <div
        className="gap-sm group no-drag hover:bg-gray-soft -mx-1 flex cursor-pointer items-start rounded-md px-1 py-1.5 transition-colors"
        onClick={() => ui.setAddingSection(category)}
      >
        <div className="border-gray-light group-hover:border-gray-medium mt-[3.5px] h-4 w-4 shrink-0 rounded-sm border-[1.5px] border-dashed transition-colors"></div>
        <div className="flex-1">
          <p className="text-gray-light group-hover:text-gray-medium dark:text-gray-medium/60 m-0 text-base leading-tight font-medium transition-colors">
            눌러서 추가하기
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0.5">
      <div className="input-area-wrapper no-drag relative flex flex-col">
        <div className="gap-sm flex min-h-[32px] items-start">
          <div className="border-gray-light mt-1.5 h-4 w-4 shrink-0 rounded-sm border-[1.5px] dark:border-white/40"></div>
          <InlineInput
            defaultValue=""
            placeholder="할 일을 입력하세요..."
            onSave={(value) => ui.addReminder(category, value)}
            onCancel={() => ui.setAddingSection(null)}
            wrapperClassName="flex-1"
            className="!text-base font-medium"
            renderRight={
              <TimePickerTrigger
                selectedTime={selectedTime}
                isAllDay={isAllDay}
                showTimePopover={showTimePopover}
                pickerState={{
                  ampm: pickerAMPM,
                  hour: pickerHour,
                  minute: pickerMinute,
                }}
                onTogglePopover={ui.toggleTimePopover}
                onUpdatePickerTime={ui.updatePickerTime}
                onSetAllDay={ui.setAllDay}
                popoverClassName="top-[34px] right-0"
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export function ReminderSection({ title, category, items }: ReminderSectionProps) {
  const isFixed = category === Category.EVERYDAY || category === Category.TODO;

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
