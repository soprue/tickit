import React, { useRef, useEffect } from 'react';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Reminder } from '../../domain/reminder';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { useReminderUI } from '../hooks/useReminderUI';
import { Checkbox } from '@src/shared/presentation/components/ui/Checkbox';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Input } from '@src/shared/presentation/components/ui/Input';

interface ReminderItemProps {
  sectionId: string;
  item: Reminder;
}

/**
 * 수정 모드 UI
 */
function EditMode({ sectionId, item }: ReminderItemProps) {
  const ui = useReminderUI();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    selectedTime,
    isAllDay,
    pickerAMPM,
    pickerHour,
    pickerMinute,
    showTimePopover,
  } = ui.state;

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')
      ui.updateReminder(sectionId, item.id, e.currentTarget.value);
    else if (e.key === 'Escape') ui.setEditingItemId(null);
  };

  // 영역 외 클릭 시 자동 저장 로직
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const value = inputRef.current?.value || item.text;
        ui.updateReminder(sectionId, item.id, value);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ui, sectionId, item.id, item.text]);

  const displayTime = isAllDay
    ? 'All Day'
    : selectedTime
      ? formatKoreanTime(selectedTime)
      : '';

  return (
    <div
      ref={containerRef}
      className='relative flex items-start gap-sm no-drag p-2 -mx-2 -my-1 bg-gray-soft/40 dark:bg-white/5 rounded-lg transition-all duration-200 w-[calc(100%+1rem)] box-border'
    >
      <Checkbox 
        checked={item.done} 
        onChange={() => ui.toggleReminder(sectionId, item.id)} 
        className="mt-[3px]"
      />

      <div className='relative flex-1 flex items-center min-w-0 pr-20'>
        <Input
          ref={inputRef}
          variant='underline'
          className='!text-[15px] !font-medium !p-0 !pb-[2px] leading-[1.2] pr-[85px] !text-text-primary'
          defaultValue={item.text}
          onKeyDown={onEnter}
          autoFocus
        />
        
        <div className='absolute right-0 top-[-1px]'>
          <Button
            variant={!isAllDay && selectedTime ? 'primary' : 'secondary'}
            className={`!px-2.5 !py-1 !text-[10px] shrink-0 ${!isAllDay && selectedTime ? '' : '!bg-white dark:!bg-white/10'}`}
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon
              name='clock'
              size={10}
              color={!isAllDay && selectedTime ? 'white' : 'currentColor'}
              className={!isAllDay && selectedTime ? 'opacity-100' : 'opacity-60'}
            />
            <span className='ml-1.5 leading-none tracking-tight'>
              {displayTime || '시간 추가'}
            </span>
          </Button>

          {showTimePopover && (
            <div className='absolute top-[calc(100%+6px)] right-0 z-[5000] animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200 ease-out origin-top-right'>
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
        </div>
      </div>
    </div>
  );
}

/**
 * 일반 모드 UI
 */
function ViewMode({ sectionId, item }: ReminderItemProps) {
  const ui = useReminderUI();

  const toggleDone = () => {
    ui.toggleReminder(sectionId, item.id);
  };

  const startEdit = () => ui.setEditingItemId(item.id);
  const deleteItemAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    ui.deleteReminder(sectionId, item.id);
  };

  const displayTime = item.isAllDay
    ? 'All Day'
    : item.time
      ? formatKoreanTime(item.time)
      : '';

  return (
    <div
      className='flex items-start gap-sm group no-drag select-none p-2 -mx-2 -my-1 rounded-lg bg-transparent hover:bg-gray-soft transition-colors duration-200 cursor-pointer relative w-[calc(100%+1rem)] box-border'
      onDoubleClick={startEdit}
      onClick={toggleDone}
    >
      <Checkbox 
        checked={item.done} 
        onChange={toggleDone} 
        className="mt-[3px]"
      />

      <div className='flex flex-col flex-1 min-w-0 pr-20'>
        <p
          className={`font-medium text-[15px] m-0 leading-[1.2] transition-colors ${item.done ? 'text-gray-light/60 line-through decoration-gray-light/50' : 'text-text-primary'}`}
        >
          {item.text}
        </p>
        {displayTime && (
          <span
            className={`font-normal text-[13px] mt-1.5 transition-colors ${item.done ? 'text-gray-light/50' : 'text-text-secondary/80'}`}
          >
            {displayTime}
          </span>
        )}
      </div>

      <div className='absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-lg px-1 py-0.5 border border-black/5 dark:border-white/5'>
        <button
          className='bg-none border-none text-gray-medium/60 cursor-pointer text-[14px] p-1.5 hover:text-primary transition-colors'
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          title='수정'
        >
          ✎
        </button>
        <button
          className='bg-none border-none text-gray-medium/60 cursor-pointer text-[18px] p-1 hover:text-red-500 transition-colors leading-none'
          onClick={deleteItemAction}
          title='삭제'
        >
          <Icon name="cancel" size={14} className="mt-0.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * 개별 리마인더 항목 컴포넌트
 */
export function ReminderItem(props: ReminderItemProps) {
  const ui = useReminderUI();
  const isEditing = ui.state.editingItemId === props.item.id;
  return isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
}

export default ReminderItem;
