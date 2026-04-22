import React from 'react';
import logoIcon from '@assets/logo.webp';
import { Icon } from './components/Icon';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

/**
 * 애플리케이션의 왼쪽 고정 사이드바 컴포넌트 (React)
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  isDarkMode, 
  onToggleTheme, 
  onLogout 
}) => {
  // 다크모드 여부에 따라 아이콘 색상을 CSS 변수에서 가져오거나 직접 지정
  const iconColor = 'var(--color-icon-brown)';

  return (
    <aside className="sidemenu">
      <div className="sidemenu-top">
        <img src={logoIcon} alt="logo" className="logo-img" />
      </div>

      <div className="sidemenu-buttons">
        <div className="icon-circle" onClick={onToggleTheme} title="테마 변경">
          <Icon name={isDarkMode ? 'sunlight' : 'halfmoon'} size={20} color={iconColor} />
        </div>
        <div className="icon-circle" onClick={onLogout} title="로그아웃">
          <Icon name="logout" size={20} color={iconColor} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
