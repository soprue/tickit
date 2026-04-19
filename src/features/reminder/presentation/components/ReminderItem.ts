import jsx from '@core/JSX';
import clockIcon from '@assets/icons/clock.svg';
import { reminderService } from '../ReminderService';
import { Reminder } from '../../domain/reminder';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';

interface ReminderItemProps {
  sectionId: string;
  item: Reminder;
  isEditing: boolean;
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerState: { ampm: string; hour: string; minute: string };
}

/**
 * 수정 모드 UI 렌더링
 */
const EditMode = (props: ReminderItemProps) => {
  const { sectionId, item, selectedTime, isAllDay, pickerState, showTimePopover } = props;

  const onEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') reminderService.handleUpdateReminder(sectionId, item.id, (e.target as HTMLInputElement).value);
    else if (e.key === 'Escape') reminderService.setEditingItemId(null);
  };

  const onBlur = (e: FocusEvent) => {
    // 팝오버가 열려 있는 동안은 바깥 클릭으로 간주하지 않음 (편집 모드 유지)
    if (showTimePopover) return;

    const container = (e.target as HTMLElement).closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput) return;
      reminderService.handleUpdateReminder(sectionId, item.id, (e.target as HTMLInputElement).value);
    }, 250);
  };

  const badgeClass = `time-badge ${!isAllDay && selectedTime ? 'active' : ''}`;
  const checkboxClass = `checkbox-rect ${item.done ? 'done' : ''}`;
  
  const displayTime = isAllDay ? 'All Day' : (selectedTime ? formatKoreanTime(selectedTime) : '');

  return jsx`
    <form class="input-area-wrapper" onsubmit="${(e: Event) => e.preventDefault()}" style="margin-bottom: 8px;">
      <div class="input-container">
        <div class="${checkboxClass}">
          ${item.done ? jsx`<div class="icon-cancel-mask" style="pointer-events: none;"></div>` : ''}
        </div>
        <input type="text" class="reminder-inline-input" value="${item.text}" onkeydown="${onEnter}" onblur="${onBlur}" />
        <button type="button" class="${badgeClass}" onclick="${() => reminderService.toggleTimePopover()}">
          <img src="${clockIcon}" alt="time" class="time-icon" />
          <span class="time-text">${displayTime === 'All Day' ? '' : displayTime}</span>
        </button>
      </div>
      ${showTimePopover ? TimePicker({ pickerState, style: 'top: 36px;' }) : ''}
    </form>
  `;
};

/**
 * 일반 모드 UI 렌더링
 */
const ViewMode = (props: ReminderItemProps) => {
  const { sectionId, item } = props;
  
  const toggleDone = (e: MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    reminderService.handleToggleReminder(sectionId, item.id);
  };

  const startEdit = () => reminderService.setEditingItemId(item.id);
  const deleteItem = (e: MouseEvent) => {
    e.stopPropagation();
    reminderService.handleDeleteReminder(sectionId, item.id);
  };

  const rowClass = "reminder-row";
  const checkboxClass = `checkbox-rect ${item.done ? 'done' : ''}`;
  const textClass = `text-main ${item.done ? 'text-done' : ''}`;
  const timeClass = `text-time ${item.done ? 'text-done' : ''}`;

  const displayTime = item.isAllDay ? 'All Day' : (item.time ? formatKoreanTime(item.time) : '');

  return jsx`
    <div class="${rowClass}" ondblclick="${startEdit}">
      <div class="${checkboxClass}" onclick="${toggleDone}">
        ${item.done ? jsx`<div class="icon-cancel-mask" style="pointer-events: none;"></div>` : ''}
      </div>
      
      <div class="item-content" onclick="${toggleDone}" style="cursor: pointer; flex: 1;">
        <p class="${textClass}">${item.text}</p>
        ${displayTime ? jsx`<span class="${timeClass}">${displayTime}</span>` : ''}
      </div>

      <div class="item-actions">
        <button class="edit-item-btn" onclick="${(e: MouseEvent) => { e.stopPropagation(); startEdit(); }}" title="수정">✎</button>
        <button class="delete-item-btn" onclick="${deleteItem}" title="삭제">×</button>
      </div>
    </div>
  `;
};

/**
 * 개별 리마인더 항목을 렌더링하는 컴포넌트
 */
export const ReminderItem = (props: ReminderItemProps) => {
  return props.isEditing ? EditMode(props) : ViewMode(props);
};
