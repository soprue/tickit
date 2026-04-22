import React from 'react';

interface TimePickerProps {
  pickerState: { ampm: string; hour: string; minute: string };
  style?: React.CSSProperties;
  onUpdatePickerTime: (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => void;
  onSetAllDay: () => void;
}

/**
 * 독립된 시간 선택 피커 컴포넌트 (React)
 */
export const TimePicker: React.FC<TimePickerProps> = ({ pickerState, style, onUpdatePickerTime, onSetAllDay }) => {
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const updateTime = (key: string, val: string) => {
    onUpdatePickerTime(key as any, val);
  };

  return (
    <div className="time-popover-box" style={style}>
      <div 
        className="popover-all-day" 
        onClick={(e) => { e.stopPropagation(); onSetAllDay(); }}
      >
        ☀️ All Day 로 설정
      </div>
      <div className="mini-picker-columns">
        <div className="mini-column">
          <div className="mini-item"></div>
          {ampmOptions.map(opt => (
            <div 
              key={opt}
              className={`mini-item ${pickerState.ampm === opt ? 'selected' : ''}`} 
              onClick={() => updateTime('pickerAMPM', opt)}
            >
              {opt}
            </div>
          ))}
          <div className="mini-item"></div>
        </div>
        <div className="mini-column">
          <div className="mini-item"></div>
          {hourOptions.map(opt => (
            <div 
              key={opt}
              className={`mini-item ${pickerState.hour === opt ? 'selected' : ''}`} 
              onClick={() => updateTime('pickerHour', opt)}
            >
              {opt}
            </div>
          ))}
          <div className="mini-item"></div>
        </div>
        <div className="mini-column">
          <div className="mini-item"></div>
          {minuteOptions.map(opt => (
            <div 
              key={opt}
              className={`mini-item ${pickerState.minute === opt ? 'selected' : ''}`} 
              onClick={() => updateTime('pickerMinute', opt)}
            >
              {opt}
            </div>
          ))}
          <div className="mini-item"></div>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
