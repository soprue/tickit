import React from 'react';
import { Icon } from '@src/shared/presentation/components/Icon';
import { Reminder } from '../../domain/reminder';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { useReminderUI } from '../hooks/useReminderUI';

interface ReminderItemProps {
  sectionId: string;
  item: Reminder;
}

/**
 * 수정 모드 UI (React)
 */
const EditMode: React.FC<ReminderItemProps> = ({ sectionId, item }) => {
  const ui = useReminderUI();
  const formRef = React.useRef<HTMLFormElement>(null);
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
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
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
    <form
      ref={formRef}
      className='input-area-wrapper relative flex items-start gap-sm no-drag p-2 -mx-2 -my-1.5 bg-gray-soft/30 dark:bg-white/5 rounded-lg animate-in fade-in zoom-in-95 duration-200 ease-out'
      onSubmit={(e) => e.preventDefault()}
    >
      {/* 체크박스 영역: 위치 고정 */}
      <div
        className={`w-4 h-4 border-[1.5px] rounded-sm shrink-0 mt-[3px] flex justify-center items-center transition-colors ${item.done ? 'border-gray-light text-gray-light' : 'border-icon-brown dark:border-white/40'}`}
      >
        {item.done && <Icon name='cancel' size={7} />}
      </div>

      {/* 입력 및 시간 버튼 영역: 우측 끝까지 확장 */}
      <div className='flex flex-col flex-1 min-w-0 gap-1.5'>
        <input
          ref={inputRef}
          type='text'
          className='reminder-inline-input w-full bg-transparent border-b-[1.5px] border-primary/20 focus:border-primary/60 outline-none text-[15px] font-medium text-black dark:text-white placeholder:text-gray-medium/40 p-0 pb-[1px] leading-tight transition-all duration-200'
          defaultValue={item.text}
          onKeyDown={onEnter}
          autoFocus
        />
        
        <div className='flex justify-start animate-in fade-in slide-in-from-top-1 duration-200'>
          <button
            type='button'
            className={`flex items-center gap-1 px-[6px] py-[2.5px] rounded-md text-[10px] font-bold transition-all shrink-0 active:scale-95 border-none ${!isAllDay && selectedTime ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-white dark:bg-white/10 text-gray-dark/70 hover:bg-gray-light dark:text-gray-medium'}`}
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
            <span className='leading-none tracking-tight'>
              {displayTime || '시간 추가'}
            </span>
          </button>
        </div>
      </div>

      {/* 시간 선택 팝오버: 배지 아래에 밀착 */}
      {showTimePopover && (
        <div className='absolute top-[100%] left-[32px] z-[500] mt-1 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200 ease-out origin-top-left'>
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
  );
};

/**
 * 일반 모드 UI (React)
 */
const ViewMode: React.FC<ReminderItemProps> = ({ sectionId, item }) => {
  const ui = useReminderUI();

  const toggleDone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      className='flex items-start gap-sm group no-drag select-none py-[2px]'
      onDoubleClick={startEdit}
    >
      <div
        className={`w-4 h-4 border-[1.5px] rounded-sm shrink-0 mt-[3px] flex justify-center items-center cursor-pointer transition-colors ${item.done ? 'border-gray-light text-gray-light' : 'border-icon-brown dark:border-white/40'}`}
        onClick={toggleDone}
      >
        {item.done && <Icon name='cancel' size={7} />}
      </div>

      <div className='flex flex-col flex-1 cursor-pointer' onClick={toggleDone}>
        <p
          className={`font-medium text-[15px] m-0 leading-tight transition-colors ${item.done ? 'text-gray-light line-through decoration-gray-light/50' : 'text-black dark:text-white'}`}
        >
          {item.text}
        </p>
        {displayTime && (
          <span
            className={`font-normal text-[13px] mt-1 transition-colors ${item.done ? 'text-gray-light/70' : 'text-gray-medium/80'}`}
          >
            {displayTime}
          </span>
        )}
      </div>

      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2'>
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
