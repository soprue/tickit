import { createContext, useContext, type ReactNode } from 'react';
import type { ReminderUI } from '../hooks/useReminderUI';

type ReminderActions = Pick<
  ReminderUI,
  | 'setEditingItemId'
  | 'setEditingSectionId'
  | 'setAddingSection'
  | 'toggleTimePopover'
  | 'updatePickerTime'
  | 'setAllDay'
  | 'addSection'
  | 'updateSectionTitle'
  | 'deleteSection'
  | 'toggleReminder'
  | 'deleteReminder'
  | 'updateReminder'
  | 'addReminder'
>;

const ReminderActionsContext = createContext<ReminderActions | null>(null);

interface ReminderActionsProviderProps {
  ui: ReminderUI;
  children: ReactNode;
}

function getReminderActions(ui: ReminderUI): ReminderActions {
  return {
    setEditingItemId: ui.setEditingItemId,
    setEditingSectionId: ui.setEditingSectionId,
    setAddingSection: ui.setAddingSection,
    toggleTimePopover: ui.toggleTimePopover,
    updatePickerTime: ui.updatePickerTime,
    setAllDay: ui.setAllDay,
    addSection: ui.addSection,
    updateSectionTitle: ui.updateSectionTitle,
    deleteSection: ui.deleteSection,
    toggleReminder: ui.toggleReminder,
    deleteReminder: ui.deleteReminder,
    updateReminder: ui.updateReminder,
    addReminder: ui.addReminder,
  };
}

export function ReminderActionsProvider({ ui, children }: ReminderActionsProviderProps) {
  return (
    <ReminderActionsContext.Provider value={getReminderActions(ui)}>
      {children}
    </ReminderActionsContext.Provider>
  );
}

export function useReminderActions() {
  const actions = useContext(ReminderActionsContext);

  if (!actions) {
    throw new Error('useReminderActions must be used within ReminderActionsProvider');
  }

  return actions;
}
