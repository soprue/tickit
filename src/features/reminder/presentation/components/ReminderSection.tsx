import React from 'react';
import { ReminderItem } from './ReminderItem';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { Reminder } from '../../domain/reminder';
import { useReminderUI } from '../hooks/useReminderUI';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: Reminder[];
}

/**
 * 섹션 헤더 (React)
 */
const SectionHeader: React.FC<{
  title: string;
  category: string;
  isFixed: boolean;
}> = ({ title, category, isFixed }) => {
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
        <input
          type='text'
          className='section-title-input font-bold text-xl text-primary bg-transparent border-none border-b-2 border-primary outline-none p-0 m-0 w-full tracking-tight'
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
          className='bg-none border-none cursor-pointer p-0 flex items-center transition-transform hover:scale-110 text-gray-light hover:text-primary'
          onClick={() => ui.deleteSection(category)}
          title='섹션 삭제'
        >
          <Icon name='minusSquare' size={18} />
        </button>
      )}
    </div>
  );
};

/**
 * 섹션 푸터 (React)
 */
const SectionFooter: React.FC<{
  category: string;
}> = ({ category }) => {
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
        className='flex items-start gap-sm cursor-pointer group no-drag'
        onClick={() => ui.setAddingSection(category)}
      >
        <div className='w-4 h-4 border-[1.5px] border-dashed border-gray-light rounded-sm shrink-0 mt-[3px] transition-colors group-hover:border-primary/50'></div>
        <div className='flex-1'>
          <p className='font-medium text-base text-gray-light m-0 leading-tight transition-colors group-hover:text-primary/60 dark:text-gray-medium/60'>
            눌러서 추가하기
          </p>
        </div>
      </div>
    );
  }

  const badgeClass = `flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all ${!isAllDay && selectedTime ? 'bg-primary text-white' : 'bg-gray-soft text-gray-medium hover:bg-gray-light'}`;

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
    <div className='mt-[-2px]'>
      <form
        className='input-area-wrapper relative flex flex-col no-drag'
        onSubmit={(e) => e.preventDefault()}
      >
        <div className='flex items-center gap-sm'>
          <div className='w-4 h-4 border-[1.5px] border-icon-brown rounded-sm shrink-0 mt-[2px] dark:border-white/40'></div>
          <input
            type='text'
            className='reminder-inline-input flex-1 bg-transparent border-none outline-none text-base font-medium text-black dark:text-white placeholder:text-gray-medium/40 p-0 leading-tight'
            placeholder='할 일을 입력하세요...'
            onKeyDown={onEnter}
            onBlur={onBlur}
            autoFocus
          />
          <button
            type='button'
            className={`flex items-center gap-1 px-[6px] py-[3px] rounded-md text-[11px] font-bold transition-all shrink-0 ${!isAllDay && selectedTime ? 'bg-primary text-white shadow-sm' : 'bg-gray-soft text-gray-medium/60 hover:bg-gray-light dark:bg-white/5 dark:text-gray-medium/60'}`}
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon
              name='clock'
              size={12}
              color={!isAllDay && selectedTime ? 'white' : 'currentColor'}
            />
            <span className='leading-none'>
              {displayTime === 'All Day' ? 'All Day' : displayTime}
            </span>
          </button>
        </div>
        {showTimePopover && (
          <div className='absolute top-[0px] right-0 z-500 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200 ease-out origin-top-right'>
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
};

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection: React.FC<ReminderSectionProps> = ({
  title,
  category,
  items,
}) => {
  const isFixed = category === 'EVERYDAY' || category === 'TODO';

  return (
    <section className='w-full min-w-[303px] bg-white rounded-lg p-lg box-border mb-md shadow-sm transition-colors duration-normal flex flex-col gap-lg dark:bg-[#151515]'>
      <SectionHeader title={title} category={category} isFixed={isFixed} />
      <div
        className={`flex flex-col gap-lg ${items.length === 0 ? 'hidden' : 'flex'}`}
      >
        {items.map((item) => (
          <ReminderItem key={item.id} sectionId={category} item={item} />
        ))}
      </div>
      <SectionFooter category={category} />
    </section>
  );
};

export default ReminderSection;
