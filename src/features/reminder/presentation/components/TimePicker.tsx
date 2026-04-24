import React from 'react';

interface TimePickerProps {
  pickerState: { ampm: string; hour: string; minute: string };
  style?: React.CSSProperties;
  onUpdatePickerTime: (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', value: string) => void;
  onSetAllDay: () => void;
}

/**
 * 독립된 시간 선택 피커 컴포넌트 (Tailwind 마이그레이션 완료)
 */
export const TimePicker: React.FC<TimePickerProps> = ({ pickerState, style, onUpdatePickerTime, onSetAllDay }) => {
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const updateTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', val: string) => {
    onUpdatePickerTime(key, val);
  };

  return (
    <div 
      className="w-[180px] bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-light dark:border-white/10 overflow-hidden"
      style={style}
    >
      <div 
        className="p-3 text-center text-[12px] font-bold text-primary bg-primary/5 cursor-pointer border-b border-black/5 dark:border-white/5 hover:bg-primary/10 transition-colors select-none" 
        onClick={(e) => { e.stopPropagation(); onSetAllDay(); }}
      >
        ☀️ All Day 로 설정
      </div>
      
      <div className="flex h-[140px] relative [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        {/* AMPM Column */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-y snap-mandatory py-[50px]">
          {ampmOptions.map(opt => (
            <div 
              key={opt}
              className={`h-[40px] flex items-center justify-center text-[14px] transition-all duration-300 snap-center cursor-pointer select-none
                ${pickerState.ampm === opt ? 'opacity-100 font-extrabold text-primary scale-110' : 'opacity-30 text-text-primary'}`} 
              onClick={() => updateTime('pickerAMPM', opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Hour Column */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-y snap-mandatory py-[50px] border-x border-black/5 dark:border-white/5">
          {hourOptions.map(opt => (
            <div 
              key={opt}
              className={`h-[40px] flex items-center justify-center text-[14px] transition-all duration-300 snap-center cursor-pointer select-none
                ${pickerState.hour === opt ? 'opacity-100 font-extrabold text-primary scale-110' : 'opacity-30 text-text-primary'}`} 
              onClick={() => updateTime('pickerHour', opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Minute Column */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-y snap-mandatory py-[50px]">
          {minuteOptions.map(opt => (
            <div 
              key={opt}
              className={`h-[40px] flex items-center justify-center text-[14px] transition-all duration-300 snap-center cursor-pointer select-none
                ${pickerState.minute === opt ? 'opacity-100 font-extrabold text-primary scale-110' : 'opacity-30 text-text-primary'}`} 
              onClick={() => updateTime('pickerMinute', opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
