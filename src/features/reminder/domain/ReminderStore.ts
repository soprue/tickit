import { Store } from '@core/Store';
import { ReminderSectionData } from './reminder';
import { STORAGE_KEYS, Category } from '@src/shared/constants';

interface ReminderState {
  sections: ReminderSectionData[];
}

/**
 * 리마인더 데이터를 관리하는 스토어 클래스
 */
class ReminderStore extends Store<ReminderState> {
  constructor() {
    // 오늘 날짜 기준 예시 시간 생성
    const today = new Date();
    
    const initialSections: ReminderSectionData[] = [
      { id: Category.EVERYDAY, title: 'Everyday', isFixed: true, items: [
        { id: 1, text: '약 먹기', time: new Date(new Date(today).setHours(14, 0, 0, 0)), isAllDay: false, notified: true, done: true },
        { id: 2, text: '알고리즘 문제 풀기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
        { id: 3, text: '산책하기', time: new Date(new Date(today).setHours(23, 0, 0, 0)), isAllDay: false, notified: false, done: true },
      ]},
      { id: Category.TODO, title: 'To Do', isFixed: true, items: [
        { id: 4, text: '책 반납하기', isAllDay: true, notified: false, done: false },
        { id: 5, text: '편의점 택배 보내고 오기', time: new Date(new Date(today).setHours(16, 0, 0, 0)), isAllDay: false, notified: false, done: false },
      ]},
      { id: Category.WORK, title: 'Work', isFixed: false, items: [] },
    ];

    super({ sections: initialSections }, STORAGE_KEYS.REMINDER);
  }

  /* -------------------------------------------------------------------------- */
  /* Helper Methods (Encapsulation)                                             */
  /* -------------------------------------------------------------------------- */

  /**
   * 불러온 데이터의 날짜 형식을 복원함
   */
  protected hydrate(data: any): ReminderState {
    if (!data.sections) return this.state;

    return {
      ...this.state,
      sections: data.sections.map((section: any) => ({
        ...section,
        items: section.items.map((item: any) => {
          let hydratedTime: Date | undefined = undefined;
          if (item.time) {
            const date = new Date(item.time);
            if (!isNaN(date.getTime())) hydratedTime = date;
          }
          return {
            ...item,
            time: hydratedTime,
            isAllDay: item.isAllDay ?? (item.time === 'All Day'),
            notified: item.notified ?? false,
            done: item.done ?? false
          };
        })
      }))
    };
  }

  private updateSection(sectionId: string, updater: (section: ReminderSectionData) => ReminderSectionData) {
    this.setState({
      sections: this.state.sections.map(s => s.id === sectionId ? updater(s) : s)
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Public Actions                                                             */
  /* -------------------------------------------------------------------------- */

  addSection(title: string) {
    const newSection: ReminderSectionData = {
      id: `SECTION_${Date.now()}`,
      title,
      isFixed: false,
      items: [],
    };
    this.setState({ sections: [...this.state.sections, newSection] });
  }

  updateSectionTitle(sectionId: string, title: string) {
    this.updateSection(sectionId, s => ({ ...s, title }));
  }

  deleteSection(sectionId: string) {
    this.setState({
      sections: this.state.sections.filter(s => s.isFixed || s.id !== sectionId)
    });
  }

  addReminder(sectionId: string, text: string, time?: Date, isAllDay: boolean = false) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: [...s.items, { id: Date.now(), text, time, isAllDay, notified: false, done: false }]
    }));
  }

  toggleReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, done: !item.done } : item)
    }));
  }

  updateReminder(sectionId: string, reminderId: number, text: string, time?: Date, isAllDay: boolean = false) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, text, time, isAllDay, notified: false } : item)
    }));
  }

  deleteReminder(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.filter(item => item.id !== reminderId)
    }));
  }

  /**
   * 알림을 보낸 후 상태를 업데이트하는 메서드
   */
  markAsNotified(sectionId: string, reminderId: number) {
    this.updateSection(sectionId, s => ({
      ...s,
      items: s.items.map(item => item.id === reminderId ? { ...item, notified: true } : item)
    }));
  }
}

export const reminderStore = new ReminderStore();
