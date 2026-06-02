import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { ReminderUI } from '../hooks/useReminderUI';

const reminderActionNames = [
  'setEditingItemId',
  'setEditingSectionId',
  'setAddingSection',
  'toggleTimePopover',
  'updatePickerTime',
  'setAllDay',
  'addSection',
  'updateSectionTitle',
  'deleteSection',
  'toggleReminder',
  'deleteReminder',
  'updateReminder',
  'addReminder',
] as const;

type ReminderActionName = (typeof reminderActionNames)[number];
type ReminderActions = Pick<ReminderUI, ReminderActionName>;

const ReminderActionsContext = createContext<ReminderActions | null>(null);

interface ReminderActionsProviderProps {
  ui: ReminderUI;
  children: ReactNode;
}

function createStableActions(uiRef: React.MutableRefObject<ReminderUI>): ReminderActions {
  return Object.fromEntries(
    reminderActionNames.map((name) => [
      name,
      (...args: Parameters<ReminderActions[typeof name]>) =>
        (uiRef.current[name] as (...args: Parameters<ReminderActions[typeof name]>) => unknown)(
          ...args
        ),
    ])
  ) as ReminderActions;
}

export function ReminderActionsProvider({ ui, children }: ReminderActionsProviderProps) {
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const actions = useMemo(() => createStableActions(uiRef), []);

  return (
    <ReminderActionsContext.Provider value={actions}>{children}</ReminderActionsContext.Provider>
  );
}

export function useReminderActions() {
  const actions = useContext(ReminderActionsContext);

  if (!actions) {
    throw new Error('useReminderActions must be used within ReminderActionsProvider');
  }

  return actions;
}
