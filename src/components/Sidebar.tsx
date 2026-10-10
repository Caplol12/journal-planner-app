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
  Users,
  X,
  Settings as SettingsIcon,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { AppSettings } from '../types';
import { StrategyLogoSvg } from './StrategyLogoSvg';
import { getTranslations, formatNumberByLang } from '../utils/i18n';

interface SidebarProps {
  currentTab: 'all' | 'templates' | 'favorites';
  onSelectTab: (tab: 'all' | 'templates' | 'favorites') => void;
  onNewJournal: () => void;
  journalCount: number;
  starredCount: number;
  templatesCount?: number;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenBackup: () => void;
  onOpenAdmin: () => void;
  isAdminActive?: boolean;
  onOpenSettings?: () => void;
  isSettingsActive?: boolean;
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
  templatesCount = 4,
  settings,
  onUpdateSettings,
  onOpenBackup,
  onOpenAdmin,
  isAdminActive,
  onOpenSettings,
  isSettingsActive,
  onOpenCalendar,
  isCalendarActive,
  onOpenUsers,
  isUsersActive,
  onToggleColorMode,
  isOpenMobile,
  onCloseMobile,
}) => {
  const lang = settings.language || 'fa';
  const t = getTranslations(lang);
  const isRtl = lang === 'fa';
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

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-150/70 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden ${
          isOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Main Minimalist Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 ${
          isRtl ? 'right-0 border-l' : 'left-0 border-r'
        } z-50 w-72 max-w-[85vw] bg-[#fbfaf8] dark:bg-[#181817] border-stone-200/70 dark:border-stone-800/70 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 lg:z-20 overflow-y-auto ${
          isOpenMobile
            ? 'translate-x-0 shadow-2xl'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 select-none">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 border border-stone-300/40 dark:border-stone-700/50 p-1.5 transition-transform duration-200 group-hover:scale-105">
                <StrategyLogoSvg
                  size={20}
                  color="currentColor"
                  className="transition-transform group-hover:rotate-12 duration-300"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-none">
                    {t.brandTitle}
                  </h1>
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 font-mono tracking-wider">
                    v2
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {t.brandSubtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Quick theme toggle */}
              {onToggleColorMode && (
                <button
                  onClick={onToggleColorMode}
                  title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}

              {/* Close drawer button on mobile */}
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 lg:hidden cursor-pointer"
                  title={t.closeMenu}
                >
                  <X size={17} />
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
            className="w-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl py-2.5 px-3.5 text-sm font-medium flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>{t.newJournal}</span>
          </button>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1" aria-label="Main Navigation">
            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('all');
                })
              }
              className={navItemClass(
                currentTab === 'all' && !isAdminActive && !isCalendarActive && !isUsersActive && !isSettingsActive
              )}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen size={17} strokeWidth={1.8} />
                <span>{t.allJournals}</span>
              </div>
              <span className="text-xs font-mono text-stone-400 dark:text-stone-500">
                {formatNumberByLang(journalCount, lang)}
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('templates');
                })
              }
              className={navItemClass(
                currentTab === 'templates' && !isAdminActive && !isCalendarActive && !isUsersActive && !isSettingsActive
              )}
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={17} strokeWidth={1.8} />
                <span>{t.templates}</span>
              </div>
              <span className="text-xs font-mono text-stone-400 dark:text-stone-500">
                {formatNumberByLang(templatesCount, lang)}
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onSelectTab('favorites');
                })
              }
              className={navItemClass(
                currentTab === 'favorites' && !isAdminActive && !isCalendarActive && !isUsersActive && !isSettingsActive
              )}
            >
              <div className="flex items-center gap-2.5">
                <Star
                  size={17}
                  strokeWidth={1.8}
                  className={
                    currentTab === 'favorites' && !isAdminActive && !isCalendarActive && !isUsersActive && !isSettingsActive
                      ? 'fill-stone-900 dark:fill-stone-100'
                      : ''
                  }
                />
                <span>{t.favorites}</span>
              </div>
              <span className="text-xs font-mono text-stone-400 dark:text-stone-500">
                {formatNumberByLang(starredCount, lang)}
              </span>
            </button>

            <div className="my-2 border-t border-stone-200/50 dark:border-stone-800/50" />

            {/* User Registration and Database View Button */}
            {onOpenUsers && (
              <button
                onClick={() =>
                  handleAction(() => {
                    sound.playTick(true);
                    onOpenUsers();
                  })
                }
                className={navItemClass(Boolean(isUsersActive))}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={17} strokeWidth={1.8} />
                  <span>{t.usersAndMembers}</span>
                </div>
              </button>
            )}

            {/* Dedicated App Settings Button (First-Class Main Menu Item) */}
            {onOpenSettings && (
              <button
                onClick={() =>
                  handleAction(() => {
                    sound.playTick(true);
                    onOpenSettings();
                  })
                }
                className={navItemClass(Boolean(isSettingsActive))}
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon size={17} strokeWidth={1.8} />
                  <span>{t.settings}</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono uppercase">
                  {lang}
                </span>
              </button>
            )}

            {/* Admin Panel Button */}
            <button
              onClick={() =>
                handleAction(() => {
                  sound.playTick(true);
                  onOpenAdmin();
                })
              }
              className={navItemClass(Boolean(isAdminActive))}
            >
              <div className="flex items-center gap-2.5">
                <Shield size={17} strokeWidth={1.8} />
                <span>{t.serverAndCloud}</span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                {t.cloud}
              </span>
            </button>
          </nav>
        </div>

        {/* Footer Controls */}
        <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-4 flex flex-col gap-1.5">
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? t.disabled : t.enabled}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 size={15} className="text-stone-700 dark:text-stone-300" />
              ) : (
                <VolumeX size={15} />
              )}
              <span>{t.soundFeedback}</span>
            </div>
            <span className="text-[10px] text-stone-400">
              {settings.soundEnabled ? t.enabled : t.disabled}
            </span>
          </button>

          <button
            onClick={() => handleAction(onOpenBackup)}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download size={15} strokeWidth={1.8} />
              <span>{t.backupAndRestore}</span>
            </div>
            <Upload size={13} className="text-stone-400 dark:text-stone-500" />
          </button>
        </div>
      </aside>
    </>
  );
};
