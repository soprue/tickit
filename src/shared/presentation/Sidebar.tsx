import logoIcon from '@assets/logo.webp';
import { Icon } from './components/Icon';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

/**
 * 애플리케이션의 왼쪽 고정 사이드바 컴포넌트
 */
export function Sidebar({ isDarkMode, onToggleTheme, onLogout }: SidebarProps) {
  return (
    <aside className="duration-normal relative z-100 box-border flex h-full w-(--sidebar-width) shrink-0 flex-col justify-between border-r border-black/5 bg-white py-8 shadow-[2px_0_10px_rgba(0,0,0,0.03)] transition-colors dark:border-white/5 dark:bg-[#151515]">
      <div className="flex flex-col items-center">
        <img
          src={logoIcon}
          alt="logo"
          className="mx-auto block h-[28px] w-[28px] cursor-pointer transition-transform active:scale-95"
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          className="bg-icon-bg duration-fast group flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-none transition-all hover:opacity-80 active:scale-90 dark:hover:bg-white/10"
          onClick={() => {
            console.log('[Sidebar] Toggling theme, current isDarkMode:', isDarkMode);
            onToggleTheme();
          }}
          title="테마 변경"
        >
          <Icon
            name={isDarkMode ? 'sunlight' : 'halfmoon'}
            size={20}
            className="text-gray-medium dark:text-gray-medium transition-colors"
          />
        </button>
        <button
          className="bg-icon-bg duration-fast group flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-none transition-all hover:opacity-80 active:scale-90 dark:hover:bg-white/10"
          onClick={onLogout}
          title="로그아웃"
        >
          <Icon
            name="logout"
            size={20}
            className="text-gray-medium dark:text-gray-medium transition-colors"
          />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
