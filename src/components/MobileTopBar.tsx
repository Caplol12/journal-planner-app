import React from 'react';
import { Menu, Sun, Moon, Orbit } from 'lucide-react';
import { StrategyLogoSvg } from './StrategyLogoSvg';
import { sound } from '../utils/audio';

interface MobileTopBarProps {
  onToggleMobileMenu: () => void;
  onNewJournal: () => void;
  isDarkMode: boolean;
  onToggleColorMode?: () => void;
  onOpenCalendar?: () => void;
  title?: string;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onToggleMobileMenu,
  isDarkMode,
  onToggleColorMode,
  onOpenCalendar,
  title = 'استراتژی',
}) => {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 w-full bg-[#fbfaf8]/90 dark:bg-[#181817]/90 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/70 px-4 py-2.5 flex items-center justify-between lg:hidden"
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-stone-200/80 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 border border-stone-300/40 dark:border-stone-700/50 p-1">
          <StrategyLogoSvg size={16} color="currentColor" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {title}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            v2
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {onOpenCalendar && (
          <button
            onClick={() => {
              sound.playTick(true);
              onOpenCalendar();
            }}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="تقویم مدار"
          >
            <Orbit size={17} />
          </button>
        )}

        {onToggleColorMode && (
          <button
            onClick={onToggleColorMode}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'تم روشن' : 'تم تاریک'}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <button
          onClick={() => {
            sound.playTick();
            onToggleMobileMenu();
          }}
          className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title="منوی اصلی"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
};
