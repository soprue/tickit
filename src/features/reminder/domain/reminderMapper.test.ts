import { describe, expect, it } from 'vitest';
import { mapServerDataToReminderSections } from './reminderMapper';
import type { ReminderEntity, SectionEntity } from '@src/features/auth/infrastructure/api/model';

const baseSection = {
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const baseReminder = {
  notified: false,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

function createSection(section: Pick<SectionEntity, 'id' | 'title' | 'isFixed'>): SectionEntity {
  return {
    ...baseSection,
    ...section,
  };
}

function createReminder(
  reminder: Omit<ReminderEntity, 'createdAt' | 'updatedAt' | 'notified'>
): ReminderEntity {
  return {
    ...baseReminder,
    ...reminder,
  };
}

describe('mapServerDataToReminderSections', () => {
  it('서버 섹션과 리마인더를 UI 섹션 구조로 매핑한다', () => {
    const result = mapServerDataToReminderSections(
      {
        data: [createSection({ id: 'todo', title: 'To Do', isFixed: true })],
      },
      {
        data: [
          createReminder({
            id: 1,
            sectionId: 'todo',
            text: '우유 사기',
            time: null,
            isAllDay: true,
            done: false,
          }),
        ],
      }
    );

    expect(result).toEqual([
      {
        id: 'todo',
        title: 'To Do',
        isFixed: true,
        items: [
          {
            id: 1,
            text: '우유 사기',
            time: undefined,
            isAllDay: true,
            notified: false,
            done: false,
          },
        ],
      },
    ]);
  });

  it('미완료, All Day, 빠른 시간, 완료 순서로 정렬한다', () => {
    const result = mapServerDataToReminderSections(
      {
        data: [createSection({ id: 'todo', title: 'To Do', isFixed: true })],
      },
      {
        data: [
          createReminder({
            id: 1,
            sectionId: 'todo',
            text: '완료한 일',
            time: '2026-06-01T08:00:00.000Z',
            isAllDay: false,
            done: true,
          }),
          createReminder({
            id: 2,
            sectionId: 'todo',
            text: '늦은 시간',
            time: '2026-06-01T12:00:00.000Z',
            isAllDay: false,
            done: false,
          }),
          createReminder({
            id: 3,
            sectionId: 'todo',
            text: '하루 종일',
            time: null,
            isAllDay: true,
            done: false,
          }),
          createReminder({
            id: 4,
            sectionId: 'todo',
            text: '빠른 시간',
            time: '2026-06-01T09:00:00.000Z',
            isAllDay: false,
            done: false,
          }),
        ],
      }
    );

    expect(result[0].items.map((item) => item.id)).toEqual([3, 4, 2, 1]);
  });
});
