import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  BookOpen,
  Bookmark,
  Check,
  Eye,
  CalendarDays,
  FileCheck,
  FileCode,
  Upload,
  Sun,
  Moon,
  Orbit,
  Users,
} from 'lucide-react';
import { Journal, DayPage, TemplateType, CustomHtmlTemplate, ColorMode, Language } from '../types';
import { toPersianDigits, getDateKey } from '../utils/jalali';
import { sound } from '../utils/audio';
import { getTranslations, formatNumberByLang } from '../utils/i18n';
import { MiniPlannerSheet } from './MiniPlannerSheet';
import { MiniTemplate2Sheet } from './MiniTemplate2Sheet';
import { MiniTemplate3Sheet } from './MiniTemplate3Sheet';
import { MiniTemplate4Sheet } from './MiniTemplate4Sheet';
import {
  createEmptyTemplate3Page,
  createEmptyTemplate4Page,
  loadStoredCustomTemplates,
  saveStoredCustomTemplates,
} from '../utils/storage';
import { injectHtmlSyncScript } from '../utils/htmlTemplates';
import { AddHtmlTemplateModal } from './AddHtmlTemplateModal';
import { TemplateTestPlaygroundModal, TestTemplateItem } from './TemplateTestPlaygroundModal';
import { CloudTemplate, fetchCloudTemplates } from '../utils/supabaseTemplates';
import { isSupabaseConfigured } from '../utils/supabase';
import { FavoritesTemplateGallery } from './templates/FavoritesTemplateGallery';
import { HtmlTemplateThumbnail } from './templates/HtmlTemplateThumbnail';

interface DashboardProps {
  journals: Journal[];
  currentTab: 'all' | 'templates' | 'favorites';
  language?: Language;
  onOpenJournal: (journalId: string) => void;
  onEditCover: (journalId: string) => void;
  onToggleStar: (journalId: string) => void;
  onDuplicate: (journalId: string) => void;
  onDelete: (journalId: string) => void;
  onCreateFromTemplate: (title: string, color: string, templateType?: string) => void;
  onAddSheetTemplateToJournal?: (
    journalId: string,
    sheetData: DayPage,
    sheetTitle: string,
    customDateKey?: string
  ) => void;
  onCreateJournalWithTemplate?: (title: string, color: string, pageData: DayPage) => void;
  colorMode?: ColorMode;
  onToggleColorMode?: () => void;
  onOpenCalendar?: () => void;
  onOpenUsers?: () => void;
  onOpenJournalPage?: (journalId: string, dateKey: string) => void;
  onUpdateJournalPage?: (journalId: string, dateKey: string, updatedPage: DayPage) => void;
}

// Collection of Distinct Templates
export const PLANNER_TEMPLATES: TestTemplateItem[] = [
  {
    id: 'sheet_tpl_classic',
    templateType: 'template-1-green',
    title: 'قالب شماره ۱: برگه سبز رنگ (پلنر روزانه)',
    badge: 'قالب شماره ۱ (طرح سبز مریم‌گلی)',
    desc: 'الگوی کامل ۲۴ ساعته کرونودکس، زمان‌بندی خطی، ردیاب عادات، کارهای غیرروتین و ۳ اولویت طلایی.',
    pageData: {
      templateType: 'template-1-green',
      timeSlots: {
        8: { text: 'بررسی اهداف روز و ایمیل‌ها', color: '#86c5a5', cat: 'work' },
        9: { text: 'بازه تمرکز و کار عمیق', color: '#86c5a5', cat: 'work' },
        11: { text: 'جلسه هماهنگی تیمی', color: '#f28482', cat: 'meeting' },
        13: { text: 'ناهار و استراحت کوتاه', color: '#e9c46a', cat: 'meal' },
        16: { text: 'پیگیری پروژه‌ها و مستندات', color: '#86c5a5', cat: 'work' },
        19: { text: 'ورزش و پیاده‌روی عصرگاهی', color: '#f4a261', cat: 'health' },
        21: { text: 'مطالعه کتاب و بازتاب روز', color: '#85b8d9', cat: 'study' },
      },
      habits: [
        { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: true },
        { id: 'h2', text: 'ورزش یا پیاده‌روی صبحگاهی 🏃', done: true },
        { id: 'h3', text: '۲۰ دقیقه مطالعه کتاب تخصصی 📖', done: false },
        { id: 'h4', text: 'بررسی اولویت‌ها و اهداف روز 🎯', done: true },
      ],
      dailyNotes: 'روز سرشار از تمرکز و انرژی؛ پیاده‌سازی تسک‌ها بر اساس اولویت‌بندی دقیق.',
      nonRoutine: {
        followUps: ['پیگیری ارسال گزارش به مدیر پروژه'],
        admin: ['تایید فاکتورها'],
        docs: ['به‌روزرسانی مستندات فنی'],
        team: ['بررسی پول‌ریکوئست‌ها'],
        misc: [],
      },
      priorities: [
        { text: 'اتمام تسک‌های اساسی امروز', done: true },
        { text: 'تنظیم جلسات هماهنگی هفته', done: true },
        { text: 'مرور اهداف فردی و بازتاب روز', done: false },
      ],
      todos: [
        { id: 't1', text: 'ارسال ایمیل‌های پیگیری', done: true },
        { id: 't2', text: 'مرتب‌سازی یادداشت‌ها', done: false },
      ],
    },
  },
  {
    id: 'sheet_tpl_one_big_thing',
    templateType: 'template-2-one-big-thing',
    title: 'قالب شماره ۲: The One Big Thing و ماتریس آیزنهاور',
    badge: 'قالب شماره ۲ (طرح کلاسیک مونوکروم)',
    desc: 'هدف بزرگ روز (THE ONE BIG THING)، زمان‌بندی نیم‌ساعته ۸ صبح تا ۶ عصر با چک‌باکس، ماتریس ۴ بخشی آیزنهاور و برگه خط‌چین تخلیه ذهن (BRAIN DUMP).',
    pageData: {
      templateType: 'template-2-one-big-thing',
      timeSlots: {},
      habits: [],
      dailyNotes: '',
      nonRoutine: {
        followUps: [],
        admin: [],
        docs: [],
        team: [],
        misc: [],
      },
      priorities: [],
      todos: [],
      oneBigThing: 'تکمیل ماژول اصلی و انتشار نسخه جدید پروژه',
      halfHourSlots: {
        '08:00': { text: 'بررسی ایمیل‌ها و تنظیم اهداف روز', done: true, color: '#10b981' },
        '08:30': { text: 'آماده‌سازی تسک‌های روزانه', done: true, color: '#10b981' },
        '09:00': { text: 'شروع کار عمیق روی تسک اصلی', done: true, color: '#10b981' },
        '09:30': { text: 'ادامه توسعه ماژول', done: true, color: '#10b981' },
        '10:00': { text: 'بررسی کدها و رفع باگ‌های فوری', done: false, color: '#f43f5e' },
        '10:30': { text: 'تست یکپارچگی روی استیجینگ', done: false },
        '11:00': { text: 'جلسه هماهنگی اسپرینت با تیم فنی', done: false, color: '#0ea5e9' },
        '11:30': { text: 'جمع‌بندی تصمیمات جلسه', done: false, color: '#0ea5e9' },
        '12:00': { text: 'ناهار و استراحت کوتاه', done: false, color: '#f59e0b' },
        '12:30': { text: 'پیاده‌روی و بازگشت به میز کار', done: false },
        '13:00': { text: 'بازه دوم تمرکز عمیق', done: false, color: '#10b981' },
        '13:30': { text: 'حل چالش‌های دیتابیس', done: false },
        '14:00': { text: 'بهینه‌سازی کدهای فرانت‌اند', done: false },
        '14:30': { text: 'بررسی پول‌ریکوئست‌ها', done: false },
        '15:00': { text: 'پاسخ به سوالات فنی اعضای تیم', done: false, color: '#0ea5e9' },
        '15:30': { text: 'مستندسازی تغییرات اخیر', done: false, color: '#8b5cf6' },
        '16:00': { text: 'تست خروجی نهایی سیستم', done: false },
        '16:30': { text: 'بررسی متریک‌های سرور', done: false },
        '17:00': { text: 'ثبت لاگ و بازنگری در دستاوردها', done: false },
        '17:30': { text: 'مرور تسک‌های فردا و تخلیه ذهن', done: false },
        '18:00': { text: 'پایان ساعت کاری و ورزش عصرگاهی', done: false, color: '#f59e0b' },
        '18:30': { text: 'استراحت و اوقات فراغت', done: false },
      },
      eisenhowerMatrix: {
        urgentImportant: [
          { id: 'm1', text: 'رفع باگ بحرانی درگاه پرداخت', done: true },
          { id: 'm2', text: 'ارسال نسخه نهایی گزارش اسپرینت به مدیر', done: false },
        ],
        importantNotUrgent: [
          { id: 'm3', text: 'طراحی معماری فاز بعدی پروژه', done: false },
          { id: 'm4', text: 'ورزش و پیاده‌روی ۴۵ دقیقه‌ای', done: false },
          { id: 'm5', text: 'مطالعه مستندات فریم‌ورک جدید', done: false },
        ],
        urgentNotImportant: [
          { id: 'm6', text: 'پاسخ به ایمیل‌های اداری غیرفوری', done: false },
          { id: 'm7', text: 'تنظیم زمان جلسات هفته آینده', done: false },
        ],
        notUrgentNotImportant: [
          { id: 'm8', text: 'مرور شبکه‌های اجتماعی در ساعات کاری', done: true },
          { id: 'm9', text: 'مرتب‌سازی فایل‌های موقت دسکتاپ', done: false },
        ],
      },
      brainDump: `• ایده برای بهبود سرعت لودینگ صفحات با کش لوکال استوریج\n• بررسی کتابخانه جدید آیکون‌ها برای نسخه بعدی\n• خرید قهوه تازه و دفترچه یادداشت\n• صحبت با سارا درباره زمان‌بندی ارائه هفته آینده`,
    },
  },
  {
    id: 'sheet_tpl_writing_plans',
    templateType: 'template-3-writing-plans',
    title: 'قالب شماره ۳: طرح و برنامه‌ریزی نویسندگی (Writing Plans)',
    badge: 'قالب شماره ۳ (طرح نویسندگی و خلاقیت)',
    desc: 'ویژه نویسندگان و خالقان داستان؛ شامل ردیاب ۲۵ فصلی کتاب، شمارنده کلمات و پیشرفت، صحنه‌ها و ایده‌ها، دیالوگ و افکار شخصیت‌ها، جملات منتخب، پلی‌لیست الهام‌بخش، سنجش قهوه و چک‌این روزانه بازتاب.',
    pageData: createEmptyTemplate3Page(),
  },
  {
    id: 'sheet_tpl_celestial_todo',
    templateType: 'template-4-celestial-todo',
    title: 'قالب شماره ۴: فهرست روزانه کیهانی و کوهستان شب (Daily To-Do List)',
    badge: 'قالب شماره ۴ (طرح کیهانی و کوهستان شب)',
    desc: 'برنامه روزانه با پس‌زمینه ستاره‌ای، هلال ماه، بخش Daily Basics (صبح، خانه، وعده‌های غذایی و شب) و فهرست خط‌دار تسک‌های روزانه (Today\'s Tasks) با منظره کوهستان مه‌آلود و شفق.',
    pageData: createEmptyTemplate4Page(),
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  journals,
  currentTab,
  language = 'fa',
  onOpenJournal,
  onEditCover,
  onToggleStar,
  onDuplicate,
  onDelete,
  onCreateFromTemplate,
  onAddSheetTemplateToJournal,
  onCreateJournalWithTemplate,
  colorMode,
  onToggleColorMode,
  onOpenCalendar,
  onOpenUsers,
  onOpenJournalPage,
  onUpdateJournalPage,
}) => {
  const t = getTranslations(language);
  const isRtl = language === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Custom HTML Templates & Test Mode States
  const [isAddHtmlModalOpen, setIsAddHtmlModalOpen] = useState(false);
  const [testPlaygroundTemplate, setTestPlaygroundTemplate] = useState<TestTemplateItem | null>(null);

  const [customHtmlTemplates, setCustomHtmlTemplates] = useState<CustomHtmlTemplate[]>(() => {
    return loadStoredCustomTemplates();
  });

  const [cloudTemplates, setCloudTemplates] = useState<CloudTemplate[]>([]);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      let isMounted = true;
      fetchCloudTemplates()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setCloudTemplates(data);
          }
        })
        .catch((err) => {
          console.warn('Cloud templates not loaded:', err?.message || err);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [currentTab]);

  const handleSaveCustomHtmlTemplate = (newTemplate: CustomHtmlTemplate) => {
    sound.playAdd();
    setCustomHtmlTemplates((prev) => {
      const next = [newTemplate, ...prev];
      saveStoredCustomTemplates(next);
      return next;
    });
  };

  const handleDeleteCustomHtmlTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('آیا از حذف این قالب سفارشی اطمینان دارید؟')) {
      sound.playSwoosh();
      setCustomHtmlTemplates((prev) => {
        const next = prev.filter((t) => t.id !== id);
        saveStoredCustomTemplates(next);
        return next;
      });
    }
  };

  // Modal to choose notebook for adding sheet template
  const [selectedTemplateForAdd, setSelectedTemplateForAdd] = useState<{
    id: string;
    title: string;
    pageData: DayPage;
  } | null>(null);

  // Filter journals
  const filteredJournals = journals.filter((j) => {
    if (currentTab === 'favorites' && !j.starred) return false;
    if (searchQuery.trim()) {
      return j.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleApplyTemplateToExistingJournal = (journalId: string) => {
    if (!selectedTemplateForAdd) return;
    sound.playAdd();
    if (onAddSheetTemplateToJournal) {
      onAddSheetTemplateToJournal(
        journalId,
        selectedTemplateForAdd.pageData,
        selectedTemplateForAdd.title
      );
    } else {
      onOpenJournal(journalId);
    }
    setSelectedTemplateForAdd(null);
  };

  const handleCreateNewNotebookWithTemplate = () => {
    if (!selectedTemplateForAdd) return;
    sound.playAdd();
    const tType = selectedTemplateForAdd.pageData.templateType;
    const color =
      tType === 'template-4-celestial-todo'
        ? '#0d2244'
        : tType === 'template-3-writing-plans'
        ? '#3e5f44'
        : tType === 'template-2-one-big-thing'
        ? '#1c1917'
        : tType === 'template-custom-html'
        ? '#2563eb'
        : '#2d6a4f';

    if (onCreateJournalWithTemplate) {
      onCreateJournalWithTemplate(
        `دفترچه ${selectedTemplateForAdd.title}`,
        color,
        selectedTemplateForAdd.pageData
      );
    } else {
      onCreateFromTemplate(`دفترچه ${selectedTemplateForAdd.title}`, color, tType);
    }
    setSelectedTemplateForAdd(null);
  };

  const customItems: TestTemplateItem[] = customHtmlTemplates.map((ct) => ({
    id: ct.id,
    templateType: 'template-custom-html' as TemplateType,
    title: ct.title,
    badge: ct.badge || 'HTML سفارشی',
    desc: ct.desc,
    pageData: {
      templateType: 'template-custom-html' as TemplateType,
      customHtmlContent: ct.htmlContent,
      timeSlots: {},
      habits: [],
      dailyNotes: '',
      nonRoutine: { followUps: [], admin: [], docs: [], team: [], misc: [] },
      priorities: [],
      todos: [],
    } as DayPage,
    customHtmlContent: ct.htmlContent,
    isCustom: true,
  }));

  const cloudItems: TestTemplateItem[] = cloudTemplates
    .filter((ct) => ct.is_active)
    .map((ct) => ({
      id: `cloud_${ct.id}`,
      title: ct.title,
      badge: ct.badge || 'قالب ابری',
      templateType: 'template-custom-html' as TemplateType,
      desc: ct.description || 'قالب همگام‌شده از Supabase Storage',
      pageData: {
        templateType: 'template-custom-html' as TemplateType,
        customHtmlContent: ct.html_content,
        timeSlots: {},
        habits: [],
        dailyNotes: '',
        nonRoutine: { followUps: [], admin: [], docs: [], team: [], misc: [] },
        priorities: [],
        todos: [],
      } as DayPage,
      customHtmlContent: ct.html_content,
      isCustom: false,
    }));

  const allDisplayTemplates: TestTemplateItem[] = [...cloudItems, ...customItems, ...PLANNER_TEMPLATES];

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 overflow-y-auto min-h-screen bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/40 dark:border-stone-700/50 shrink-0">
              {currentTab === 'templates' ? (
                <Bookmark size={17} strokeWidth={2} />
              ) : currentTab === 'favorites' ? (
                <Star size={17} strokeWidth={2} />
              ) : (
                <BookOpen size={17} strokeWidth={2} />
              )}
            </span>
            <span>
              {currentTab === 'all'
                ? t.myJournals
                : currentTab === 'templates'
                ? t.templatesTabTitle
                : t.favoritesGalleryTitle}
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {currentTab === 'templates'
              ? t.templatesTabSubtitle
              : currentTab === 'favorites'
              ? t.favoritesSubtitle
              : t.myJournalsSubtitle(filteredJournals.length)}
          </p>
        </div>

        {/* Live Search & Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search size={15} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentTab === 'templates'
                  ? t.searchTemplatePlaceholder
                  : t.searchJournalPlaceholder
              }
              className={`w-full bg-stone-100/70 dark:bg-stone-800/60 border border-transparent focus:border-stone-300 dark:focus:border-stone-600 focus:bg-white dark:focus:bg-stone-800 rounded-xl ${
                isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
              } py-2 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none transition-all shadow-2xs`}
            />
          </div>

          {onOpenUsers && (
            <button
              type="button"
              onClick={onOpenUsers}
              title="فهرست کاربران"
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-stone-700 dark:text-stone-300 text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Users size={15} strokeWidth={1.8} />
              <span className="hidden sm:inline">کاربران</span>
            </button>
          )}

          {onToggleColorMode && (
            <button
              onClick={onToggleColorMode}
              title={colorMode === 'dark' ? 'تم روشن' : 'تم تاریک'}
              className="p-2 bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              {colorMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          TEMPLATES VIEW: DISTINCT PLANNER SHEET TEMPLATES
         ======================================================== */}
      {currentTab === 'templates' ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                <FileCheck size={18} strokeWidth={2} />
              </span>
              <div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  {t.templatesTabTitle}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t.templatesTabSubtitle}
                </span>
              </div>
            </div>

            {/* Actions: Add HTML Template Button + Counter */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playAdd();
                  setIsAddHtmlModalOpen(true);
                }}
                className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
              >
                <Upload size={14} />
                <span>{t.uploadHtmlTemplate}</span>
              </button>

              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                {t.templateCountLabel(allDisplayTemplates.length)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {allDisplayTemplates
              .filter((tpl) => {
                if (!searchQuery.trim()) return true;
                return (
                  tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tpl.desc.toLowerCase().includes(searchQuery.toLowerCase())
                );
              })
              .map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-[#191918] border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all duration-200 group"
              >
                {/* 1. Miniature Sheet Preview */}
                <div className="w-full">
                  {tpl.templateType === 'template-custom-html' ? (
                    <div
                      onClick={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 hover:border-stone-500 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden select-none"
                    >
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
                        <span className="text-xs font-mono font-bold text-stone-300 flex items-center gap-1.5">
                          <FileCode size={14} />
                          <span>HTML Template</span>
                        </span>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
                          HTML
                        </span>
                      </div>

                      <div className="w-full my-1 rounded-xl overflow-hidden border border-stone-700 relative bg-white">
                        <HtmlTemplateThumbnail
                          htmlContent={tpl.customHtmlContent || ''}
                          title={tpl.title}
                          virtualWidth={900}
                          virtualHeight={1250}
                        />
                      </div>

                      <div className="pt-2 text-center border-t border-stone-800 mt-2">
                        <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-200 transition-colors flex items-center justify-center gap-1.5">
                          <Eye size={13} />
                          <span>{t.liveTest}</span>
                        </span>
                      </div>
                    </div>
                  ) : tpl.templateType === 'template-4-celestial-todo' ? (
                    <MiniTemplate4Sheet
                      page={tpl.pageData}
                      hideDelete={true}
                      onOpen={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                    />
                  ) : tpl.templateType === 'template-3-writing-plans' ? (
                    <MiniTemplate3Sheet
                      page={tpl.pageData}
                      hideDelete={true}
                      onOpen={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                    />
                  ) : tpl.templateType === 'template-2-one-big-thing' ? (
                    <MiniTemplate2Sheet
                      page={tpl.pageData}
                      hideDelete={true}
                      onOpen={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                    />
                  ) : (
                    <MiniPlannerSheet
                      dateKey="2026-10-03"
                      page={tpl.pageData}
                      theme="sage"
                      titleOverride={tpl.title}
                      badgeOverride={tpl.badge}
                      hideDelete={true}
                      hideHeader={true}
                      onOpen={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                    />
                  )}
                </div>

                {/* 2. Template Info & Badges */}
                <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.templateType === 'template-custom-html' ? (
                      <>
                        <span className="bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          HTML TEMPLATE
                        </span>
                        <span className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                          {tpl.badge || 'HTML'}
                        </span>
                      </>
                    ) : tpl.templateType === 'template-4-celestial-todo' ? (
                      <>
                        <span className="bg-[#0b1b36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-serif border border-[#1e3c6d]">
                          {isRtl ? 'قالب شماره ۴' : 'Template 4'}
                        </span>
                        <span className="bg-[#102a54] text-[#93c5fd] text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          Celestial To-Do ☾
                        </span>
                      </>
                    ) : tpl.templateType === 'template-3-writing-plans' ? (
                      <>
                        <span className="bg-[#3e5f44] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          {isRtl ? 'قالب شماره ۳' : 'Template 3'}
                        </span>
                        <span className="bg-[#ede4d3] text-[#4a392b] text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          Writing Plans ♡
                        </span>
                      </>
                    ) : tpl.templateType === 'template-2-one-big-thing' ? (
                      <>
                        <span className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {isRtl ? 'قالب شماره ۲' : 'Template 2'}
                        </span>
                        <span className="bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          Eisenhower & Time-Blocking
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {isRtl ? 'قالب شماره ۱' : 'Template 1'}
                        </span>
                        <span className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ۲۴H Chronodex
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                    {tpl.desc}
                  </p>
                </div>

                {/* 3. Actions: Minimal Test Mode Button + Add Button + Subtle Delete if Custom */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSwoosh();
                      setTestPlaygroundTemplate(tpl);
                    }}
                    className="flex-1 bg-stone-100 dark:bg-stone-800/90 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 border border-stone-200/60 dark:border-stone-700/60"
                    title={t.liveTest}
                  >
                    <Eye size={14} />
                    <span>{t.liveTest}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playAdd();
                      setSelectedTemplateForAdd({
                        id: tpl.id,
                        title: tpl.title,
                        pageData: tpl.pageData,
                      });
                    }}
                    className="flex-1 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    title={t.addToJournal}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>{t.addToJournal}</span>
                  </button>

                  {tpl.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomHtmlTemplate(tpl.id, e)}
                      className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-rose-700 dark:text-stone-400 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-stone-200 dark:border-stone-700"
                      title={t.deleteTemplateConfirm}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentTab === 'favorites' ? (
        /* Favorites Templates Visual Gallery & Flipbook */
        <FavoritesTemplateGallery
          journals={journals}
          templates={allDisplayTemplates}
          onOpenJournalPage={(journalId, dateKey) => {
            if (onOpenJournalPage) {
              onOpenJournalPage(journalId, dateKey);
            } else {
              onOpenJournal(journalId);
            }
          }}
          onUpdateJournalPage={onUpdateJournalPage}
          onAddNewPageWithTemplate={(templateType, pageData) => {
            if (journals.length > 0) {
              if (onAddSheetTemplateToJournal) {
                onAddSheetTemplateToJournal(journals[0].id, pageData, 'برگه جدید');
              } else {
                onOpenJournal(journals[0].id);
              }
            } else {
              onCreateFromTemplate('ژورنال جدید', '#2d6a4f', templateType);
            }
          }}
        />
      ) : (
        /* Journal Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredJournals.map((journal) => {
            const pageCount = Object.keys(journal.pages || {}).length;
            const isMenuOpen = activeMenuId === journal.id;

            return (
              <div
                key={journal.id}
                onClick={() => onOpenJournal(journal.id)}
                className="bg-white dark:bg-[#1c1c1b] border border-stone-200/80 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer relative group"
              >
                {/* Information (Right side in RTL) */}
                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  {/* Top Row: Star + Title */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(journal.id);
                      }}
                      className="text-stone-300 dark:text-stone-600 hover:text-amber-500 transition-colors p-0.5 cursor-pointer"
                      title={journal.starred ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                    >
                      <Star
                        size={17}
                        className={`transition-transform duration-200 hover:scale-110 ${
                          journal.starred ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>
                    <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 truncate tracking-tight">
                      {journal.title}
                    </h3>
                  </div>

                  {/* Meta Row: Page Count + Date */}
                  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium text-[11px] px-2 py-0.5 rounded-md inline-flex items-center">
                      {toPersianDigits(pageCount)} برگه
                    </span>
                    <span className="font-mono text-[11px]">{toPersianDigits(journal.createdAt)}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* More dropdown button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : journal.id);
                        }}
                        className="bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg p-1.5 transition-colors cursor-pointer"
                        title="عملیات بیشتر"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-[#20201f] border border-stone-200 dark:border-stone-700/80 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 z-30"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditCover(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>تغییر نام</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDuplicate(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Copy size={12} />
                            <span>تکثیر ژورنال</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>حذف ژورنال</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCover(journal.id);
                      }}
                      className="bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg py-1 px-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>ویرایش جلد</span>
                    </button>
                  </div>
                </div>

                {/* Tactile Archival Notebook Illustration */}
                <div
                  className="w-20 h-28 rounded-r-xl rounded-l-xs shadow-2xs shrink-0 relative transition-transform duration-200 group-hover:-translate-y-0.5 notebook-spine overflow-hidden cursor-pointer flex flex-col justify-start border border-stone-900/10 dark:border-white/10"
                  style={{
                    backgroundColor: journal.color,
                    backgroundImage: journal.coverImage ? `url(${journal.coverImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!journal.coverImage && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/5 pointer-events-none" />
                  )}
                  {/* Subtle Spine Crease */}
                  <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />

                  {/* Clean Archival Label Strip */}
                  <div className="relative mt-3.5 z-10 w-[86%] bg-[#fcfbf9]/95 dark:bg-[#232322]/95 shadow-2xs rounded-r-md py-1 px-2 flex items-center border-y border-r border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[10px] font-medium text-stone-800 dark:text-stone-200 truncate tracking-tight">
                      {journal.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredJournals.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-2.5 text-stone-400">
              <BookOpen size={32} strokeWidth={1.5} className="text-stone-300 dark:text-stone-600" />
              <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">ژورنالی مطابق با جستجو یافت نشد.</p>
              <button
                onClick={() => onCreateFromTemplate('ژورنال جدید من', '#526b58')}
                className="mt-1 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-stone-800"
              >
                + ساخت ژورنال جدید
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Choose Notebook for Selected Sheet Template */}
      {selectedTemplateForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1c1c1b] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl flex flex-col gap-4 border border-stone-200/80 dark:border-stone-800 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={17} className="text-stone-700 dark:text-stone-300" />
                <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                  استفاده از {selectedTemplateForAdd.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplateForAdd(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              این برگه را به کدام‌یک از دفترچه‌های خود اضافه می‌کنید؟
            </p>

            {/* List of User's Existing Notebooks */}
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
              {journals.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleApplyTemplateToExistingJournal(j.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all text-right cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-8 rounded-r-md rounded-l-xs shadow-2xs shrink-0 relative notebook-spine"
                      style={{ backgroundColor: j.color }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                        {j.title}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">
                        {toPersianDigits(Object.keys(j.pages || {}).length)} برگه
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    افزودن برگه ↵
                  </span>
                </button>
              ))}
            </div>

            {/* Option to create a new notebook */}
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800">
              <button
                onClick={handleCreateNewNotebookWithTemplate}
                className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors active:scale-[0.99]"
              >
                <Plus size={15} />
                <span>ایجاد یک دفترچه جدید با این برگه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add HTML Template Modal */}
      <AddHtmlTemplateModal
        isOpen={isAddHtmlModalOpen}
        onClose={() => setIsAddHtmlModalOpen(false)}
        onSaveTemplate={handleSaveCustomHtmlTemplate}
      />

      {/* Live Testing Playground Modal */}
      <TemplateTestPlaygroundModal
        isOpen={Boolean(testPlaygroundTemplate)}
        onClose={() => setTestPlaygroundTemplate(null)}
        template={testPlaygroundTemplate}
        journals={journals}
        onApplyToJournal={(journalId, pageData, title, customDateKey) => {
          if (onAddSheetTemplateToJournal) {
            onAddSheetTemplateToJournal(journalId, pageData, title, customDateKey);
          }
        }}
        onCreateJournalWithTemplate={(title, color, pageData) => {
          if (onCreateJournalWithTemplate) {
            onCreateJournalWithTemplate(title, color, pageData);
          } else {
            onCreateFromTemplate(title, color, pageData.templateType);
          }
        }}
      />
    </main>
  );
};
