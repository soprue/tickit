import { useEffect } from 'react';
import { useAuthStore } from '@src/features/auth/domain/AuthStore';
import { DELAYS, IPC_CHANNELS } from '@src/shared/constants';
import { ipc } from '@src/shared/utils/ipc';
import type { ReminderSectionData } from '@src/features/reminder/domain/reminder';

export function useReminderNotificationSync(
  mappedSections: ReminderSectionData[],
  isInitialLoading: boolean
) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (isInitialLoading) return;

    const timer = setTimeout(async () => {
      try {
        await ipc.invoke(IPC_CHANNELS.SYNC_NOTIFICATIONS, {
          sections: mappedSections,
          accessToken,
        });
      } catch (e) {
        console.error('[useReminderNotificationSync] Sync notifications failed:', e);
      }
    }, DELAYS.SAVE_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [mappedSections, accessToken, isInitialLoading]);
}
