import React from 'react';
import { BookOpen, Bookmark, Star, Orbit, Menu, Plus } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileBottomNavProps {
  currentTab: 'all' | 'templates' | 'favorites';
  isCalendarActive: boolean;
  onSelectTab: (tab: 'all' | 'templates' | 'favorites') => void;
  onOpenCalendar: () => void;
  onToggleMobileMenu: () => void;
  onNewJournal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  isCalendarActive,
  onSelectTab,
  onOpenCalendar,
  onToggleMobileMenu,
  onNewJournal,
}) => {
  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="ناوبری همراه"
    >
      {/* 1. All Journals Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onSelectTab('all');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          currentTab === 'all' && !isCalendarActive
            ? 'text-[#ff5024] font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <BookOpen size={20} />
        <span className="text-[10px] mt-1 tracking-tight">ژورنال‌ها</span>
      </button>

      {/* 2. Templates Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onSelectTab('templates');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          currentTab === 'templates' && !isCalendarActive
            ? 'text-[#ff5024] font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Bookmark size={20} />
        <span className="text-[10px] mt-1 tracking-tight">قالب‌ها</span>
      </button>

      {/* 3. Center: Quick New Journal Action Button */}
      <button
        onClick={() => {
          sound.playAdd();
          onNewJournal();
        }}
        className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-r from-[#ff5722] via-[#ff6438] to-[#f59e0b] text-white flex items-center justify-center shadow-lg shadow-orange-500/35 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform cursor-pointer"
        title="ژورنال جدید"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* 4. Favorites Gallery Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onSelectTab('favorites');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          currentTab === 'favorites' && !isCalendarActive
            ? 'text-[#ff5024] font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Star size={20} className={currentTab === 'favorites' && !isCalendarActive ? 'fill-[#ff5024]' : ''} />
        <span className="text-[10px] mt-1 tracking-tight">برگزیده‌ها</span>
      </button>

      {/* 5. Calendar Tab */}
      <button
        onClick={() => {
          sound.playTick(true);
          onOpenCalendar();
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          isCalendarActive
            ? 'text-cyan-500 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Orbit size={20} className={isCalendarActive ? 'rotate-45 transition-transform' : ''} />
        <span className="text-[10px] mt-1 tracking-tight">تقویم مدار</span>
      </button>

      {/* 6. More Menu (Drawer trigger) */}
      <button
        onClick={() => {
          sound.playTick();
          onToggleMobileMenu();
        }}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
      >
        <Menu size={20} />
        <span className="text-[10px] mt-1 tracking-tight">منو</span>
      </button>
    </nav>
  );
};
