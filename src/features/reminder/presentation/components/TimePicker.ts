import jsx from '@core/JSX';
import { reminderService } from '../ReminderService';

interface TimePickerProps {
  pickerState: { ampm: string; hour: string; minute: string };
  style?: string;
}

/**
 * 독립된 시간 선택 피커 컴포넌트
 */
export const TimePicker = ({ pickerState, style = '' }: TimePickerProps) => {
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const updateTime = (key: string, val: string) => {
    reminderService.updatePickerTime(key as any, val);
  };

  return jsx`
    <div class="time-popover-box" style="${style}">
      <div class="popover-all-day" onclick="${(e: Event) => { e.stopPropagation(); reminderService.setAllDay(); }}">☀️ All Day 로 설정</div>
      <div class="mini-picker-columns">
        <div class="mini-column">
          <div class="mini-item"></div>
          ${ampmOptions.map(opt => jsx`<div class="mini-item ${pickerState.ampm === opt ? 'selected' : ''}" onclick="${() => updateTime('pickerAMPM', opt)}">${opt}</div>`)}
          <div class="mini-item"></div>
        </div>
        <div class="mini-column">
          <div class="mini-item"></div>
          ${hourOptions.map(opt => jsx`<div class="mini-item ${pickerState.hour === opt ? 'selected' : ''}" onclick="${() => updateTime('pickerHour', opt)}">${opt}</div>`)}
          <div class="mini-item"></div>
        </div>
        <div class="mini-column">
          <div class="mini-item"></div>
          ${minuteOptions.map(opt => jsx`<div class="mini-item ${pickerState.minute === opt ? 'selected' : ''}" onclick="${() => updateTime('pickerMinute', opt)}">${opt}</div>`)}
          <div class="mini-item"></div>
        </div>
      </div>
    </div>
  `;
};
