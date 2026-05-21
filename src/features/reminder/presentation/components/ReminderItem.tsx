import React from 'react';
import { Reminder } from '../../domain/reminder';
import { useReminderUIContext } from '../context/ReminderUIContext';
import { EditMode } from './EditMode';
import { ViewMode } from './ViewMode';

interface ReminderItemProps {
  sectionId: string;
  item: Reminder;
}

/**
 * 개별 리마인더 항목 컴포넌트
 */
export function ReminderItem(props: ReminderItemProps) {
  const ui = useReminderUIContext();
  const isEditing = ui.state.editingItemId === props.item.id;
  return isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
}

export default ReminderItem;
