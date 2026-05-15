import { Icon } from '@src/shared/presentation/components/Icon';

interface AddSectionButtonProps {
  onClick: () => void;
}

/**
 * 새로운 섹션을 추가하기 위한 하단 플러스 버튼 컴포넌트
 */
export function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <button
      className="bg-plus-bg text-plus-icon mt-sm mb-2xl duration-normal dark:bg-gray-dark dark:text-gray-medium mx-auto flex h-[var(--plus-btn-size)] w-[var(--plus-btn-size)] shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all hover:scale-105 active:scale-95"
      onClick={onClick}
      title="새 섹션 추가"
    >
      <Icon name="plus" size={30} />
    </button>
  );
}
