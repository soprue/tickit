import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

/**
 * 공통 버튼 컴포넌트 (UI Primitive)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading,
  children,
  ...props
}) => {
  // 베이스 스타일
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none';

  // 변체(Variant)별 스타일
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white shadow-md shadow-primary/20 hover:brightness-110',
    secondary: 'bg-gray-soft text-gray-medium hover:bg-gray-light dark:bg-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#4a4a4a]',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-medium dark:text-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20',
  };

  // 사이즈(Size)별 스타일
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-5 py-2.5 text-[14px]',
    lg: 'px-6 py-3.5 text-[16px]',
    icon: 'p-2',
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
