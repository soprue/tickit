import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReminderPage from './features/reminder/presentation/ReminderPage';
import LoginPage from './features/auth/presentation/LoginPage';
import RegisterPage from './features/auth/presentation/RegisterPage';
import { GlobalModal } from './shared/presentation/components/GlobalModal';
import { GlobalToast } from './shared/presentation/components/GlobalToast';
import { SyncStatusProvider } from './shared/context/SyncStatusContext';
import GlobalErrorBoundary from './shared/presentation/components/GlobalErrorBoundary';
import { useThemeStore } from './shared/domain/ThemeStore';
import { useAuthStore } from './features/auth/domain/AuthStore';
import { useNetworkStatus } from './shared/presentation/hooks/useNetworkStatus';
import { ROUTES } from './shared/constants';

/**
 * 로그인 여부를 확인하여 비로그인 사용자를 로그인 페이지로 리다이렉트하는 컴포넌트
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
}

/**
 * 로그인한 사용자가 로그인/회원가입 페이지에 접근하는 것을 방지하는 컴포넌트
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  useNetworkStatus();

  // 다크모드 상태 동기화
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  return (
    <GlobalErrorBoundary>
      <SyncStatusProvider>
        <Router>
          <Routes>
            <Route 
              path={ROUTES.HOME} 
              element={
                <ProtectedRoute>
                  <ReminderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path={ROUTES.REGISTER} 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
          </Routes>
          <GlobalModal />
          <GlobalToast />
        </Router>
      </SyncStatusProvider>
    </GlobalErrorBoundary>
  );
}
