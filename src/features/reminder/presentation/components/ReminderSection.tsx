import React from 'react';
import { ReminderItem } from './ReminderItem';
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
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onSetEditingSectionId: (sectionId: string | null) => void;
  onSetAddingSection: (sectionId: string | null) => void;
  onToggleTimePopover: () => void;
  onAddReminder: (sectionId: string, text: string) => void;
  onToggleReminder: (sectionId: string, reminderId: number) => void;
  onDeleteReminder: (sectionId: string, reminderId: number) => void;
  onUpdateReminder: (sectionId: string, reminderId: number, text: string) => void;
  onSetEditingItemId: (reminderId: number | null) => void;
}

/**
 * 섹션 헤더 (React)
 */
const SectionHeader: React.FC<{
  title: string;
  category: string;
  isEditingTitle: boolean;
  isFixed: boolean;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onSetEditingSectionId: (sectionId: string | null) => void;
  onDeleteSection: (sectionId: string) => void;
}> = ({ title, category, isEditingTitle, isFixed, onUpdateSectionTitle, onSetEditingSectionId, onDeleteSection }) => {
  if (isEditingTitle && !isFixed) {
    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onUpdateSectionTitle(category, e.currentTarget.value);
      else if (e.key === 'Escape') onSetEditingSectionId(null);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.classList.contains('section-title-input') || activeEl.classList.contains('reminder-inline-input'))) return;
        onUpdateSectionTitle(category, value);
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
  const editTitle = () => !isFixed && onSetEditingSectionId(category);
  const deleteSectionAction = () => onDeleteSection(category);

  return (
    <div className="section-header">
      <h2 className={titleClass} onClick={editTitle} title={!isFixed ? '클릭하여 이름 수정' : ''}>
        {title}
      </h2>
      {!isFixed && (
        <button className="section-delete-btn" onClick={deleteSectionAction} title="섹션 삭제">
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
  onSetAddingSection: (sectionId: string | null) => void;
  onToggleTimePopover: () => void;
  onAddReminder: (sectionId: string, text: string) => void;
}> = ({ category, isAdding, showTimePopover, selectedTime, isAllDay, pickerState, onSetAddingSection, onToggleTimePopover, onAddReminder }) => {
  if (!isAdding) {
    return (
      <div className="section-footer">
        <div 
          className="reminder-row" 
          onClick={() => onSetAddingSection(category)} 
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
      onAddReminder(category, e.currentTarget.value);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.currentTarget.closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput || (activeEl && activeEl.closest('.time-popover-box'))) return;
      onSetAddingSection(null);
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
            onClick={() => onToggleTimePopover()}
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
  const { 
    title, category, items, addingSectionId, editingItemId, isEditingTitle, 
    showTimePopover, selectedTime, isAllDay, pickerState,
    onUpdateSectionTitle, onDeleteSection, onSetEditingSectionId, onSetAddingSection, 
    onToggleTimePopover, onAddReminder, onToggleReminder, onDeleteReminder, onUpdateReminder, onSetEditingItemId
  } = props;
  const isFixed = category === 'EVERYDAY' || category === 'TODO';
  const isAdding = addingSectionId === category;

  return (
    <section className="section-card">
      <SectionHeader 
        title={title} 
        category={category} 
        isEditingTitle={isEditingTitle} 
        isFixed={isFixed}
        onUpdateSectionTitle={onUpdateSectionTitle}
        onSetEditingSectionId={onSetEditingSectionId}
        onDeleteSection={onDeleteSection}
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
            onToggleReminder={onToggleReminder}
            onDeleteReminder={onDeleteReminder}
            onUpdateReminder={onUpdateReminder}
            onSetEditingItemId={onSetEditingItemId}
            onToggleTimePopover={onToggleTimePopover}
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
        onSetAddingSection={onSetAddingSection}
        onToggleTimePopover={onToggleTimePopover}
        onAddReminder={onAddReminder}
      />
    </section>
  );
};

export default ReminderSection;
