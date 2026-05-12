import React from 'react';
import { Button } from '@src/shared/presentation/components/ui/Button';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';

interface TimePickerTriggerProps {
  selectedTime: Date | undefined;
  isAllDay: boolean;
  showTimePopover: boolean;
  pickerState: {
    ampm: 'AM' | 'PM';
    hour: string;
    minute: string;
  };
  onTogglePopover: () => void;
  onUpdatePickerTime: (field: 'ampm' | 'hour' | 'minute', value: string) => void;
  onSetAllDay: (isAllDay: boolean) => void;
  buttonClassName?: string;
  popoverClassName?: string;
}

/**
 * 리마인더 시간 선택을 위한 공통 트리거 컴포넌트.
 * 시간 표시 버튼과 클릭 시 나타나는 TimePicker 팝오버를 관리합니다.
 */
export function TimePickerTrigger({
  selectedTime,
  isAllDay,
  showTimePopover,
  pickerState,
  onTogglePopover,
  onUpdatePickerTime,
  onSetAllDay,
  buttonClassName = '',
  popoverClassName = '',
}: TimePickerTriggerProps) {
  const displayTime = isAllDay ? 'All Day' : selectedTime ? formatKoreanTime(selectedTime) : '';
  const hasTime = !isAllDay && selectedTime;

  return (
    <div className="relative inline-block">
      <Button
        variant={hasTime ? 'primary' : 'secondary'}
        className={`shrink-0 !px-2.5 !py-1 !text-[10px] ${buttonClassName} ${
          !hasTime ? 'dark:!bg-white/10 !bg-white' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePopover();
        }}
      >
        <Icon
          name="clock"
          size={12}
          color={hasTime ? 'white' : 'currentColor'}
          className={hasTime ? 'opacity-100' : 'opacity-60'}
        />
        <span className="ml-1.5 leading-none tracking-tight">
          {displayTime || '시간 추가'}
        </span>
      </Button>

      {showTimePopover && (
        <div 
          className={`animate-in fade-in slide-in-from-top-1 zoom-in-95 absolute z-[5000] origin-top-right duration-200 ease-out ${popoverClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          <TimePicker
            pickerState={pickerState}
            onUpdatePickerTime={onUpdatePickerTime}
            onSetAllDay={onSetAllDay}
          />
        </div>
      )}
    </div>
  );
}

