import React from 'react';
import logoIcon from '@assets/logo.webp';
import { Icon } from './components/Icon';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

/**
 * 애플리케이션의 왼쪽 고정 사이드바 컴포넌트 (Tailwind 마이그레이션 완료)
 */
export const Sidebar: React.FC<SidebarProps> = ({ 
  isDarkMode, 
  onToggleTheme, 
  onLogout 
}) => {
  return (
    <aside className="w-[var(--sidebar-width)] h-full bg-white shadow-[2px_0_10px_rgba(0,0,0,0.03)] relative flex-shrink-0 z-[100] transition-colors duration-250 flex flex-col justify-between py-6 box-border dark:bg-[#151515] dark:shadow-[2px_0_10px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col items-center">
        <img src={logoIcon} alt="logo" className="w-[25px] h-[25px] mx-auto block" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <button 
          className="w-[34px] h-[34px] bg-[var(--color-icon-bg)] rounded-full flex justify-center items-center cursor-pointer transition-all duration-150 hover:opacity-80 dark:hover:bg-white/10 active:scale-90 border-none outline-none" 
          onClick={() => {
            console.log('Theme toggle clicked, current mode:', isDarkMode);
            onToggleTheme();
          }} 
          title="테마 변경"
        >
          <Icon 
            name={isDarkMode ? 'sunlight' : 'halfmoon'} 
            size={20} 
            color="var(--color-icon-brown)" 
          />
        </button>
        <button 
          className="w-[34px] h-[34px] bg-[var(--color-icon-bg)] rounded-full flex justify-center items-center cursor-pointer transition-all duration-150 hover:opacity-80 dark:hover:bg-white/10 active:scale-90 border-none outline-none" 
          onClick={onLogout} 
          title="로그아웃"
        >
          <Icon name="logout" size={20} color="var(--color-icon-brown)" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
