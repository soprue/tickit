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
    <aside className='w-(--sidebar-width) h-full bg-white shadow-[2px_0_10px_rgba(0,0,0,0.03)] relative shrink-0 z-100 transition-colors duration-normal flex flex-col justify-between py-8 box-border dark:bg-[#151515] border-r border-black/5 dark:border-white/5'>
      <div className='flex flex-col items-center'>
        <img
          src={logoIcon}
          alt='logo'
          className='w-[28px] h-[28px] mx-auto block active:scale-95 transition-transform cursor-pointer'
        />
      </div>

      <div className='flex flex-col items-center gap-6'>
        <button
          className='w-[34px] h-[34px] bg-icon-bg rounded-full flex justify-center items-center cursor-pointer transition-all duration-fast hover:opacity-80 dark:hover:bg-white/10 active:scale-90 border-none group'
          onClick={() => {
            console.log(
              '[Sidebar] Toggling theme, current isDarkMode:',
              isDarkMode,
            );
            onToggleTheme();
          }}
          title='테마 변경'
        >
          <Icon
            name={isDarkMode ? 'sunlight' : 'halfmoon'}
            size={20}
            className='text-gray-medium dark:text-gray-medium transition-colors'
          />
        </button>
        <button
          className='w-[34px] h-[34px] bg-icon-bg rounded-full flex justify-center items-center cursor-pointer transition-all duration-fast hover:opacity-80 dark:hover:bg-white/10 active:scale-90 border-none group'
          onClick={onLogout}
          title='로그아웃'
        >
          <Icon
            name='logout'
            size={20}
            className='text-gray-medium dark:text-gray-medium transition-colors'
          />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
