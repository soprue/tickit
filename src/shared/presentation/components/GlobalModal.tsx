import React from 'react';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { Button } from './ui/Button';

/**
 * 전역 모달 컴포넌트
 * useModalStore의 상태에 따라 브라우저 내장 confirm()을 대신하여 화면에 표시됩니다.
 */
export function GlobalModal() {
  const isOpen = useModalStore((state) => state.isOpen);
  const title = useModalStore((state) => state.title);
  const message = useModalStore((state) => state.message);
  const onConfirm = useModalStore((state) => state.onConfirm);
  const onCancel = useModalStore((state) => state.onCancel);
  const { closeModal } = useModalStore((state) => state.actions);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[3000] flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-[2px] duration-200"
      onClick={handleCancel}
    >
      <div
        className="animate-in slide-in-from-bottom-5 w-[90%] max-w-[320px] rounded-2xl bg-white p-6 shadow-2xl duration-300 ease-out dark:border dark:border-white/10 dark:bg-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-primary m-0 text-[18px] font-bold">{title}</h3>
        </div>
        <div className="mb-6">
          <p className="text-text-primary m-0 text-[15px] leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
