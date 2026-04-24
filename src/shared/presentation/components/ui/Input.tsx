import React from 'react';

type InputVariant = 'default' | 'underline' | 'ghost';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
}

/**
 * 공통 입력창 컴포넌트 (UI Primitive)
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    // 베이스 스타일
    const baseStyles = 'w-full outline-none transition-all duration-200 placeholder:text-gray-medium/50';

    // 변체(Variant)별 스타일
    const variants: Record<InputVariant, string> = {
      default: 'p-[14px] border border-gray-light/30 rounded-lg text-[14px] bg-bg text-black focus:border-primary focus:bg-white dark:bg-[#2c2c2c] dark:border-white/5 dark:text-white',
      underline: 'bg-transparent border-b-[1.5px] border-primary/20 focus:border-primary/60 p-0 pb-[2px] text-[15px] font-medium text-black dark:text-white',
      ghost: 'bg-transparent border-none p-0 text-black dark:text-white',
    };

    const variantStyle = variants[variant];

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${variantStyle} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
