import { useNavigate } from 'react-router-dom';
import { useAuthControllerLogout } from '../infrastructure/api/인증-auth/인증-auth';
import { useAuthStore } from '../../domain/AuthStore';

/**
 * 인증 관련 액션(로그인, 로그아웃 등)을 관리하는 공통 훅
 */
export const useAuthActions = () => {
  const navigate = useNavigate();
  const logoutMutation = useAuthControllerLogout();
  const { clearAuth } = useAuthStore();

  const logout = async () => {
    try {
      // 서버 로그아웃 호출 (실패하더라도 클라이언트 로그아웃은 진행)
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('[Logout] Server logout failed:', error);
    } finally {
      // 클라이언트 상태 초기화 및 이동
      clearAuth();
      navigate('/login');
    }
  };

  return {
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
};
