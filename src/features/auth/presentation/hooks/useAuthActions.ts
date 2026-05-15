import { useNavigate } from 'react-router-dom';
import { useAuthControllerLogout } from '@features/auth/infrastructure/api/인증-auth/인증-auth';
import { useAuthStore } from '../../domain/AuthStore';
import { useReminderStore } from '@src/features/reminder/domain/ReminderStore';
import { useToastStore } from '@src/shared/domain/ToastStore';
import { ROUTES } from '@src/shared/constants';
import { getErrorMessage } from '@src/shared/utils/error';

/**
 * 인증 관련 액션(로그인, 로그아웃 등)을 관리하는 공통 훅
 */
export const useAuthActions = () => {
  const navigate = useNavigate();
  const logoutMutation = useAuthControllerLogout();
  const { clearAuth } = useAuthStore((state) => state.actions);
  const { reset: resetReminders } = useReminderStore((state) => state.actions);
  const { showToast } = useToastStore((state) => state.actions);

  const logout = async () => {
    try {
      // 서버 로그아웃 호출 (실패하더라도 클라이언트 로그아웃은 진행)
      await logoutMutation.mutateAsync();
      showToast('성공적으로 로그아웃 되었습니다.', 'success');
    } catch (error) {
      const message = getErrorMessage(error, '로그아웃 중 오류가 발생했습니다.');
      console.error('[Logout] Server logout failed:', message);
      showToast(`${message} 세션을 종료합니다.`, 'info');
    } finally {
      // 클라이언트 상태 초기화
      resetReminders(); // 리마인더 데이터 초기화 (localStorage/파일 포함)
      clearAuth(); // 인증 정보 초기화 (sessionStorage)
      
      // 필요한 경우 모든 캐시된 쿼리 초기화 (React Query)
      // queryClient.clear(); // 이 훅에서 queryClient를 사용할 수 있도록 수정 가능

      navigate(ROUTES.LOGIN);
    }
  };

  return {
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
};

