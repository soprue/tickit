import { Icon } from '../Icon';
import type { IconName } from '@src/types/icon-types';
import { Button } from './Button';

interface SocialButtonProps {
  provider: 'google' | 'github'; // 확장 가능성 고려
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
}

/**
 * 소셜 로그인 전용 버튼 컴포넌트
 * 구글, 깃허브 등 다양한 소셜 로그인 스타일을 통일성 있게 관리합니다.
 */
export function SocialButton({ provider, onClick, isLoading, label }: SocialButtonProps) {
  const configs = {
    google: {
      icon: 'google' as IconName,
      text: label || 'Google 계정으로 로그인',
      className:
        'border border-[#dadce0] bg-white hover:border-[#d2d4d7] hover:bg-[#f8f9fa] dark:border-[#444746] dark:bg-[#1f1f1f] dark:hover:border-[#5f6368] dark:hover:bg-[#2a2a2a] shadow-none',
    },
    github: {
      icon: 'github' as IconName, // 아직 아이콘이 없다면 추가 필요
      text: label || 'GitHub 계정으로 로그인',
      className: 'bg-[#24292e] text-white hover:bg-[#2c3238] border-none shadow-md',
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
