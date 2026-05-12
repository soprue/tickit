import React from 'react';
import { useReminderUI } from '../hooks/useReminderUI';
import { Checkbox } from '@src/shared/presentation/components/ui/Checkbox';
import { InlineInput } from '@src/shared/presentation/components/ui/InlineInput';
import { TimePickerTrigger } from './TimePickerTrigger';
import { Reminder } from '../../domain/reminder';

interface EditModeProps {
  sectionId: string;
  item: Reminder;
}

/**
 * 리마인더 항목 수정 모드 UI
 */
export function EditMode({ sectionId, item }: EditModeProps) {
  const ui = useReminderUI();

  const { selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute, showTimePopover } =
    ui.state;

  return (
    <div className="gap-sm no-drag bg-gray-soft/40 relative -mx-2 -my-1 box-border flex w-[calc(100%+1rem)] items-start rounded-lg p-2 transition-all duration-200 dark:bg-white/5">
      <Checkbox
        checked={item.done}
        onChange={() => ui.toggleReminder(sectionId, item.id)}
        className="mt-[3px]"
      />

      <InlineInput
        defaultValue={item.text}
        onSave={(value) => ui.updateReminder(sectionId, item.id, value)}
        onCancel={() => ui.setEditingItemId(null)}
        wrapperClassName="flex-1 pr-2"
        className="!text-[15px] !font-medium"
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
            popoverClassName="top-[calc(100%+6px)] right-0"
          />
        }
      />
    </div>
  );
}
