import jsx from '@core/JSX';
import { ReminderItem } from './ReminderItem';
import { reminderService } from '../ReminderService';
import minusSquareIcon from '@assets/icons/minusSquare.svg';
import clockIcon from '@assets/icons/clock.svg';
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
 * 섹션 헤더 (타이틀 및 삭제 버튼)
 */
const SectionHeader = ({ title, category, isEditingTitle, isFixed }: any) => {
  if (isEditingTitle && !isFixed) {
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') reminderService.handleUpdateSectionTitle(category, (e.target as HTMLInputElement).value);
      else if (e.key === 'Escape') reminderService.setEditingSectionId(null);
    };

    const onBlur = (e: FocusEvent) => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.classList.contains('section-title-input') || activeEl.classList.contains('reminder-inline-input'))) return;
        reminderService.handleUpdateSectionTitle(category, (e.target as HTMLInputElement).value);
      }, 200);
    };

    return jsx`
      <div class="section-header">
        <input type="text" class="section-title-input" value="${title}" onkeydown="${onEnter}" onblur="${onBlur}" />
      </div>
    `;
  }

  const titleClass = `section-title ${!isFixed ? 'editable' : ''}`;
  const editTitle = () => !isFixed && reminderService.setEditingSectionId(category);
  const deleteSection = () => reminderService.handleDeleteSection(category);

  return jsx`
    <div class="section-header">
      <h2 class="${titleClass}" onclick="${editTitle}" title="${!isFixed ? '클릭하여 이름 수정' : ''}">${title}</h2>
      ${!isFixed ? jsx`<button class="section-delete-btn" onclick="${deleteSection}" title="섹션 삭제"><img src="${minusSquareIcon}" alt="delete" /></button>` : ''}
    </div>
  `;
};

/**
 * 섹션 푸터 (아이템 추가 폼)
 */
const SectionFooter = ({ category, isAdding, showTimePopover, selectedTime, isAllDay, pickerState }: any) => {
  if (!isAdding) {
    return jsx`
      <div class="section-footer">
        <div class="reminder-row" onclick="${() => reminderService.setAddingSection(category)}" style="cursor: pointer;">
          <div class="checkbox-rect done" style="border-style: dashed;"></div>
          <div class="item-content"><p class="text-main text-done">눌러서 추가하기</p></div>
        </div>
      </div>
    `;
  }

  const badgeClass = `time-badge ${!isAllDay && selectedTime ? 'active' : ''}`;
  const onEnter = (e: KeyboardEvent) => e.key === 'Enter' && reminderService.handleAddReminder(e, category);
  const onBlur = (e: FocusEvent) => {
    const container = (e.target as HTMLElement).closest('.input-area-wrapper');
    if (container && container.contains(e.relatedTarget as Node)) return;
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInInput = activeEl && (activeEl.classList.contains('reminder-inline-input') || activeEl.classList.contains('section-title-input'));
      if (isStillInInput || (activeEl && activeEl.closest('.time-popover-box'))) return;
      reminderService.setAddingSection(null);
    }, 250);
  };

  const displayTime = isAllDay ? 'All Day' : (selectedTime ? formatKoreanTime(selectedTime) : '');

  return jsx`
    <div class="section-footer">
      <form class="input-area-wrapper" onsubmit="${(e: Event) => e.preventDefault()}">
        <div class="input-container">
          <div class="checkbox-rect"></div>
          <input type="text" class="reminder-inline-input" placeholder="할 일을 입력하세요..." onkeydown="${onEnter}" onblur="${onBlur}" />
          <button type="button" class="${badgeClass}" onclick="${() => reminderService.toggleTimePopover()}">
            <img src="${clockIcon}" alt="time" class="time-icon" />
            <span class="time-text">${displayTime === 'All Day' ? '' : displayTime}</span>
          </button>
        </div>
        ${showTimePopover ? TimePicker({ pickerState }) : ''}
      </form>
    </div>
  `;
};

/**
 * 카테고리별 섹션 카드 컴포넌트
 */
export const ReminderSection = (props: ReminderSectionProps) => {
  const { title, category, items, addingSectionId, editingItemId, isEditingTitle, showTimePopover, selectedTime, isAllDay, pickerState } = props;
  const isFixed = category === 'EVERYDAY' || category === 'TODO';
  const isAdding = addingSectionId === category;

  return jsx`
    <section class="section-card">
      ${SectionHeader({ title, category, isEditingTitle, isFixed })}
      <div class="items-container">
        ${items.map((item) => ReminderItem({
          sectionId: category,
          item,
          isEditing: editingItemId === item.id,
          showTimePopover,
          selectedTime,
          isAllDay,
          pickerState,
        }))}
      </div>
      ${SectionFooter({ category, isAdding, showTimePopover, selectedTime, isAllDay, pickerState })}
    </section>
  `;
};
