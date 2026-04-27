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

  const { selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute, showTimePopover } =
    ui.state;

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') ui.updateReminder(sectionId, item.id, e.currentTarget.value);
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

  const displayTime = isAllDay ? 'All Day' : selectedTime ? formatKoreanTime(selectedTime) : '';

  return (
    <div
      ref={containerRef}
      className="gap-sm no-drag bg-gray-soft/40 relative -mx-2 -my-1 box-border flex w-[calc(100%+1rem)] items-start rounded-lg p-2 transition-all duration-200 dark:bg-white/5"
    >
      <Checkbox
        checked={item.done}
        onChange={() => ui.toggleReminder(sectionId, item.id)}
        className="mt-[3px]"
      />

      <div className="relative flex min-w-0 flex-1 items-center pr-20">
        <Input
          ref={inputRef}
          variant="underline"
          className="!text-text-primary !p-0 pr-[85px] !pb-[2px] !text-[15px] leading-[1.2] !font-medium"
          defaultValue={item.text}
          onKeyDown={onEnter}
          autoFocus
        />

        <div className="absolute top-[-1px] right-0">
          <Button
            variant={!isAllDay && selectedTime ? 'primary' : 'secondary'}
            className={`shrink-0 !px-2.5 !py-1 !text-[10px] ${!isAllDay && selectedTime ? '' : '!bg-white dark:!bg-white/10'}`}
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon
              name="clock"
              size={10}
              color={!isAllDay && selectedTime ? 'white' : 'currentColor'}
              className={!isAllDay && selectedTime ? 'opacity-100' : 'opacity-60'}
            />
            <span className="ml-1.5 leading-none tracking-tight">{displayTime || '시간 추가'}</span>
          </Button>

          {showTimePopover && (
            <div className="animate-in fade-in slide-in-from-top-1 zoom-in-95 absolute top-[calc(100%+6px)] right-0 z-[5000] origin-top-right duration-200 ease-out">
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

  const displayTime = item.isAllDay ? 'All Day' : item.time ? formatKoreanTime(item.time) : '';

  return (
    <div
      className="gap-sm group no-drag hover:bg-gray-soft relative -mx-2 -my-1 box-border flex w-[calc(100%+1rem)] cursor-pointer items-start rounded-lg bg-transparent p-2 transition-colors duration-200 select-none"
      onDoubleClick={startEdit}
      onClick={toggleDone}
    >
      <Checkbox checked={item.done} onChange={toggleDone} className="mt-[3px]" />

      <div className="flex min-w-0 flex-1 flex-col pr-20">
        <p
          className={`m-0 text-[15px] leading-[1.2] font-medium transition-colors ${item.done ? 'text-gray-light/60 decoration-gray-light/50 line-through' : 'text-text-primary'}`}
        >
          {item.text}
        </p>
        {displayTime && (
          <span
            className={`mt-1.5 text-[13px] font-normal transition-colors ${item.done ? 'text-gray-light/50' : 'text-text-secondary/80'}`}
          >
            {displayTime}
          </span>
        )}
      </div>

      <div className="absolute top-2 right-2 flex shrink-0 items-center gap-0.5 rounded-lg bg-white/90 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/60">
        <button
          className="text-gray-medium/60 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 flex h-8 w-6 cursor-pointer items-center justify-center rounded-md border-none bg-none text-[14px] transition-all"
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          title="수정"
        >
          ✎
        </button>
        <button
          className="text-gray-medium/60 flex h-8 w-6 cursor-pointer items-center justify-center rounded-md border-none bg-none transition-all hover:bg-red-500/5 hover:text-red-500 dark:hover:bg-red-500/20"
          onClick={deleteItemAction}
          title="삭제"
        >
          <Icon name="cancel" size={14} />
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
