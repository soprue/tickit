import React from 'react';
import { ReminderItem } from './ReminderItem';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';
import { Reminder } from '../../domain/reminder';
import { useReminderUI } from '../hooks/useReminderUI';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: Reminder[];
}

/**
 * 섹션 헤더 (React)
 */
const SectionHeader: React.FC<{
  title: string;
  category: string;
  isFixed: boolean;
}> = ({ title, category, isFixed }) => {
  const ui = useReminderUI();
  const isEditingTitle = ui.state.editingSectionId === category;

  if (isEditingTitle && !isFixed) {
    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') ui.updateSectionTitle(category, e.currentTarget.value);
      else if (e.key === 'Escape') ui.setEditingSectionId(null);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.classList.contains('section-title-input') || activeEl.classList.contains('reminder-inline-input'))) return;
        ui.updateSectionTitle(category, value);
      }, 200);
    };

    return (
      <div className="section-header">
        <input 
          type="text" 
          className="section-title-input" 
          defaultValue={title} 
          onKeyDown={onEnter} 
          onBlur={onBlur} 
          autoFocus
        />
      </div>
    );
  }

  const titleClass = `section-title ${!isFixed ? 'editable' : ''}`;
  return (
    <div className="section-header">
      <h2 className={titleClass} onClick={() => !isFixed && ui.setEditingSectionId(category)} title={!isFixed ? '클릭하여 이름 수정' : ''}>
        {title}
      </h2>
      {!isFixed && (
        <button className="section-delete-btn" onClick={() => ui.deleteSection(category)} title="섹션 삭제">
          <Icon name="minusSquare" size={18} />
        </button>
      )}
    </div>
  );
};

/**
 * 섹션 푸터 (React)
 */
const SectionFooter: React.FC<{
  category: string;
}> = ({ category }) => {
  const ui = useReminderUI();
  const isAdding = ui.state.addingSectionId === category;
  const { showTimePopover, selectedTime, isAllDay, pickerAMPM, pickerHour, pickerMinute } = ui.state;

  if (!isAdding) {
    return (
      <div className="section-footer">
        <div 
          className="reminder-row" 
          onClick={() => ui.setAddingSection(category)} 
          style={{ cursor: 'pointer' }}
        >
          <div className="checkbox-rect done" style={{ borderStyle: 'dashed' }}></div>
          <div className="item-content"><p className="text-main text-done">눌러서 추가하기</p></div>
        </div>
      </div>
    );
  }

  const badgeClass = `time-badge ${!isAllDay && selectedTime ? 'active' : ''}`;
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ui.addReminder(category, e.currentTarget.value);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.currentTarget.closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput || (activeEl && activeEl.closest('.time-popover-box'))) return;
      ui.setAddingSection(null);
    }, 250);
  };

  const displayTime = isAllDay ? 'All Day' : (selectedTime ? formatKoreanTime(selectedTime) : '');

  return (
    <div className="section-footer">
      <form className="input-area-wrapper" onSubmit={(e) => e.preventDefault()}>
        <div className="input-container">
          <div className="checkbox-rect"></div>
          <input 
            type="text" 
            className="reminder-inline-input" 
            placeholder="할 일을 입력하세요..." 
            onKeyDown={onEnter} 
            onBlur={onBlur} 
            autoFocus
          />
          <button 
            type="button" 
            className={badgeClass} 
            onClick={() => ui.toggleTimePopover()}
          >
            <Icon name="clock" size={14} className="time-icon" />
            <span className="time-text">{displayTime === 'All Day' ? '' : displayTime}</span>
          </button>
        </div>
        {showTimePopover && (
          <TimePicker 
            pickerState={{ ampm: pickerAMPM, hour: pickerHour, minute: pickerMinute }} 
            onUpdatePickerTime={ui.updatePickerTime}
            onSetAllDay={ui.setAllDay}
          />
        )}
      </form>
    </div>
  );
};

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection: React.FC<ReminderSectionProps> = ({ title, category, items }) => {
  const isFixed = category === 'EVERYDAY' || category === 'TODO';

  return (
    <section className="section-card">
      <SectionHeader title={title} category={category} isFixed={isFixed} />
      <div className="items-container">
        {items.map((item) => (
          <ReminderItem key={item.id} sectionId={category} item={item} />
        ))}
      </div>
      <SectionFooter category={category} />
    </section>
  );
};

export default ReminderSection;
