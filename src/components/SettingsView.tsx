import React, { useState } from 'react';
import {
  Globe,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  Check,
  FileText,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  Sliders,
  Orbit,
} from 'lucide-react';
import { AppSettings, Journal, Language, JournalTheme, ColorMode } from '../types';
import { sound } from '../utils/audio';
import { getTranslations, formatNumberByLang } from '../utils/i18n';
import { INITIAL_JOURNALS, saveStoredJournals, saveStoredSettings } from '../utils/storage';
import { DashboardCalendarWidget } from './dashboard/DashboardCalendarWidget';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  journals: Journal[];
  onUpdateJournals: (journals: Journal[]) => void;
  onBackToDashboard: () => void;
  onToggleColorMode?: () => void;
  onOpenCalendar?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  journals,
  onUpdateJournals,
  onBackToDashboard,
  onOpenCalendar,
}) => {
  const lang = settings.language || 'fa';
  const t = getTranslations(lang);
  const isRtl = lang === 'fa';

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 2500);
  };

  const handleLanguageChange = (newLang: Language) => {
    sound.playTick(true);
    const updated: AppSettings = { ...settings, language: newLang };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    showNotification(newLang === 'fa' ? 'زبان برنامه به فارسی تغییر یافت' : 'Language switched to English');
  };

  const handleColorModeChange = (mode: ColorMode) => {
    sound.playTick(true);
    const updated: AppSettings = { ...settings, colorMode: mode };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  const handleThemeChange = (theme: JournalTheme) => {
    sound.playTick(true);
    const updated: AppSettings = { ...settings, theme };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  const handleAnimationChange = (animationStyle: 'flip' | 'slide' | 'fade' | 'none') => {
    sound.playTick(true);
    const updated: AppSettings = { ...settings, animationStyle };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  const handleSoundToggle = () => {
    const nextVal = !settings.soundEnabled;
    sound.enabled = nextVal;
    if (nextVal) sound.playTick(true);
    const updated: AppSettings = { ...settings, soundEnabled: nextVal };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    sound.volume = vol;
    const updated: AppSettings = { ...settings, soundVolume: vol };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  const handleRolloverToggle = () => {
    sound.playTick(true);
    const updated: AppSettings = { ...settings, autoRolloverTasks: !settings.autoRolloverTasks };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    sound.playAdd();
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      journals,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strategy_journal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(isRtl ? 'نسخه پشتیبان با موفقیت دانلود شد' : 'Backup downloaded successfully');
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.journals && Array.isArray(parsed.journals)) {
          sound.playAdd();
          onUpdateJournals(parsed.journals);
          saveStoredJournals(parsed.journals);
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
            saveStoredSettings(parsed.settings);
          }
          showNotification(isRtl ? 'اطلاعات با موفقیت بازیابی شد' : 'Data restored successfully');
        } else {
          alert(isRtl ? 'ساختار فایل پشتیبان معتبر نیست!' : 'Invalid backup file structure!');
        }
      } catch (err) {
        alert(isRtl ? 'خطا در خواندن فایل پشتیبان!' : 'Error reading backup file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset local state to default
  const handleResetData = () => {
    if (window.confirm(t.resetConfirmWarning)) {
      sound.playSwoosh();
      onUpdateJournals(INITIAL_JOURNALS);
      saveStoredJournals(INITIAL_JOURNALS);
      showNotification(isRtl ? 'داده‌ها به حالت پیش‌فرض بازگشتند' : 'Reset to default data');
    }
  };

  // Compute storage statistics
  const totalPages = journals.reduce((acc, j) => acc + Object.keys(j.pages || {}).length, 0);
  const estimatedStorageBytes = Math.round(
    (JSON.stringify(journals).length + JSON.stringify(settings).length) / 1024
  );

  const themeOptions: { id: JournalTheme; name: string; color: string }[] = [
    { id: 'sage', name: t.themeSage, color: '#3e5f44' },
    { id: 'latte', name: t.themeLatte, color: '#8a6543' },
    { id: 'midnight', name: t.themeMidnight, color: '#162b4d' },
    { id: 'plum', name: t.themePlum, color: '#592c3e' },
    { id: 'oled', name: t.themeOled, color: '#1c1917' },
    { id: 'rose', name: t.themeRose, color: '#9f4958' },
  ];

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex-1 min-h-screen bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 p-4 sm:p-6 md:p-8 lg:p-10 transition-colors duration-200 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-24">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playTick(true);
                onBackToDashboard();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800/80 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={t.backToDashboard}
            >
              {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                <Sliders size={22} className="text-stone-700 dark:text-stone-300" />
                <span>{t.settingsHeaderTitle}</span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t.settingsHeaderSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTick(true);
              onBackToDashboard();
            }}
            className="self-start sm:self-auto px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>{t.backToDashboard}</span>
            {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>

        {/* Live Notification Feedback Pill */}
        {notificationMsg && (
          <div className="sticky top-4 z-40 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2 self-center animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* SECTION 1: LANGUAGE & LOCALIZATION */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <Globe size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.languageSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.languageSectionDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Persian Option */}
            <button
              onClick={() => handleLanguageChange('fa')}
              className={`p-4 rounded-xl border text-right transition-all flex items-start justify-between cursor-pointer ${
                lang === 'fa'
                  ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-800 dark:border-stone-200 ring-1 ring-stone-800 dark:ring-stone-200 shadow-2xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>فارسی</span>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-200/60 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                    RTL
                  </span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t.persianOptionDesc}
                </span>
              </div>
              {lang === 'fa' && (
                <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* English Option */}
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                lang === 'en'
                  ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-800 dark:border-stone-200 ring-1 ring-stone-800 dark:ring-stone-200 shadow-2xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>English</span>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-200/60 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                    LTR
                  </span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t.englishOptionDesc}
                </span>
              </div>
              {lang === 'en' && (
                <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </section>

        {/* SECTION 2: APPEARANCE & THEMES */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <Sun size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.appearanceSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.appearanceSectionDesc}
              </p>
            </div>
          </div>

          {/* Color Mode Switcher */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleColorModeChange('light')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.colorMode === 'light'
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 text-stone-600 dark:text-stone-400 hover:bg-stone-100/60'
              }`}
            >
              <Sun size={18} />
              <span className="text-xs">{t.lightMode}</span>
            </button>

            <button
              onClick={() => handleColorModeChange('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.colorMode === 'dark'
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 text-stone-600 dark:text-stone-400 hover:bg-stone-100/60'
              }`}
            >
              <Moon size={18} />
              <span className="text-xs">{t.darkMode}</span>
            </button>

            <button
              onClick={() => handleColorModeChange('system')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.colorMode === 'system'
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 text-stone-600 dark:text-stone-400 hover:bg-stone-100/60'
              }`}
            >
              <Laptop size={18} />
              <span className="text-xs">{t.systemMode}</span>
            </button>
          </div>

          {/* Journal Theme Accent Presets */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/60">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.journalPresetsTitle}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    settings.theme === opt.id
                      ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 font-bold'
                      : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 hover:bg-stone-100/60 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span className="text-xs">{opt.name}</span>
                  </div>
                  {settings.theme === opt.id && <Check size={14} className="text-stone-900 dark:text-stone-100" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: ORBIT CALENDAR & ASTRONOMICAL CHRONOLOGY */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <Orbit size={20} className="animate-[spin_20s_linear_infinite]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{lang === 'fa' ? 'تقویم هوشمند مدار' : 'Orbit Dual Calendar'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                    {lang === 'fa' ? 'شمسی و میلادی' : 'Solar & Gregorian'}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {lang === 'fa'
                    ? 'گاه‌شماری کامل دوگانه خورشیدی و میلادی، رویدادهای تقویمی، وضعیت ماه و صورت فلکی'
                    : 'Complete dual solar and gregorian calendar with celestial events and moon phases'}
                </p>
              </div>
            </div>

            {onOpenCalendar && (
              <button
                type="button"
                onClick={() => {
                  sound.playSwoosh();
                  onOpenCalendar();
                }}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Orbit size={15} />
                <span>{lang === 'fa' ? 'مشاهده تقویم کامل مدار' : 'Open Full Orbit Calendar'}</span>
              </button>
            )}
          </div>

          <DashboardCalendarWidget
            onOpenFullCalendar={() => {
              if (onOpenCalendar) onOpenCalendar();
            }}
          />
        </section>

        {/* SECTION 3: ANIMATIONS & TRANSITIONS */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <Layers size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.animationSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.animationSectionDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'flip', title: t.flipAnim, desc: t.flipAnimDesc },
              { id: 'slide', title: t.slideAnim, desc: t.slideAnimDesc },
              { id: 'fade', title: t.fadeAnim, desc: t.fadeAnimDesc },
              { id: 'none', title: t.noneAnim, desc: t.noneAnimDesc },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => handleAnimationChange(anim.id as any)}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-start justify-between cursor-pointer ${
                  settings.animationStyle === anim.id
                    ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-800 dark:border-stone-200 ring-1 ring-stone-800 dark:ring-stone-200 font-semibold'
                    : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {anim.title}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {anim.desc}
                  </span>
                </div>
                {settings.animationStyle === anim.id && (
                  <Check size={14} className="text-stone-900 dark:text-stone-100 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 4: AUDIO & SOUND EFFECTS */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <Volume2 size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.audioSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.audioSectionDesc}
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {t.soundToggleLabel}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {t.soundToggleDesc}
              </span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 absolute top-1 transition-transform ${
                  settings.soundEnabled
                    ? isRtl
                      ? 'left-1'
                      : 'right-1'
                    : isRtl
                    ? 'right-1'
                    : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-stone-50/40 dark:bg-stone-900/30 border border-stone-200/50 dark:border-stone-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {t.volumeSliderLabel}
                </span>
                <span className="font-mono text-stone-500">
                  {formatNumberByLang(Math.round(settings.soundVolume * 100), lang)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            </div>
          )}

          {/* Test Sound Effects */}
          {settings.soundEnabled && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                {t.testAudioEffects}:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => sound.playTurnPage()}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer active:scale-95"
                >
                  {t.testFlip} 📄
                </button>
                <button
                  onClick={() => sound.playTick(true)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer active:scale-95"
                >
                  {t.testTick} ✓
                </button>
                <button
                  onClick={() => sound.playAdd()}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer active:scale-95"
                >
                  {t.testAdd} +
                </button>
                <button
                  onClick={() => sound.playSwoosh()}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer active:scale-95"
                >
                  {t.testSwoosh} ⚡
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: TASKS & PRODUCTIVITY */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <Sparkles size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.tasksSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.tasksSectionDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {t.autoRolloverLabel}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {t.autoRolloverDesc}
              </span>
            </div>
            <button
              onClick={handleRolloverToggle}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.autoRolloverTasks
                  ? 'bg-stone-900 dark:bg-stone-100'
                  : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 absolute top-1 transition-transform ${
                  settings.autoRolloverTasks
                    ? isRtl
                      ? 'left-1'
                      : 'right-1'
                    : isRtl
                    ? 'right-1'
                    : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* SECTION 6: BACKUP & DATA MANAGEMENT */}
        <section className="bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <HardDrive size={18} className="text-stone-700 dark:text-stone-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                {t.backupSectionTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.backupSectionDesc}
              </p>
            </div>
          </div>

          {/* Storage stats badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 flex flex-col items-center justify-center text-center">
              <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                {formatNumberByLang(journals.length, lang)}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5">{t.totalJournalsStat}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 flex flex-col items-center justify-center text-center">
              <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                {formatNumberByLang(totalPages, lang)}
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5">{t.totalPagesStat}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 flex flex-col items-center justify-center text-center">
              <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                ~{formatNumberByLang(estimatedStorageBytes, lang)} KB
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5">{t.storageEstimateStat}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Download size={15} />
              <span>{t.exportJsonBackup}</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-200/70 dark:border-stone-700/70 transition-all active:scale-95 cursor-pointer">
              <Upload size={15} />
              <span>{t.importJsonBackup}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200/70 dark:border-rose-900/70 transition-all active:scale-95 cursor-pointer mr-auto"
            >
              <RotateCcw size={14} />
              <span>{t.resetAllData}</span>
            </button>
          </div>
        </section>

        {/* SECTION 7: ABOUT */}
        <section className="p-4 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/50 flex flex-col gap-1 text-xs text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {t.aboutSectionTitle}
          </span>
          <span className="leading-relaxed">{t.aboutSectionDesc}</span>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200/40 dark:border-stone-800/40 mt-1">
            <span>{t.appVersionLabel}</span>
            <span>{t.buildStatusLabel}</span>
          </div>
        </section>
      </div>
    </main>
  );
};
