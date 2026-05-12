import React from 'react';
import { Icon } from '../Icon';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  className?: string;
}

/**
 * 공통 체크박스 컴포넌트 (UI Primitive)
 */
export function Checkbox({
  checked,
  onChange,
  size = 16,
  className = '',
}: CheckboxProps) {
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(!checked);
  };

  return (
    <div
      onClick={toggle}
      className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border-[1.5px] transition-all ${
        checked
          ? 'border-gray-light text-gray-light bg-transparent'
          : 'border-icon-brown hover:border-primary/50 bg-transparent dark:border-white/40'
      } ${className} `}
      style={{ width: size, height: size }}
    >
      {checked && <Icon name="cancel" size={size * 0.45} />}
    </div>
  );
}

