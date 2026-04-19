import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { Router } from '@core/Router';
import { REMINDER_CONFIG, NOTIFICATION_MESSAGES } from '@src/shared/constants';

/**
 * 리마인더 페이지의 모든 비즈니스 로직을 담당하는 서비스 클래스
 */
export class ReminderService {
  private static instance: ReminderService;
  private component: any = null;

  private constructor() {}

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  /**
   * 컴포넌트 참조 설정 (상태 업데이트를 위해 필요)
   */
  setComponent(component: any) {
    this.component = component;
  }

  /* -------------------------------------------------------------------------- */
  /* 리마인더 관련 액션                                                           */
  /* -------------------------------------------------------------------------- */

  handleToggleReminder(sectionId: string, reminderId: number) {
    reminderStore.toggleReminder(sectionId, reminderId);
  }

  handleDeleteReminder(sectionId: string, reminderId: number) {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      reminderStore.deleteReminder(sectionId, reminderId);
    }
  }

  handleUpdateReminder(sectionId: string, reminderId: number, text: string) {
    if (!this.component) return;
    const { editingItemId, selectedTime } = this.component.state;
    if (editingItemId !== reminderId) return;

    if (text.trim()) {
      reminderStore.updateReminder(sectionId, reminderId, text, selectedTime);
    }
    this.component.setState({ editingItemId: null });
  }

  handleAddReminder(e: KeyboardEvent, sectionId: string) {
    if (!this.component) return;
    const { addingSectionId, selectedTime } = this.component.state;
    if (addingSectionId !== sectionId) return;

    const input = e.target as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    reminderStore.addReminder(sectionId, text, selectedTime);
    this.setAddingSection(null);
  }

  /* -------------------------------------------------------------------------- */
  /* 섹션 관련 액션                                                               */
  /* -------------------------------------------------------------------------- */

  handleUpdateSectionTitle(sectionId: string, title: string) {
    if (!this.component || this.component.state.editingSectionId !== sectionId) return;

    if (title.trim()) {
      reminderStore.updateSectionTitle(sectionId, title);
    }
    this.component.setState({ editingSectionId: null });
  }

  handleDeleteSection(sectionId: string) {
    if (confirm('이 섹션을 삭제하시겠습니까?')) {
      reminderStore.deleteSection(sectionId);
    }
  }

  addSection() {
    reminderStore.addSection(REMINDER_CONFIG.NEW_SECTION_TITLE);
  }

  /* -------------------------------------------------------------------------- */
  /* 상태 제어 (UI State)                                                        */
  /* -------------------------------------------------------------------------- */

  setEditingItemId(reminderId: number | null) {
    if (!this.component) return;
    if (reminderId === null) {
      this.component.setState({ editingItemId: null });
      return;
    }

    const { sections } = reminderStore.getState();
    const foundItem = sections.flatMap(s => s.items).find(it => it.id === reminderId);

    if (foundItem) {
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      if (foundItem.time instanceof Date) {
        const h = foundItem.time.getHours();
        const m = foundItem.time.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour);
        minute = String(m).padStart(2, '0');
      }

      this.component.setState({ 
        editingItemId: reminderId,
        addingSectionId: null,
        editingSectionId: null,
        selectedTime: foundItem.time,
        isAllDay: foundItem.isAllDay,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute,
        showTimePopover: false
      });
    }
  }

  setEditingSectionId(sectionId: string | null) {
    if (!this.component) return;
    this.component.setState({ 
      editingSectionId: sectionId,
      addingSectionId: null,
      editingItemId: null
    });
  }

  setAddingSection(sectionId: string | null) {
    if (!this.component) return;
    this.component.setState({ 
      addingSectionId: sectionId,
      editingItemId: null,
      editingSectionId: null,
      showTimePopover: false,
      selectedTime: undefined,
      isAllDay: false,
      pickerAMPM: REMINDER_CONFIG.DEFAULT_AMPM,
      pickerHour: REMINDER_CONFIG.DEFAULT_HOUR,
      pickerMinute: REMINDER_CONFIG.DEFAULT_MINUTE
    });
  }

  handleSearch(e: Event) {
    if (!this.component) return;
    const target = e.target as HTMLInputElement;
    this.component.setState({ searchQuery: target.value });
  }

  /* -------------------------------------------------------------------------- */
  /* 기타 전역 액션                                                               */
  /* -------------------------------------------------------------------------- */

  handleLogout() {
    authStore.logout();
    Router.getInstance().navigate('/login');
  }

  toggleDarkMode() {
    themeStore.toggleDarkMode();
  }

  toggleTimePopover() {
    if (!this.component) return;
    const isOpening = !this.component.state.showTimePopover;

    if (isOpening) {
      const { selectedTime, isAllDay } = this.component.state;
      let ampm: 'AM' | 'PM' = REMINDER_CONFIG.DEFAULT_AMPM;
      let hour: string = REMINDER_CONFIG.DEFAULT_HOUR;
      let minute: string = REMINDER_CONFIG.DEFAULT_MINUTE;

      // 이미 설정된 시간이 있다면 그 시간으로 피커 초기화
      const timeDate = selectedTime instanceof Date ? selectedTime : (selectedTime ? new Date(selectedTime) : null);
      
      if (timeDate && !isNaN(timeDate.getTime()) && !isAllDay) {
        const h = timeDate.getHours();
        const m = timeDate.getMinutes();
        ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        hour = String(displayHour).padStart(2, '0');
        minute = String(m).padStart(2, '0');
        
        // 5분 단위 피커인 경우 가장 가까운 값으로 반올림 (선택 사항)
        const roundedMinute = Math.round(m / 5) * 5;
        minute = String(roundedMinute >= 60 ? 55 : roundedMinute).padStart(2, '0');
      }

      this.component.setState({ 
        showTimePopover: true,
        pickerAMPM: ampm,
        pickerHour: hour,
        pickerMinute: minute
      });
    } else {
      this.component.setState({ showTimePopover: false });
    }
  }

  updatePickerTime(key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) {
    if (!this.component) return;
    const newState = { ...this.component.state, [key]: value };
    
    // Date 객체 생성 (오늘 날짜 기준)
    const date = new Date();
    let h = parseInt(newState.pickerHour);
    if (newState.pickerAMPM === 'PM' && h < 12) h += 12;
    if (newState.pickerAMPM === 'AM' && h === 12) h = 0;
    
    date.setHours(h, parseInt(newState.pickerMinute), 0, 0);

    this.component.setState({ 
      [key]: value,
      selectedTime: date,
      isAllDay: false,
      showTimePopover: false
    } as any);
  }

  setAllDay() {
    if (!this.component) return;
    this.component.setState({ 
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    });
  }
}

export const reminderService = ReminderService.getInstance();
