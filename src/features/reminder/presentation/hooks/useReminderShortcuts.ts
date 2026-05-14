import { useEffect } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

interface ReminderShortcutsProps {
  addSection: () => void;
}

/**
 * 리마인더 페이지에서 사용하는 전역 단축키를 관리하는 훅
 */
export function useReminderShortcuts({ addSection }: ReminderShortcutsProps) {
  const { hideToast } = useToastStore((state) => state.actions);
  const isToastOpen = useToastStore((state) => state.isOpen);
  const isModalOpen = useModalStore((state) => state.isOpen);
  const { closeModal } = useModalStore((state) => state.actions);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc: 토스트나 모달 닫기
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isToastOpen) hideToast();
      }

      // 2. Cmd/Ctrl + N: 새 섹션 추가
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        addSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isToastOpen, closeModal, hideToast, addSection]);
}
