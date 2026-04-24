import React from 'react';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { Button } from './ui/Button';

/**
 * 전역 모달 컴포넌트 (Tailwind 마이그레이션 완료)
 * useModalStore의 상태에 따라 브라우저 내장 confirm()을 대신하여 화면에 표시됩니다.
 */
export const GlobalModal: React.FC = () => {
  const { isOpen, title, message, onConfirm, onCancel, closeModal } = useModalStore();

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
      className="fixed inset-0 w-full h-full bg-black/40 flex justify-center items-center z-[3000] backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div 
        className="bg-white dark:bg-[#2a2a2a] dark:border dark:border-white/10 w-[90%] max-w-[320px] rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-primary m-0">{title}</h3>
        </div>
        <div className="mb-6">
          <p className="text-[15px] text-text-primary leading-relaxed m-0">{message}</p>
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
};
