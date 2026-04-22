import React from 'react';
import { useModalStore } from '@src/shared/domain/ModalStore';
import { useThemeStore } from '@src/shared/domain/ThemeStore';

/**
 * 전역 모달 컴포넌트.
 * useModalStore의 상태에 따라 브라우저 내장 confirm()을 대신하여 화면에 표시됩니다.
 */
export const GlobalModal: React.FC = () => {
  const { isOpen, title, message, onConfirm, onCancel, closeModal } = useModalStore();
  const { isDarkMode } = useThemeStore();

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
    <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : ''}`} onClick={handleCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={handleCancel}>취소</button>
          <button className="modal-btn confirm" onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
};
