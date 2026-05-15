import { useEffect, useRef } from 'react';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { useModalStore } from '@src/shared/domain/ModalStore';

interface ReminderShortcutsProps {
  addSection: () => void;
}

/**
 * 리마인더 페이지에서 사용하는 전역 단축키를 관리하는 훅.
 * 'Latest Ref' 패턴을 사용하여 불필요한 이벤트 리스너 재등록을 방지합니다.
 */
export function useReminderShortcuts({ addSection }: ReminderShortcutsProps) {
  const { hideToast } = useToastStore((state) => state.actions);
  const isToastOpen = useToastStore((state) => state.isOpen);
  const isModalOpen = useModalStore((state) => state.isOpen);
  const { closeModal } = useModalStore((state) => state.actions);

  // 최신 상태와 핸들러를 담을 Ref
  const latestRef = useRef({
    isToastOpen,
    isModalOpen,
    closeModal,
    hideToast,
    addSection,
  });

  // 매 렌더링마다 ref 업데이트
  useEffect(() => {
    latestRef.current = {
      isToastOpen,
      isModalOpen,
      closeModal,
      hideToast,
      addSection,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { isModalOpen, closeModal, isToastOpen, hideToast, addSection } = latestRef.current;

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
  }, []); // 의존성 배열을 비워 리스너가 한 번만 등록되게 함
}
