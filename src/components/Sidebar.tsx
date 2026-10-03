import React from 'react';
import { BookOpen, Bookmark, Star, Plus, Volume2, VolumeX, Download, Upload, Shield } from 'lucide-react';
import { sound } from '../utils/audio';
import { toPersianDigits } from '../utils/jalali';
import { AppSettings } from '../types';

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
}) => {
  const toggleSound = () => {
    const updated = !settings.soundEnabled;
    sound.enabled = updated;
    onUpdateSettings({ ...settings, soundEnabled: updated });
    if (updated) sound.playTick(true);
  };

  return (
    <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm z-20">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff6438] inline-block shadow-sm animate-pulse" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ژورنال</h1>
        </div>

        {/* New Journal Button */}
        <button
          onClick={() => {
            sound.playAdd();
            onNewJournal();
          }}
          className="w-full bg-[#ff6438] hover:bg-[#f05427] text-white rounded-2xl py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>ژورنال جدید</span>
        </button>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5" aria-label="ناوبری اصلی">
          <button
            onClick={() => {
              sound.playTick(true);
              onSelectTab('all');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'all'
                ? 'bg-[#ffece5] text-[#ff5024] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} />
              <span>ژورنال‌های من</span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/70 px-2 py-0.5 rounded-md shadow-2xs">
              {toPersianDigits(journalCount)}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick(true);
              onSelectTab('templates');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'templates'
                ? 'bg-[#ffece5] text-[#ff5024] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark size={18} />
              <span>قالب‌ها</span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/70 px-2 py-0.5 rounded-md shadow-2xs">
              {toPersianDigits(3)}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick(true);
              onSelectTab('favorites');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-[#ffece5] text-[#ff5024] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Star size={18} className={currentTab === 'favorites' ? 'fill-[#ff5024]' : ''} />
              <span>علاقه‌مندی‌ها</span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/70 px-2 py-0.5 rounded-md shadow-2xs">
              {toPersianDigits(starredCount)}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick(true);
              onOpenAdmin();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer mt-1 ${
              isAdminActive
                ? 'bg-[#ffece5] text-[#ff5024] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className={isAdminActive ? 'text-[#ff5024]' : 'text-slate-400'} />
              <span>پنل مدیریت</span>
            </div>
            <span className="text-[10px] font-bold bg-orange-100 text-[#ff6438] px-2 py-0.5 rounded-md">
              Supabase
            </span>
          </button>
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'قطع صدا' : 'فعال‌سازی صدا'}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} />}
            <span>{settings.soundEnabled ? 'افکت‌های صوتی فعال' : 'بی‌صدا'}</span>
          </button>
        </div>

        <button
          onClick={onOpenBackup}
          className="flex items-center justify-between px-2 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download size={15} />
            <span>پشتیبان‌گیری و بازیابی</span>
          </div>
          <Upload size={13} className="text-slate-400" />
        </button>
      </div>
    </aside>
  );
};
