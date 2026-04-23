// src/shared/presentation/components/Icon.tsx

import React from 'react';
import type { IconType } from '@src/types/icon-types';
import { iconMap } from '@assets/icons/icon-map';

interface IconProps {
  name: IconType;
  width?: number;
  size?: number; // size 속성도 지원하도록 추가 (LoginPage에서 size로 사용 중)
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

export function Icon({ name, width, size, color, className, style, onClick }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;

  const finalWidth = size || width;

  return (
    <IconComponent
      width={finalWidth}
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      style={{
        ...(color ? { color } : {}),
        ...style,
      }}
    />
  );
}

export default Icon;
