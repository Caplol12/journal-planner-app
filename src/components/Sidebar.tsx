import React from 'react';
import {
  BookOpen,
  Bookmark,
  Star,
  Plus,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Shield,
  Sun,
  Moon,
  Orbit,
  CalendarDays,
  Users,
  UserPlus,
  Compass,
  X,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { toPersianDigits } from '../utils/jalali';
import { AppSettings, ColorMode } from '../types';
import { StrategyLogoSvg } from './StrategyLogoSvg';

interface SidebarProps {
  currentTab: 'all' | 'templates' | 'favorites';
  onSelectTab: (tab: 'all' | 'templates' | 'favorites') => void;
  onNewJournal: () => void;
  journalCount: number;
  starredCount: number;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenBackup: () => void;
  onOpenAdmin: () => void;
  isAdminActive?: boolean;
  onOpenCalendar?: () => void;
  isCalendarActive?: boolean;
  onOpenUsers?: () => void;
  isUsersActive?: boolean;
  onToggleColorMode?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewJournal,
  journalCount,
  starredCount,
  settings,
  onUpdateSettings,
  onOpenBackup,
  onOpenAdmin,
  isAdminActive,
  onOpenCalendar,
  isCalendarActive,
  onOpenUsers,
  isUsersActive,
  onToggleColorMode,
  isOpenMobile,
  onCloseMobile,
}) => {
  const toggleSound = () => {
    const updated = !settings.soundEnabled;
    sound.enabled = updated;
    onUpdateSettings({ ...settings, soundEnabled: updated });
    if (updated) sound.playTick(true);
  };

  const isDarkMode = settings.colorMode === 'dark';

  const handleAction = (action: () => void) => {
    action();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden ${
          isOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Main Sidebar (Drawer on mobile/tablet, docked on desktop) */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 lg:shadow-sm lg:z-20 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 select-none">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300/90 dark:border-slate-600 flex items-center justify-center shadow-md shadow-slate-300/30 dark:shadow-black/40 shrink-0 group-hover:scale-105 transition-transform duration-300 p-1.5">
                <StrategyLogoSvg
                  size={24}
                  color="url(#silverGrad)"
                  className="transition-transform group-hover:scale-110 duration-300 drop-shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-300 ring-2 ring-white dark:ring-slate-900 shadow-2xs" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black tracking-wider font-sans text-slate-900 dark:text-white flex items-center leading-none">
                    <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-black tracking-widest text-[20px]">
                      STRATEGY
                    </span>
                  </h1>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono tracking-widest shadow-2xs">
                    OS
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase font-mono mt-0.5">
                  Planner & Orbit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick theme toggle button */}
              {onToggleColorMode && (
                <button
                  onClick={onToggleColorMode}
                  title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
                </button>
              )}

              {/* Close drawer button on mobile */}
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
                  title="بستن منو"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* New Journal Button */}
          <button
            onClick={() =>
              handleAction(() => {
                sound.playAdd();
                onNewJournal();
              })
            }
            className="w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:via-slate-100 hover:to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:via-slate-500 dark:hover:to-slate-700 text-slate-900 dark:text-white border border-slate-300/90 dark:border-slate-500 rounded-2xl py-3 px-4 text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-slate-400/20 dark:shadow-black/40 hover:shadow-lg hover:shadow-slate-400/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.5} className="text-slate-800 dark:text-slate-200" />
            <span>ژورنال جدید</span>
          </button>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5" aria-label="ناوبری اصلی">
            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('all');
                })
              }
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'all' && !isAdminActive && !isCalendarActive && !isUsersActive
                  ? 'bg-[#ffece5] dark:bg-orange-950/40 text-[#ff5024] dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} />
                <span>همه ژورنال‌ها</span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/70 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {toPersianDigits(journalCount)}
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('templates');
                })
              }
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'templates' && !isAdminActive && !isCalendarActive && !isUsersActive
                  ? 'bg-[#ffece5] dark:bg-orange-950/40 text-[#ff5024] dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark size={18} />
                <span>قالب‌ها</span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/70 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {toPersianDigits(4)}
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('favorites');
                })
              }
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'favorites' && !isAdminActive && !isCalendarActive && !isUsersActive
                  ? 'bg-[#ffece5] dark:bg-orange-950/40 text-[#ff5024] dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star
                  size={18}
                  className={
                    currentTab === 'favorites' && !isAdminActive && !isCalendarActive && !isUsersActive
                      ? 'fill-[#ff5024]'
                      : ''
                  }
                />
                <span>علاقه‌مندی‌ها</span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/70 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {toPersianDigits(starredCount)}
              </span>
            </button>

            {/* Orbit Dual Celestial Calendar Button */}
            {onOpenCalendar && (
              <button
                onClick={() =>
                  handleAction(() => {
                    sound.playTick(true);
                    onOpenCalendar();
                  })
                }
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer mt-2 ${
                  isCalendarActive
                    ? 'bg-cyan-500/15 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Orbit
                    size={18}
                    className={`transition-transform duration-500 ${
                      isCalendarActive ? 'text-cyan-500 rotate-90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>تقویم دوگانه مدار</span>
                </div>
                <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-300/30">
                  شمسی / میلادی
                </span>
              </button>
            )}

            {/* User Registration and Database View Button */}
            {onOpenUsers && (
              <button
                onClick={() =>
                  handleAction(() => {
                    sound.playTick(true);
                    onOpenUsers();
                  })
                }
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer mt-0.5 ${
                  isUsersActive
                    ? 'bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    size={18}
                    className={isUsersActive ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}
                  />
                  <span>ثبت‌نام و کاربران</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-300/30">
                  دیتابیس
                </span>
              </button>
            )}

            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onOpenAdmin();
                })
              }
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer mt-0.5 ${
                isAdminActive
                  ? 'bg-[#ffece5] dark:bg-orange-950/40 text-[#ff5024] dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className={isAdminActive ? 'text-[#ff5024]' : 'text-slate-400'} />
                <span>پنل مدیریت</span>
              </div>
              <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-[#ff6438] dark:text-orange-400 px-2 py-0.5 rounded-md">
                Supabase
              </span>
            </button>
          </nav>
        </div>

        {/* Footer Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <button
              onClick={toggleSound}
              title={settings.soundEnabled ? 'قطع صدا' : 'فعال‌سازی صدا'}
              className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {settings.soundEnabled ? (
                <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX size={16} />
              )}
              <span>{settings.soundEnabled ? 'افکت‌های صوتی فعال' : 'بی‌صدا'}</span>
            </button>
          </div>

          <button
            onClick={() => handleAction(onOpenBackup)}
            className="flex items-center justify-between px-2 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download size={15} />
              <span>پشتیبان‌گیری و بازیابی</span>
            </div>
            <Upload size={13} className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      </aside>
    </>
  );
};
