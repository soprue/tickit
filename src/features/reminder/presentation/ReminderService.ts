import { reminderStore } from '@src/features/reminder/domain/ReminderStore';
import { authStore } from '@src/features/auth/domain/AuthStore';
import { themeStore } from '@src/shared/domain/ThemeStore';
import { REMINDER_CONFIG } from '@src/shared/constants';

/**
 * 리마인더 페이지의 비즈니스 로직 중 일부(TimePicker 등)를 담당하는 서비스 클래스
 * (점진적으로 훅으로 이관 중)
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
  /* 기타 전역 액션                                                               */
  /* -------------------------------------------------------------------------- */

  toggleDarkMode() {
    themeStore.toggleDarkMode();
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

    this.component.setState((prev: any) => ({ 
      ...prev,
      [key]: value,
      selectedTime: date,
      isAllDay: false,
      showTimePopover: false
    }));
  }

  setAllDay() {
    if (!this.component) return;
    this.component.setState((prev: any) => ({ 
      ...prev,
      selectedTime: undefined,
      isAllDay: true,
      showTimePopover: false 
    }));
  }
}

export const reminderService = ReminderService.getInstance();
