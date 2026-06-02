import React from 'react';
import { useReminderActions } from '../context/ReminderActionsContext';
import {
  useIsAddingReminder,
  useReminderTimePickerViewState,
} from '../hooks/useReminderUISelectors';
import { InlineInput } from '@src/shared/presentation/components/ui/InlineInput';
import { TimePickerTrigger } from './TimePickerTrigger';

interface SectionFooterProps {
  category: string;
}

interface AddReminderInputProps {
  category: string;
}

function AddReminderInput({ category }: AddReminderInputProps) {
  const actions = useReminderActions();
  const { selectedTime, isAllDay, showTimePopover, pickerState } = useReminderTimePickerViewState();

  return (
    <div className="mt-0.5">
      <div className="input-area-wrapper no-drag relative flex flex-col">
        <div className="gap-sm flex min-h-[32px] items-start">
          <div className="border-gray-light mt-1.5 h-4 w-4 shrink-0 rounded-sm border-[1.5px] dark:border-white/40"></div>
          <InlineInput
            defaultValue=""
            placeholder="할 일을 입력하세요..."
            onSave={(value) => actions.addReminder(category, value)}
            onCancel={() => actions.setAddingSection(null)}
            wrapperClassName="flex-1"
            className="!text-base font-medium"
            renderRight={
              <TimePickerTrigger
                selectedTime={selectedTime}
                isAllDay={isAllDay}
                showTimePopover={showTimePopover}
                pickerState={pickerState}
                onTogglePopover={actions.toggleTimePopover}
                onUpdatePickerTime={actions.updatePickerTime}
                onSetAllDay={actions.setAllDay}
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
 * 섹션 푸터 컴포넌트
 */
export function SectionFooter({ category }: SectionFooterProps) {
  const actions = useReminderActions();
  const isAdding = useIsAddingReminder(category);

  if (isAdding) {
    return <AddReminderInput category={category} />;
  }

  return (
    <div
      className="gap-sm group no-drag hover:bg-surface-soft -mx-1 flex cursor-pointer items-start rounded-md px-1 py-1.5 transition-colors"
      onClick={() => actions.setAddingSection(category)}
    >
      <div className="border-border-alpha group-hover:border-gray-medium mt-[3.5px] h-4 w-4 shrink-0 rounded-sm border-[1.5px] border-dashed transition-colors"></div>
      <div className="flex-1">
        <p className="text-text-muted group-hover:text-text-secondary m-0 text-base leading-tight font-medium transition-colors">
          눌러서 추가하기
        </p>
      </div>
    </div>
  );
}
