import React from 'react';

type PickerKey = 'pickerAMPM' | 'pickerHour' | 'pickerMinute';

interface TimePickerProps {
  pickerState: { ampm: string; hour: string; minute: string };
  style?: React.CSSProperties;
  onUpdatePickerTime: (key: PickerKey, value: string) => void;
  onSetAllDay: () => void;
}

interface TimePickerColumnProps {
  options: string[];
  value: string;
  pickerKey: PickerKey;
  className?: string;
  onUpdatePickerTime: (key: PickerKey, value: string) => void;
}

const ITEM_HEIGHT = 40;

function TimePickerColumn({
  options,
  value,
  pickerKey,
  className = '',
  onUpdatePickerTime,
}: TimePickerColumnProps) {
  const columnRef = React.useRef<HTMLDivElement>(null);
  const scrollTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const selectedIndex = options.indexOf(value);
    if (selectedIndex < 0) return;

    columnRef.current?.scrollTo({
      top: selectedIndex * ITEM_HEIGHT,
      behavior: 'auto',
    });
  }, [options, value]);

  React.useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const updateByScrollPosition = () => {
    const column = columnRef.current;
    if (!column) return;

    const nextIndex = Math.min(
      options.length - 1,
      Math.max(0, Math.round(column.scrollTop / ITEM_HEIGHT))
    );
    const nextValue = options[nextIndex];

    if (nextValue && nextValue !== value) {
      onUpdatePickerTime(pickerKey, nextValue);
    }
  };

  return (
    <div
      ref={columnRef}
      className={`flex-1 snap-y snap-mandatory overflow-y-auto py-[50px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      onScroll={() => {
        if (scrollTimerRef.current !== null) {
          window.clearTimeout(scrollTimerRef.current);
        }

        scrollTimerRef.current = window.setTimeout(updateByScrollPosition, 80);
      }}
    >
      {options.map((opt) => (
        <div
          key={opt}
          className={`flex h-[40px] cursor-pointer snap-center items-center justify-center text-[14px] transition-all duration-300 select-none ${value === opt ? 'text-primary scale-110 font-extrabold opacity-100' : 'text-text-primary opacity-30'}`}
          onClick={() => onUpdatePickerTime(pickerKey, opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
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
  const ampmOptions = React.useMemo(() => ['AM', 'PM'], []);
  const hourOptions = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
    []
  );
  const minuteOptions = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')),
    []
  );

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
        <div className="pointer-events-none absolute inset-x-2 top-[50px] z-10 h-[40px] rounded-lg border border-primary/15 bg-primary/5" />
        <TimePickerColumn
          options={ampmOptions}
          value={pickerState.ampm}
          pickerKey="pickerAMPM"
          onUpdatePickerTime={onUpdatePickerTime}
        />
        <TimePickerColumn
          options={hourOptions}
          value={pickerState.hour}
          pickerKey="pickerHour"
          className="border-x border-black/5 dark:border-white/5"
          onUpdatePickerTime={onUpdatePickerTime}
        />
        <TimePickerColumn
          options={minuteOptions}
          value={pickerState.minute}
          pickerKey="pickerMinute"
          onUpdatePickerTime={onUpdatePickerTime}
        />
      </div>
    </div>
  );
}


export default TimePicker;
