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
