import React from 'react';
import { useReminderActions } from '../hooks/useReminderActions';
import { useReminderTimePickerViewState } from '../hooks/useReminderUISelectors';
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
export function EditMode({ item }: EditModeProps) {
  const actions = useReminderActions();
  const { selectedTime, isAllDay, showTimePopover, pickerState } = useReminderTimePickerViewState();

  return (
    <div className="gap-sm no-drag bg-gray-soft/40 relative -mx-2 -my-1 box-border flex w-[calc(100%+1rem)] items-start rounded-lg p-2 transition-all duration-200 dark:bg-white/5">
      <Checkbox
        checked={item.done}
        onChange={() => actions.toggleReminder(item)}
        className="mt-[3px]"
      />

      <InlineInput
        defaultValue={item.text}
        onSave={(value) => actions.updateReminder(item, value)}
        onCancel={() => actions.setEditingItemId(null)}
        wrapperClassName="flex-1 pr-2"
        className="!text-[15px] !font-medium"
        renderRight={
          <TimePickerTrigger
            selectedTime={selectedTime}
            isAllDay={isAllDay}
            showTimePopover={showTimePopover}
            pickerState={pickerState}
            onTogglePopover={actions.toggleTimePopover}
            onUpdatePickerTime={actions.updatePickerTime}
            onSetAllDay={actions.setAllDay}
            popoverClassName="top-[calc(100%+6px)] right-0"
          />
        }
      />
    </div>
  );
}
