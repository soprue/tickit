import React from 'react';

type InputVariant = 'default' | 'underline' | 'ghost';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  /** 에러 여부 또는 에러 메시지 */
  error?: boolean | string;
  /** 인풋 하단 설명 문구 */
  helperText?: string;
}

/**
 * 공통 입력창 컴포넌트 (UI Primitive)
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = 'default', error, helperText, className = '', ...props },
  ref
) {
  // 베이스 스타일
  const baseStyles =
    'w-full outline-none transition-all duration-200 placeholder:text-gray-medium/50 disabled:opacity-50 disabled:bg-gray-soft/50';

  // 에러 여부 판단
  const isError = Boolean(error);

  // 변체(Variant)별 스타일
  const variants: Record<InputVariant, string> = {
    default: `p-[14px] border rounded-lg text-[14px] bg-bg text-text-primary focus:bg-white dark:bg-[#2c2c2c] ${
      isError
        ? 'border-red-500 focus:border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]'
        : 'border-gray-light/30 focus:border-primary dark:border-white/5'
    }`,
    underline: `bg-transparent border-b-[1.5px] p-0 pb-[2px] text-[15px] font-medium text-text-primary ${
      isError ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-primary/60'
    }`,
    ghost: 'bg-transparent border-none p-0 text-text-primary',
  };

  const variantStyle = variants[variant];

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input ref={ref} className={`${baseStyles} ${variantStyle} ${className}`} {...props} />

      {/* 에러 메시지 또는 헬퍼 텍스트 출력 */}
      {(typeof error === 'string' || helperText) && (
        <p
          className={`px-1 text-[11px] font-medium transition-colors ${
            isError ? 'animate-in fade-in slide-in-from-top-1 text-red-500' : 'text-gray-medium'
          }`}
        >
          {typeof error === 'string' ? error : helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
