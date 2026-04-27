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
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 16,
  className = '',
}) => {
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(!checked);
  };

  return (
    <div
      onClick={toggle}
      className={`
        w-4 h-4 border-[1.5px] rounded-sm shrink-0 flex justify-center items-center transition-all cursor-pointer
        ${checked 
          ? 'border-gray-light text-gray-light bg-transparent' 
          : 'border-icon-brown dark:border-white/40 bg-transparent hover:border-primary/50'}
        ${className}
      `}
      style={{ width: size, height: size }}
    >
      {checked && <Icon name="cancel" size={size * 0.45} />}
    </div>
  );
};
