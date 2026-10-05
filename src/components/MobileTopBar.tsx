import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { StrategyLogoSvg } from './StrategyLogoSvg';
import { sound } from '../utils/audio';

interface MobileTopBarProps {
  onToggleMobileMenu: () => void;
  onNewJournal: () => void;
  isDarkMode: boolean;
  onToggleColorMode?: () => void;
  title?: string;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onToggleMobileMenu,
  onNewJournal,
  isDarkMode,
  onToggleColorMode,
  title = 'STRATEGY',
}) => {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between lg:hidden shadow-xs"
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs p-1">
          <StrategyLogoSvg size={20} color="url(#silverGrad)" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-wider text-slate-900 dark:text-white font-sans">
            {title}
          </span>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono">
            OS
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle & Hamburger */}
      <div className="flex items-center gap-1.5">
        {onToggleColorMode && (
          <button
            onClick={onToggleColorMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
          >
            {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
        )}

        <button
          onClick={() => {
            sound.playTick();
            onToggleMobileMenu();
          }}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="منوی برنامه‌ریزی"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};
