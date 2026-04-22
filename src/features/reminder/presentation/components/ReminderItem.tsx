import React from 'react';
import { Icon } from '@src/shared/presentation/components/Icon';
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
  onToggleReminder: (sectionId: string, reminderId: number) => void;
  onDeleteReminder: (sectionId: string, reminderId: number) => void;
  onUpdateReminder: (sectionId: string, reminderId: number, text: string) => void;
  onSetEditingItemId: (reminderId: number | null) => void;
  onToggleTimePopover: () => void;
  onUpdatePickerTime: (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => void;
  onSetAllDay: () => void;
}

/**
 * 수정 모드 UI (React)
 */
const EditMode: React.FC<ReminderItemProps> = (props) => {
  const { sectionId, item, selectedTime, isAllDay, pickerState, showTimePopover, onUpdateReminder, onSetEditingItemId, onToggleTimePopover, onUpdatePickerTime, onSetAllDay } = props;

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onUpdateReminder(sectionId, item.id, e.currentTarget.value);
    else if (e.key === 'Escape') onSetEditingItemId(null);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (showTimePopover) return;

    const container = e.currentTarget.closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    
    const value = e.currentTarget.value;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput) return;
      onUpdateReminder(sectionId, item.id, value);
    }, 250);
  };

  const badgeClass = `time-badge ${!isAllDay && selectedTime ? 'active' : ''}`;
  const checkboxClass = `checkbox-rect ${item.done ? 'done' : ''}`;
  const displayTime = isAllDay ? 'All Day' : (selectedTime ? formatKoreanTime(selectedTime) : '');

  return (
    <form className="input-area-wrapper" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: '8px' }}>
      <div className="input-container">
        <div className={checkboxClass}>
          {item.done && <Icon name="cancel" size={7} />}
        </div>
        <input 
          type="text" 
          className="reminder-inline-input" 
          defaultValue={item.text} 
          onKeyDown={onEnter} 
          onBlur={onBlur} 
          autoFocus
        />
        <button 
          type="button" 
          className={badgeClass} 
          onClick={() => onToggleTimePopover()}
        >
          <Icon name="clock" size={14} className="time-icon" />
          <span className="time-text">{displayTime === 'All Day' ? '' : displayTime}</span>
        </button>
      </div>
      {showTimePopover && (
        <TimePicker 
          pickerState={pickerState} 
          style={{ top: '36px' }} 
          onUpdatePickerTime={onUpdatePickerTime}
          onSetAllDay={onSetAllDay}
        />
      )}
    </form>
  );
};

/**
 * 일반 모드 UI (React)
 */
const ViewMode: React.FC<ReminderItemProps> = (props) => {
  const { sectionId, item, onToggleReminder, onSetEditingItemId, onDeleteReminder } = props;
  
  const toggleDone = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onToggleReminder(sectionId, item.id);
  };

  const startEdit = () => onSetEditingItemId(item.id);
  const deleteItemAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteReminder(sectionId, item.id);
  };

  const displayTime = item.isAllDay ? 'All Day' : (item.time ? formatKoreanTime(item.time) : '');

  return (
    <div className="reminder-row" onDoubleClick={startEdit}>
      <div className={`checkbox-rect ${item.done ? 'done' : ''}`} onClick={toggleDone}>
        {item.done && <Icon name="cancel" size={7} />}
      </div>
      
      <div className="item-content" onClick={toggleDone} style={{ cursor: 'pointer', flex: 1 }}>
        <p className={`text-main ${item.done ? 'text-done' : ''}`}>{item.text}</p>
        {displayTime && <span className={`text-time ${item.done ? 'text-done' : ''}`}>{displayTime}</span>}
      </div>

      <div className="item-actions">
        <button className="edit-item-btn" onClick={(e) => { e.stopPropagation(); startEdit(); }} title="수정">✎</button>
        <button className="delete-item-btn" onClick={deleteItemAction} title="삭제">×</button>
      </div>
    </div>
  );
};

/**
 * 개별 리마인더 항목 컴포넌트 (React)
 */
export const ReminderItem: React.FC<ReminderItemProps> = (props) => {
  return props.isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
};

export default ReminderItem;
