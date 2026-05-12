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
export function TimePicker({
  pickerState,
  style,
  onUpdatePickerTime,
  onSetAllDay,
}: TimePickerProps) {
  const ampmOptions = ['AM', 'PM'];
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const updateTime = (key: 'pickerAMPM' | 'pickerHour' | 'pickerMinute', val: string) => {
    onUpdatePickerTime(key, val);
  };

  return (
    <div
      className="border-gray-light w-[180px] overflow-hidden rounded-2xl border bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1e1e1e]/90"
      style={style}
    >
      <div
        className="text-primary bg-primary/5 hover:bg-primary/10 cursor-pointer border-b border-black/5 p-3 text-center text-[12px] font-bold transition-colors select-none dark:border-white/5"
        onClick={(e) => {
          e.stopPropagation();
          onSetAllDay();
        }}
      >
        ☀️ All Day 로 설정
      </div>

      <div className="relative flex h-[140px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        {/* AMPM Column */}
        <div className="flex-1 snap-y snap-mandatory overflow-y-auto py-[50px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ampmOptions.map((opt) => (
            <div
              key={opt}
              className={`flex h-[40px] cursor-pointer snap-center items-center justify-center text-[14px] transition-all duration-300 select-none ${pickerState.ampm === opt ? 'text-primary scale-110 font-extrabold opacity-100' : 'text-text-primary opacity-30'}`}
              onClick={() => updateTime('pickerAMPM', opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Hour Column */}
        <div className="flex-1 snap-y snap-mandatory overflow-y-auto border-x border-black/5 py-[50px] [-ms-overflow-style:none] [scrollbar-width:none] dark:border-white/5 [&::-webkit-scrollbar]:hidden">
          {hourOptions.map((opt) => (
            <div
              key={opt}
              className={`flex h-[40px] cursor-pointer snap-center items-center justify-center text-[14px] transition-all duration-300 select-none ${pickerState.hour === opt ? 'text-primary scale-110 font-extrabold opacity-100' : 'text-text-primary opacity-30'}`}
              onClick={() => updateTime('pickerHour', opt)}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Minute Column */}
        <div className="flex-1 snap-y snap-mandatory overflow-y-auto py-[50px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {minuteOptions.map((opt) => (
            <div
              key={opt}
              className={`flex h-[40px] cursor-pointer snap-center items-center justify-center text-[14px] transition-all duration-300 select-none ${pickerState.minute === opt ? 'text-primary scale-110 font-extrabold opacity-100' : 'text-text-primary opacity-30'}`}
              onClick={() => updateTime('pickerMinute', opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default TimePicker;
