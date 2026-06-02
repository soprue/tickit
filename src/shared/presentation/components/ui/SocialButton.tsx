import { Icon } from '../Icon';
import type { IconType } from '@src/types/icon-types';
import { Button } from './Button';

interface SocialButtonProps {
  provider: 'google';
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
}

type SocialButtonConfig = {
  icon: IconType;
  text: string;
  className: string;
};

/**
 * 소셜 로그인 전용 버튼 컴포넌트
 * 구글, 깃허브 등 다양한 소셜 로그인 스타일을 통일성 있게 관리합니다.
 */
export function SocialButton({ provider, onClick, isLoading, label }: SocialButtonProps) {
  const configs: Record<SocialButtonProps['provider'], SocialButtonConfig> = {
    google: {
      icon: 'google',
      text: label || 'Google 계정으로 로그인',
      className:
        'border border-[#dadce0] bg-white hover:border-[#d2d4d7] hover:bg-[#f8f9fa] dark:border-[#444746] dark:bg-[#1f1f1f] dark:hover:border-[#5f6368] dark:hover:bg-[#2a2a2a] shadow-none',
    },
  };

  const config = configs[provider];

  return (
    <Button
      variant="secondary"
      className={`flex w-full items-center justify-center gap-3 font-medium transition-all ${config.className}`}
      onClick={onClick}
      isLoading={isLoading}
    >
      <Icon name={config.icon} size={18} />
      <span className="text-text-primary text-[14px] tracking-tight">{config.text}</span>
    </Button>
  );
}
