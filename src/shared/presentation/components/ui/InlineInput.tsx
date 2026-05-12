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
export function InlineInput({
  defaultValue,
  onSave,
  onCancel,
  placeholder,
  className = '',
  autoFocus = true,
  renderRight,
  wrapperClassName = '',
}: InlineInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSaved, setIsSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSaving = useRef(false);

  const handleSave = () => {
    if (isSaving.current) return;

    // 1. 값이 변하지 않았거나 비어있으면 저장 대신 취소 처리
    if (value === defaultValue || value.trim() === '') {
      onCancel?.();
      return;
    }

    isSaving.current = true;
    
    // 2. 시각적 피드백 (저장 애니메이션 시작)
    setIsSaved(true);
    
    // 애니메이션을 위해 약간의 지연 후 실제 저장 액션 실행
    setTimeout(() => {
      onSave(value);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current?.contains(relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (containerRef.current?.contains(activeEl) || activeEl?.closest('.time-popover-box')) {
        return;
      }
      handleSave();
    }, 150);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative flex items-center min-w-0 transition-all duration-300 ${
        isSaved ? 'scale-[0.99] opacity-70' : ''
      } ${wrapperClassName}`}
    >
      <Input
        variant="underline"
        className={`!p-0 !pb-[2px] leading-tight flex-1 transition-colors duration-300 ${
          isSaved ? '!text-primary' : ''
        } ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {renderRight && (
        <div className={`shrink-0 ml-2 transition-opacity duration-300 ${isSaved ? 'opacity-0' : 'opacity-100'}`} onMouseDown={(e) => e.preventDefault()}>
          {renderRight}
        </div>
      )}
    </div>
  );
}

