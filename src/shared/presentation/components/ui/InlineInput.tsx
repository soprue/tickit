import React, { useRef, useEffect, useState } from 'react';
import { Input } from './Input';

interface InlineInputProps {
  defaultValue: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  renderRight?: React.ReactNode;
  wrapperClassName?: string;
}

/**
 * 섹션 제목이나 리마인더 내용 수정 등에 공통으로 사용되는 인라인 편집 인풋 컴포넌트.
 * Enter/Blur 시 저장, Escape 시 취소 로직을 캡슐화합니다.
 */
export const InlineInput: React.FC<InlineInputProps> = ({
  defaultValue,
  onSave,
  onCancel,
  placeholder,
  className = '',
  autoFocus = true,
  renderRight,
  wrapperClassName = '',
}) => {
  const [value, setValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSaving = useRef(false);

  const handleSave = () => {
    if (isSaving.current) return;
    isSaving.current = true;
    onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // 팝오버나 내부 버튼을 클릭하는 경우 저장을 유예하거나 무시
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current?.contains(relatedTarget)) {
      return;
    }
    
    // 약간의 지연을 주어 팝오버 내부의 포커스 이동을 감지할 시간을 줌
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (containerRef.current?.contains(activeEl) || activeEl?.closest('.time-popover-box')) {
        return;
      }
      handleSave();
    }, 150);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center min-w-0 ${wrapperClassName}`}>
      <Input
        variant="underline"
        className={`!p-0 !pb-[2px] leading-tight flex-1 ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {renderRight && (
        <div className="shrink-0 ml-2" onMouseDown={(e) => e.preventDefault()}>
          {renderRight}
        </div>
      )}
    </div>
  );
};
