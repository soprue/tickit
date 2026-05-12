import React from 'react';
import { useReminderUI } from '../hooks/useReminderUI';
import { InlineInput } from '@src/shared/presentation/components/ui/InlineInput';
import { TimePickerTrigger } from './TimePickerTrigger';

interface SectionFooterProps {
  category: string;
}

/**
 * 섹션 푸터 컴포넌트
 */
export function SectionFooter({ category }: SectionFooterProps) {
  const ui = useReminderUI();
  const isAdding = ui.state.addingSectionId === category;
  const { showTimePopover, selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute } =
    ui.state;

  if (!isAdding) {
    return (
      <div
        className="gap-sm group no-drag hover:bg-gray-soft -mx-1 flex cursor-pointer items-start rounded-md px-1 py-1.5 transition-colors"
        onClick={() => ui.setAddingSection(category)}
      >
        <div className="border-gray-light group-hover:border-gray-medium mt-[3.5px] h-4 w-4 shrink-0 rounded-sm border-[1.5px] border-dashed transition-colors"></div>
        <div className="flex-1">
          <p className="text-gray-light group-hover:text-gray-medium dark:text-gray-medium/60 m-0 text-base leading-tight font-medium transition-colors">
            눌러서 추가하기
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0.5">
      <div className="input-area-wrapper no-drag relative flex flex-col">
        <div className="gap-sm flex min-h-[32px] items-start">
          <div className="border-gray-light mt-1.5 h-4 w-4 shrink-0 rounded-sm border-[1.5px] dark:border-white/40"></div>
          <InlineInput
            defaultValue=""
            placeholder="할 일을 입력하세요..."
            onSave={(value) => ui.addReminder(category, value)}
            onCancel={() => ui.setAddingSection(null)}
            wrapperClassName="flex-1"
            className="!text-base font-medium"
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
                popoverClassName="top-[34px] right-0"
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
