import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// TODO: 추후 함수형으로 변환된 컴포넌트로 교체 예정
const HomeDummy = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🎫 Tickit 리마인더 (Home)</h1>
    <p>React 19 마이그레이션 진행 중...</p>
    <a href="#/login">로그인 페이지로 이동</a>
  </div>
);

const LoginDummy = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🔐 로그인 페이지</h1>
    <p>인증 시스템 전환 준비 중...</p>
    <a href="#/">홈으로 돌아가기</a>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeDummy />} />
        <Route path="/login" element={<LoginDummy />} />
      </Routes>
    </Router>
  );
};

export default App;
