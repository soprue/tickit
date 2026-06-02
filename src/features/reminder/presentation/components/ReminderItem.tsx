import React from 'react';
import { Reminder } from '../../domain/reminder';
import { useIsReminderEditing } from '../hooks/useReminderUISelectors';
import { EditMode } from './EditMode';
import { ViewMode } from './ViewMode';

interface ReminderItemProps {
  sectionId: string;
  item: Reminder;
}

/**
 * 개별 리마인더 항목 컴포넌트
 */
export const ReminderItem = React.memo(function ReminderItem(props: ReminderItemProps) {
  const isEditing = useIsReminderEditing(props.item.id);
  return isEditing ? <EditMode {...props} /> : <ViewMode {...props} />;
});

export default ReminderItem;
