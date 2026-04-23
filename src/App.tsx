import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ReminderPage from './features/reminder/presentation/ReminderPage';
import LoginPage from './features/auth/presentation/LoginPage';
import { GlobalModal } from './shared/presentation/components/GlobalModal';
import { ActionProvider } from './shared/context/ActionContext';

const App: React.FC = () => {
  return (
    <ActionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ReminderPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <GlobalModal />
      </Router>
    </ActionProvider>
  );
};

export default App;
