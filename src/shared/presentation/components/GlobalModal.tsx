import React from 'react';
import { useModalStore } from '@src/shared/domain/ModalStore';

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
          <p className="text-[15px] text-black dark:text-gray-200 leading-relaxed m-0">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            className="px-5 py-2 rounded-lg font-semibold text-[14px] cursor-pointer border-none transition-all bg-gray-soft text-gray-medium hover:bg-gray-light dark:bg-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#4a4a4a]" 
            onClick={handleCancel}
          >
            취소
          </button>
          <button 
            className="px-5 py-2 rounded-lg font-semibold text-[14px] cursor-pointer border-none transition-all bg-primary text-white hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-primary/20" 
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
