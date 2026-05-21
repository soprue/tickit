import { createContext, useContext, type ReactNode } from 'react';
import type { ReminderUI } from '../hooks/useReminderUI';

const ReminderUIContext = createContext<ReminderUI | null>(null);

interface ReminderUIProviderProps {
  ui: ReminderUI;
  children: ReactNode;
}

export function ReminderUIProvider({ ui, children }: ReminderUIProviderProps) {
  return <ReminderUIContext.Provider value={ui}>{children}</ReminderUIContext.Provider>;
}

export function useReminderUIContext() {
  const ui = useContext(ReminderUIContext);

  if (!ui) {
    throw new Error('useReminderUIContext must be used within ReminderUIProvider');
  }

  return ui;
}
