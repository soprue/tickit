/**
 * 한국어 시간 형식 포맷터 (Date 객체 또는 문자열 모두 대응)
 * 예: "오후 2:00", "오전 9:30"
 */
export const formatKoreanTime = (time: Date | string | undefined): string => {
  if (!time) return '';
  const date = time instanceof Date ? time : new Date(time);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

/**
 * 분 단위를 가장 가까운 5분 단위로 반올림합니다. (60분 이상이면 55분으로 캡핑)
 */
export const roundToNearestFive = (minutes: number): number => {
  const rounded = Math.round(minutes / 5) * 5;
  return rounded >= 60 ? 55 : rounded;
};

/**
 * Date 객체를 타임 피커 UI에 필요한 상태값(AM/PM, 시, 분)으로 변환합니다.
 */
export const parseDateToPickerState = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const roundedMinute = roundToNearestFive(m);

  return {
    ampm: ampm as 'AM' | 'PM',
    hour: String(displayHour).padStart(2, '0'),
    minute: String(roundedMinute).padStart(2, '0')
  };
};

/**
 * 타임 피커의 입력값들을 조합하여 실제 Date 객체를 생성합니다.
 * (오늘 날짜 기준, 초/밀리초는 0으로 초기화)
 */
export const createDateFromPickerState = (ampm: 'AM' | 'PM', hour: string, minute: string): Date => {
  const date = new Date();
  let h = parseInt(hour);
  
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  
  date.setHours(h, parseInt(minute), 0, 0);
  return date;
};
