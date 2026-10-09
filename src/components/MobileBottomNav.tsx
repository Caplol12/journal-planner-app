import React from 'react';
import { BookOpen, Bookmark, Star, Orbit, Plus, Settings as SettingsIcon } from 'lucide-react';
import { sound } from '../utils/audio';
import { Language } from '../types';
import { getTranslations } from '../utils/i18n';

interface MobileBottomNavProps {
  currentTab: 'all' | 'templates' | 'favorites';
  isCalendarActive: boolean;
  isSettingsActive?: boolean;
  language?: Language;
  onSelectTab: (tab: 'all' | 'templates' | 'favorites') => void;
  onOpenCalendar: () => void;
  onOpenSettings?: () => void;
  onToggleMobileMenu: () => void;
  onNewJournal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  isCalendarActive,
  isSettingsActive,
  language = 'fa',
  onSelectTab,
  onOpenCalendar,
  onOpenSettings,
  onNewJournal,
}) => {
  const t = getTranslations(language);
  const isRtl = language === 'fa';

  const getTabClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
      isActive
        ? 'text-stone-900 dark:text-stone-100 font-bold'
        : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
    }`;

  return (
    <nav
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#fbfaf8]/92 dark:bg-[#181817]/92 backdrop-blur-md border-t border-stone-200/70 dark:border-stone-800/70 lg:hidden px-2 py-1 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Navigation"
    >
      {/* 1. All Journals Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onSelectTab('all');
        }}
        className={getTabClass(currentTab === 'all' && !isCalendarActive && !isSettingsActive)}
      >
        <BookOpen size={18} strokeWidth={1.8} />
        <span className="text-[10px] mt-0.5 tracking-tight">{t.allJournals}</span>
      </button>

      {/* 2. Templates Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onSelectTab('templates');
        }}
        className={getTabClass(currentTab === 'templates' && !isCalendarActive && !isSettingsActive)}
      >
        <Bookmark size={18} strokeWidth={1.8} />
        <span className="text-[10px] mt-0.5 tracking-tight">{t.templates}</span>
      </button>

      {/* 3. Center: Quick New Journal Action Button */}
      <button
        onClick={() => {
          sound.playAdd();
          onNewJournal();
        }}
        className="w-10 h-10 -mt-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 flex items-center justify-center shadow-xs border border-stone-200/40 dark:border-stone-700 active:scale-95 transition-transform cursor-pointer"
        title={t.newJournal}
      >
        <Plus size={19} strokeWidth={2.4} />
      </button>

      {/* 4. Calendar Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onOpenCalendar();
        }}
        className={getTabClass(Boolean(isCalendarActive))}
      >
        <Orbit size={18} strokeWidth={1.8} />
        <span className="text-[10px] mt-0.5 tracking-tight">{t.orbitCalendar}</span>
      </button>

      {/* 5. Settings Tab */}
      {onOpenSettings && (
        <button
          onClick={() => {
            sound.playTick(true);
            onOpenSettings();
          }}
          className={getTabClass(Boolean(isSettingsActive))}
        >
          <SettingsIcon size={18} strokeWidth={1.8} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t.settings}</span>
        </button>
      )}
    </nav>
  );
};
