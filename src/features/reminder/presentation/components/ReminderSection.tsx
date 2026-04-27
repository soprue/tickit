import React from 'react';
import { ReminderItem } from './ReminderItem';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { Reminder } from '../../domain/reminder';
import { Category } from '@src/shared/constants';
import { useReminderUI } from '../hooks/useReminderUI';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';

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
    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter')
        ui.updateSectionTitle(category, e.currentTarget.value);
      else if (e.key === 'Escape') ui.setEditingSectionId(null);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.classList.contains('section-title-input') ||
            activeEl.classList.contains('reminder-inline-input'))
        )
          return;
        ui.updateSectionTitle(category, value);
      }, 200);
    };

    return (
      <div className='flex justify-between items-center'>
        <Input
          variant='underline'
          className='section-title-input !text-xl !font-bold !p-0 !pb-0 !text-primary'
          defaultValue={title}
          onKeyDown={onEnter}
          onBlur={onBlur}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className='flex justify-between items-center'>
      <h2
        className={`font-bold text-xl text-primary m-0 tracking-tight ${!isFixed ? 'cursor-pointer px-1 py-[2px] rounded-sm hover:bg-primary/5 transition-colors' : ''}`}
        onClick={() => !isFixed && ui.setEditingSectionId(category)}
        title={!isFixed ? '클릭하여 이름 수정' : ''}
      >
        {title}
      </h2>
      {!isFixed && (
        <button
          className='bg-none border-none cursor-pointer p-0 flex items-center transition-transform hover:scale-110 text-gray-light hover:text-primary dark:text-gray-medium dark:hover:text-primary'
          onClick={() => ui.deleteSection(category)}
          title='섹션 삭제'
        >
          <Icon name='minusSquare' size={18} />
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
  const {
    showTimePopover,
    selectedTime,
    isAllDay,
    pickerAMPM,
    pickerHour,
    pickerMinute,
  } = ui.state;

  if (!isAdding) {
    return (
      <div
        className='flex items-start gap-sm cursor-pointer group no-drag py-1.5 px-1 -mx-1 rounded-md hover:bg-gray-soft transition-colors'
        onClick={() => ui.setAddingSection(category)}
      >
        <div className='w-4 h-4 border-[1.5px] border-dashed border-gray-light rounded-sm shrink-0 mt-[3.5px] transition-colors group-hover:border-gray-medium'></div>
        <div className='flex-1'>
          <p className='font-medium text-base text-gray-light m-0 leading-tight transition-colors group-hover:text-gray-medium dark:text-gray-medium/60'>
            눌러서 추가하기
          </p>
        </div>
      </div>
    );
  }

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ui.addReminder(category, e.currentTarget.value);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.currentTarget.closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput =
        activeEl &&
        (activeEl.classList.contains('reminder-inline-input') ||
          activeEl.classList.contains('section-title-input'));
      if (isStillInInput || (activeEl && activeEl.closest('.time-popover-box')))
        return;
      ui.setAddingSection(null);
    }, 250);
  };

  const displayTime = isAllDay
    ? 'All Day'
    : selectedTime
      ? formatKoreanTime(selectedTime)
      : '';

  return (
    <div className='mt-0.5'>
      <form
        className='input-area-wrapper relative flex flex-col no-drag'
        onSubmit={(e) => e.preventDefault()}
      >
        <div className='flex items-center gap-sm min-h-[32px]'>
          <div className='w-4 h-4 border-[1.5px] border-gray-light rounded-sm shrink-0 dark:border-white/40'></div>
          <div className='flex-1 flex items-center'>
            <Input
              variant='underline'
              className='!pb-[2px]'
              placeholder='할 일을 입력하세요...'
              onKeyDown={onEnter}
              onBlur={onBlur}
              autoFocus
            />
          </div>
          <Button
            variant={!isAllDay && selectedTime ? 'primary' : 'secondary'}
            className='!px-2.5 !py-1 !text-xs shrink-0'
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon
              name='clock'
              size={12}
              color={!isAllDay && selectedTime ? 'white' : 'currentColor'}
              className={
                !isAllDay && selectedTime ? 'opacity-100' : 'opacity-60'
              }
            />
            <span className='ml-1.5 leading-none tracking-tight'>
              {displayTime === 'All Day' ? 'All Day' : displayTime}
            </span>
          </Button>
        </div>
        {showTimePopover && (
          <div className='absolute top-[34px] right-0 z-[500] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200 ease-out origin-top-right'>
            <TimePicker
              pickerState={{
                ampm: pickerAMPM,
                hour: pickerHour,
                minute: pickerMinute,
              }}
              onUpdatePickerTime={ui.updatePickerTime}
              onSetAllDay={ui.setAllDay}
            />
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export function ReminderSection({
  title,
  category,
  items,
}: ReminderSectionProps) {
  const isFixed = category === Category.EVERYDAY || category === Category.TODO;

  return (
    <section className='w-full min-w-[303px] bg-white rounded-lg p-lg box-border mb-md shadow-sm transition-colors duration-normal flex flex-col gap-md dark:bg-[#151515]'>
      <SectionHeader title={title} category={category} isFixed={isFixed} />
      <div
        className={`flex flex-col gap-3 ${items.length === 0 ? 'hidden' : 'flex'}`}
      >
        {items.map((item) => (
          <ReminderItem key={item.id} sectionId={category} item={item} />
        ))}
      </div>
      <SectionFooter category={category} />
    </section>
  );
}

export default ReminderSection;
