import { describe, it, expect } from 'vitest';
import { calculateNotifications } from './NotificationLogic';
import type { NotificationPersistedState } from './NotificationLogic';

describe('NotificationLogic - calculateNotifications', () => {
  const testDate = new Date(2026, 4, 13, 10, 0); // 2026-05-13 10:00:00 로컬 시간

  const mockState: NotificationPersistedState = {
    sections: [
      {
        id: 'todo',
        title: 'To Do',
        isFixed: true,
        items: [
          {
            id: 1,
            text: 'Test Item 1',
            time: testDate.toISOString(),
            isAllDay: false,
            notified: false,
            done: false,
          },
        ],
      },
    ],
    lastNightCheckDate: '2026-05-12',
    lastServerRefreshDate: '2026-05-13',
  };

  it('밤 9시 이후에 미완료 항목이 있으면 밤 9시 알림을 생성한다', () => {
    // 로컬 시간 기준으로 밤 9시 5분을 설정
    const now = new Date(2026, 4, 13, 21, 5);
    const result = calculateNotifications(mockState, now);

    expect(result.notifications).toContainEqual(
      expect.objectContaining({
        title: expect.stringContaining('오늘 마무리'),
      })
    );
    expect(result.updatedState.lastNightCheckDate).toBe('2026-05-13');
    expect(result.hasChanges).toBe(true);
  });

  it('리마인더 시간이 되었을 때 개별 알림을 생성한다', () => {
    // 로컬 시간 기준으로 10시 5분 (아이템 시간인 10시 0분 이후)
    const now = new Date(2026, 4, 13, 10, 5);
    const result = calculateNotifications(mockState, now);

    expect(result.notifications).toContainEqual(
      expect.objectContaining({
        body: expect.stringContaining('Test Item 1'),
        reminderId: 1,
      })
    );
    expect(result.updatedState.sections[0].items[0].notified).toBe(false);
    expect(result.notifiedReminderIds).toEqual([]);
    expect(result.hasChanges).toBe(false);
  });

  it('이미 완료되었거나 알림이 간 항목은 중복 알림을 생성하지 않는다', () => {
    const notifiedState: NotificationPersistedState = {
      ...mockState,
      sections: [
        {
          ...mockState.sections[0],
          items: [{ ...mockState.sections[0].items[0], notified: true }],
        },
      ],
    };

    const now = new Date(2026, 4, 13, 10, 5);
    const result = calculateNotifications(notifiedState, now);

    expect(result.notifications.length).toBe(0);
    expect(result.notifiedReminderIds).toEqual([]);
    expect(result.hasChanges).toBe(false);
  });

  it('원본 상태(State)를 직접 수정하지 않는다 (Immutability)', () => {
    const now = new Date(2026, 4, 13, 10, 5);
    calculateNotifications(mockState, now);

    // mockState의 첫 번째 아이템의 notified는 여전히 false여야 함
    expect(mockState.sections[0].items[0].notified).toBe(false);
  });
});
