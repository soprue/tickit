import { describe, expect, it } from 'vitest';
import { mapServerDataToNotificationSections } from './NotificationServerMapper';
import type { ServerReminder, ServerSection } from './NotificationApiClient';

describe('NotificationServerMapper - mapServerDataToNotificationSections', () => {
  it('서버 섹션과 리마인더를 알림 상태용 섹션 데이터로 변환한다', () => {
    const sections: ServerSection[] = [
      { id: 'todo', title: 'To Do', isFixed: true },
      { id: 'work', title: 'Work', isFixed: false },
    ];
    const reminders: ServerReminder[] = [
      {
        id: 1,
        sectionId: 'todo',
        text: 'Buy milk',
        time: null,
        isAllDay: true,
        notified: false,
        done: false,
      },
      {
        id: 2,
        sectionId: 'work',
        text: 'Standup',
        time: '2026-05-13T09:00:00.000Z',
        isAllDay: false,
        notified: true,
        done: false,
      },
    ];

    expect(mapServerDataToNotificationSections(sections, reminders)).toEqual([
      {
        id: 'todo',
        title: 'To Do',
        isFixed: true,
        items: [
          {
            id: 1,
            text: 'Buy milk',
            time: undefined,
            isAllDay: true,
            notified: false,
            done: false,
          },
        ],
      },
      {
        id: 'work',
        title: 'Work',
        isFixed: false,
        items: [
          {
            id: 2,
            text: 'Standup',
            time: '2026-05-13T09:00:00.000Z',
            isAllDay: false,
            notified: true,
            done: false,
          },
        ],
      },
    ]);
  });
});
