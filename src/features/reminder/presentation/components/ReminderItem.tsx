import React from 'react';
import { Icon } from '@src/shared/presentation/components/Icon';
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
 * 수정 모드 UI (React)
 */
const EditMode: React.FC<ReminderItemProps> = (props) => {
  const { sectionId, item, selectedTime, isAllDay, pickerState, showTimePopover } = props;

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') reminderService.handleUpdateReminder(sectionId, item.id, e.currentTarget.value);
    else if (e.key === 'Escape') reminderService.setEditingItemId(null);
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
      reminderService.handleUpdateReminder(sectionId, item.id, value);
    }, 250);
  };

  const badgeClass = `time-badge ${!isAllDay && selectedTime ? 'active' : ''}`;
  const checkboxClass = `checkbox-rect ${item.done ? 'done' : ''}`;
  const displayTime = isAllDay ? 'All Day' : (selectedTime ? formatKoreanTime(selectedTime) : '');

  return (
    <form className="input-area-wrapper" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: '8px' }}>
      <div className="input-container">
        <div className={checkboxClass}>
          {item.done && <div className="icon-cancel-mask" style={{ pointerEvents: 'none' }}></div>}
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
          onClick={() => reminderService.toggleTimePopover()}
        >
          <Icon name="clock" size={14} className="time-icon" />
          <span className="time-text">{displayTime === 'All Day' ? '' : displayTime}</span>
        </button>
      </div>
      {showTimePopover && <TimePicker pickerState={pickerState} style={{ top: '36px' }} />}
    </form>
  );
};

/**
 * 일반 모드 UI (React)
 */
const ViewMode: React.FC<ReminderItemProps> = (props) => {
  const { sectionId, item } = props;
  
  const toggleDone = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    reminderService.handleToggleReminder(sectionId, item.id);
  };

  const startEdit = () => reminderService.setEditingItemId(item.id);
  const deleteItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    reminderService.handleDeleteReminder(sectionId, item.id);
  };

  const displayTime = item.isAllDay ? 'All Day' : (item.time ? formatKoreanTime(item.time) : '');

  return (
    <div className="reminder-row" onDoubleClick={startEdit}>
      <div className={`checkbox-rect ${item.done ? 'done' : ''}`} onClick={toggleDone}>
        {item.done && <div className="icon-cancel-mask" style={{ pointerEvents: 'none' }}></div>}
      </div>
      
      <div className="item-content" onClick={toggleDone} style={{ cursor: 'pointer', flex: 1 }}>
        <p className={`text-main ${item.done ? 'text-done' : ''}`}>{item.text}</p>
        {displayTime && <span className={`text-time ${item.done ? 'text-done' : ''}`}>{displayTime}</span>}
      </div>

      <div className="item-actions">
        <button className="edit-item-btn" onClick={(e) => { e.stopPropagation(); startEdit(); }} title="수정">✎</button>
        <button className="delete-item-btn" onClick={deleteItem} title="삭제">×</button>
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
