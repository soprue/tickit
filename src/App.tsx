import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ReminderPage from './features/reminder/presentation/ReminderPage';
import LoginPage from './features/auth/presentation/LoginPage';
import { GlobalModal } from './shared/presentation/components/GlobalModal';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ReminderPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <GlobalModal />
    </Router>
  );
};

export default App;
