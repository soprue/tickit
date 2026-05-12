import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReminderPage from './features/reminder/presentation/ReminderPage';
import LoginPage from './features/auth/presentation/LoginPage';
import RegisterPage from './features/auth/presentation/RegisterPage';
import { GlobalModal } from './shared/presentation/components/GlobalModal';
import { GlobalToast } from './shared/presentation/components/GlobalToast';
import { ActionProvider } from './shared/context/ActionContext';
import GlobalErrorBoundary from './shared/presentation/components/GlobalErrorBoundary';
import { useThemeStore } from './shared/domain/ThemeStore';
import { useAuthStore } from './features/auth/domain/AuthStore';

/**
 * 로그인 여부를 확인하여 비로그인 사용자를 로그인 페이지로 리다이렉트하는 컴포넌트
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * 로그인한 사용자가 로그인/회원가입 페이지에 접근하는 것을 방지하는 컴포넌트
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isDarkMode } = useThemeStore();

  // 다크모드 상태 동기화
  useEffect(() => {
    console.log('App: isDarkMode changed to:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('App: Added .dark class to html');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('App: Removed .dark class from html');
    }
  }, [isDarkMode]);

  return (
    <GlobalErrorBoundary>
      <ActionProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <ReminderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
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
      </ActionProvider>
    </GlobalErrorBoundary>
  );
}

