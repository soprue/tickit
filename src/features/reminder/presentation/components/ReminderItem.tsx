import React from 'react';
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
 * 수정 모드 UI (React)
 */
const EditMode: React.FC<ReminderItemProps> = ({ sectionId, item }) => {
  const ui = useReminderUI();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
  React.useEffect(() => {
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
      className='relative flex items-start gap-sm no-drag p-2 -mx-2 -my-1 bg-gray-soft/30 dark:bg-white/5 rounded-lg transition-all duration-200 w-[calc(100%+1rem)] box-border'
    >
      {/* 체크박스 영역: UI Primitive 적용 */}
      <Checkbox 
        checked={item.done} 
        onChange={() => ui.toggleReminder(sectionId, item.id)} 
        className="mt-[3px]"
      />

      {/* 입력창 및 오버레이 배지 영역 */}
      <div className='relative flex-1 flex items-center min-w-0 pr-20'>
        <Input
          ref={inputRef}
          variant='underline'
          className='pb-[4px] leading-[1.2] pr-[85px]'
          defaultValue={item.text}
          onKeyDown={onEnter}
          autoFocus
        />
        
        {/* 우측 오버레이 시간 버튼: UI Primitive 적용 */}
        <div className='absolute right-0 top-[-1px]'>
          <Button
            variant={!isAllDay && selectedTime ? 'primary' : 'secondary'}
            className={`!px-2 !py-1 !text-[10px] shrink-0 ${!isAllDay && selectedTime ? '' : '!bg-white/60 dark:!bg-white/10'}`}
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon
              name='clock'
              size={10}
              color={
                !isAllDay && selectedTime ? 'white' : 'var(--color-icon-brown)'
              }
              className={
                !isAllDay && selectedTime
                  ? 'opacity-100'
                  : 'opacity-60 dark:opacity-100'
              }
            />
            <span className='ml-1.5 leading-none tracking-tight'>
              {displayTime || '시간 추가'}
            </span>
          </Button>

          {/* 시간 선택 팝오버 */}
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
};

/**
 * 일반 모드 UI (React)
 */
const ViewMode: React.FC<ReminderItemProps> = ({ sectionId, item }) => {
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
      className='flex items-start gap-sm group no-drag select-none p-2 -mx-2 -my-1 rounded-lg bg-transparent hover:bg-gray-soft/10 transition-colors duration-200 cursor-pointer relative w-[calc(100%+1rem)] box-border'
      onDoubleClick={startEdit}
      onClick={toggleDone}
    >
      {/* 체크박스: UI Primitive 적용 */}
      <Checkbox 
        checked={item.done} 
        onChange={toggleDone} 
        className="mt-[3px]"
      />

      <div className='flex flex-col flex-1 min-w-0 pr-20'>
        <p
          className={`font-medium text-[15px] m-0 leading-[1.2] transition-colors ${item.done ? 'text-gray-light line-through decoration-gray-light/50' : 'text-text-primary'}`}
        >
          {item.text}
        </p>
        {displayTime && (
          <span
            className={`font-normal text-[13px] mt-1.5 transition-colors ${item.done ? 'text-gray-light/70' : 'text-gray-medium/80'}`}
          >
            {displayTime}
          </span>
        )}
      </div>

      <div className='absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-md px-1'>
        <button
          className='bg-none border-none text-gray-light/60 cursor-pointer text-[14px] p-1 hover:text-primary transition-colors'
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          title='수정'
        >
          ✎
        </button>
        <button
          className='bg-none border-none text-gray-light/60 cursor-pointer text-[18px] p-1 hover:text-primary transition-colors leading-none'
          onClick={deleteItemAction}
          title='삭제'
        >
          ×
        </button>
      </div>
    </div>
  );
};

/**
 * 개별 리마인더 항목 컴포넌트
 */
export const ReminderItem: React.FC<ReminderItemProps> = (props) => {
  const ui = useReminderUI();
  const isEditing = ui.state.editingItemId === props.item.id;
  return isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
};

export default ReminderItem;
