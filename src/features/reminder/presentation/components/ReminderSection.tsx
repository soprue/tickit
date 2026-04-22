import React from 'react';
import { ReminderItem } from './ReminderItem';
import { reminderService } from '../ReminderService';
import { Icon } from '@src/shared/presentation/components/Icon';
import { formatKoreanTime } from '@src/shared/utils/date';
import { TimePicker } from './TimePicker';

interface ReminderSectionProps {
  title: string;
  category: string;
  items: any[];
  addingSectionId: string | null;
  editingItemId: number | null;
  isEditingTitle: boolean;
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerState: { ampm: string; hour: string; minute: string };
}

/**
 * 섹션 헤더 (React)
 */
const SectionHeader: React.FC<{
  title: string;
  category: string;
  isEditingTitle: boolean;
  isFixed: boolean;
}> = ({ title, category, isEditingTitle, isFixed }) => {
  if (isEditingTitle && !isFixed) {
    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') reminderService.handleUpdateSectionTitle(category, e.currentTarget.value);
      else if (e.key === 'Escape') reminderService.setEditingSectionId(null);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.classList.contains('section-title-input') || activeEl.classList.contains('reminder-inline-input'))) return;
        reminderService.handleUpdateSectionTitle(category, value);
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
  const editTitle = () => !isFixed && reminderService.setEditingSectionId(category);
  const deleteSection = () => reminderService.handleDeleteSection(category);

  return (
    <div className="section-header">
      <h2 className={titleClass} onClick={editTitle} title={!isFixed ? '클릭하여 이름 수정' : ''}>
        {title}
      </h2>
      {!isFixed && (
        <button className="section-delete-btn" onClick={deleteSection} title="섹션 삭제">
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
  isAdding: boolean;
  showTimePopover: boolean;
  selectedTime: Date | undefined;
  isAllDay: boolean;
  pickerState: { ampm: string; hour: string; minute: string };
}> = ({ category, isAdding, showTimePopover, selectedTime, isAllDay, pickerState }) => {
  if (!isAdding) {
    return (
      <div className="section-footer">
        <div 
          className="reminder-row" 
          onClick={() => reminderService.setAddingSection(category)} 
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
      // e를 HTMLInputElement로 캐스팅하거나 필요한 값만 전달하도록 서비스 수정 필요할 수 있음
      reminderService.handleAddReminder(e.nativeEvent, category);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.currentTarget.closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput || (activeEl && activeEl.closest('.time-popover-box'))) return;
      reminderService.setAddingSection(null);
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
            onClick={() => reminderService.toggleTimePopover()}
          >
            <Icon name="clock" size={14} className="time-icon" />
            <span className="time-text">{displayTime === 'All Day' ? '' : displayTime}</span>
          </button>
        </div>
        {showTimePopover && <TimePicker pickerState={pickerState} />}
      </form>
    </div>
  );
};

/**
 * 카테고리별 섹션 카드 컴포넌트 (React)
 */
export const ReminderSection: React.FC<ReminderSectionProps> = (props) => {
  const { title, category, items, addingSectionId, editingItemId, isEditingTitle, showTimePopover, selectedTime, isAllDay, pickerState } = props;
  const isFixed = category === 'EVERYDAY' || category === 'TODO';
  const isAdding = addingSectionId === category;

  return (
    <section className="section-card">
      <SectionHeader 
        title={title} 
        category={category} 
        isEditingTitle={isEditingTitle} 
        isFixed={isFixed} 
      />
      <div className="items-container">
        {items.map((item) => (
          <ReminderItem 
            key={item.id}
            sectionId={category}
            item={item}
            isEditing={editingItemId === item.id}
            showTimePopover={isAdding ? false : (editingItemId === item.id && showTimePopover)} // 추가 중일 때는 아이템의 팝오버를 끔
            selectedTime={selectedTime}
            isAllDay={isAllDay}
            pickerState={pickerState}
          />
        ))}
      </div>
      <SectionFooter 
        category={category} 
        isAdding={isAdding} 
        showTimePopover={isAdding && showTimePopover} 
        selectedTime={selectedTime} 
        isAllDay={isAllDay} 
        pickerState={pickerState} 
      />
    </section>
  );
};

export default ReminderSection;
