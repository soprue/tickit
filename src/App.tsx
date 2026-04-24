import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ReminderPage from './features/reminder/presentation/ReminderPage';
import LoginPage from './features/auth/presentation/LoginPage';
import { GlobalModal } from './shared/presentation/components/GlobalModal';
import { ActionProvider } from './shared/context/ActionContext';
import GlobalErrorBoundary from './shared/presentation/components/GlobalErrorBoundary';
import { useThemeStore } from './shared/domain/ThemeStore';

const App: React.FC = () => {
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
            <Route path="/" element={<ReminderPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
          <GlobalModal />
        </Router>
      </ActionProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
