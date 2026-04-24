import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** 카드 내부 패딩 여부 (기본값: true) */
  padded?: boolean;
  /** 호버 시 그림자 강조 효과 여부 */
  hoverable?: boolean;
}

/**
 * Tickit 디자인 시스템의 표준 컨테이너 컴포넌트
 */
export function Card({ 
  children, 
  className = '', 
  padded = true,
  hoverable = false 
}: CardProps) {
  const baseStyles = 'bg-white dark:bg-[#151515] border border-gray-100 dark:border-white/5 rounded-xl shadow-lg transition-all duration-300 overflow-hidden';
  const paddingStyles = padded ? 'p-xl' : '';
  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
