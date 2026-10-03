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
  Check,
  Eye,
  CalendarDays,
  FileCheck,
  FileCode,
  Upload,
} from 'lucide-react';
import { Journal, DayPage, TemplateType, CustomHtmlTemplate } from '../types';
import { toPersianDigits, getDateKey } from '../utils/jalali';
import { sound } from '../utils/audio';
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

interface DashboardProps {
  journals: Journal[];
  currentTab: 'all' | 'templates' | 'favorites';
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
  onOpenJournal,
  onEditCover,
  onToggleStar,
  onDuplicate,
  onDelete,
  onCreateFromTemplate,
  onAddSheetTemplateToJournal,
  onCreateJournalWithTemplate,
}) => {
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
      fetchCloudTemplates()
        .then((data) => setCloudTemplates(data))
        .catch((err) => console.error('Error loading cloud templates in Dashboard:', err));
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
    <main className="flex-1 p-6 md:p-10 flex flex-col gap-8 overflow-y-auto min-h-screen">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span>{currentTab === 'templates' ? '📑' : '📚'}</span>
            <span>
              {currentTab === 'all'
                ? 'ژورنال‌های من'
                : currentTab === 'templates'
                ? 'قالب‌های برگه پلنر روزانه'
                : 'ژورنال‌های برگزیده و علاقه‌مندی‌ها'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentTab === 'templates'
              ? 'الگوهای استاندارد برگه پلنر با ساختار یکپارچه کرونودکس ۲۴ ساعته، زمان‌بندی خطی و عادات (مشابه برگه سبز رنگ)'
              : `شامل ${toPersianDigits(filteredJournals.length)} ژورنال شخصی آماده یادداشت`}
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentTab === 'templates'
                ? 'جستجوی عنوان قالب برگه...'
                : 'جستجوی عنوان ژورنال...'
            }
            className="w-full bg-white border border-slate-200 focus:border-[#ff6438] rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================
          TEMPLATES VIEW: DISTINCT PLANNER SHEET TEMPLATES
         ======================================================== */}
      {currentTab === 'templates' ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-700" />
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  مجموعه قالب‌های برگه پلنر روزانه (مستقل و متمایز)
                </span>
                <span className="text-[11px] text-slate-400">
                  برای تست و مشاهده زنده بر روی هر قالب کلیک کنید (بدون نیاز به ذخیره‌سازی در دفترچه)
                </span>
              </div>
            </div>

            {/* Actions: Add HTML Template Button + Counter */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playAdd();
                  setIsAddHtmlModalOpen(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Upload size={14} />
                <span>بارگذاری قالب (.html)</span>
              </button>

              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-xl">
                {toPersianDigits(allDisplayTemplates.length)} قالب
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
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-[32px] p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                {/* 1. Miniature Sheet Preview (Exact layout for each template) */}
                <div className="w-full">
                  {tpl.templateType === 'template-custom-html' ? (
                    <div
                      onClick={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                      className="w-full bg-slate-900 border-2 border-slate-700 hover:border-blue-400 rounded-2xl p-3 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden select-none"
                      style={{ minHeight: '440px' }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                          <FileCode size={14} />
                          <span>قالب HTML اختصاصی</span>
                        </span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                          HTML
                        </span>
                      </div>

                      <div className="flex-1 w-full my-1 bg-white rounded-xl overflow-hidden border border-slate-700 pointer-events-none relative">
                        <iframe
                          srcDoc={injectHtmlSyncScript(tpl.customHtmlContent || '')}
                          title={tpl.title}
                          scrolling="no"
                          className="w-full h-full min-h-[340px] border-none pointer-events-none"
                          sandbox=""
                        />
                      </div>

                      <div className="pt-2 text-center border-t border-slate-800">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5">
                          <Eye size={13} />
                          <span>کلیک برای تست و آزمایش زنده</span>
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
                      onOpen={() => {
                        sound.playSwoosh();
                        setTestPlaygroundTemplate(tpl);
                      }}
                    />
                  )}
                </div>

                {/* 2. Template Info & Badges */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.templateType === 'template-custom-html' ? (
                      <>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          HTML TEMPLATE
                        </span>
                        <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          قالب کاربری
                        </span>
                      </>
                    ) : tpl.templateType === 'template-4-celestial-todo' ? (
                      <>
                        <span className="bg-[#0b1b36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-serif border border-[#1e3c6d]">
                          قالب شماره ۴
                        </span>
                        <span className="bg-[#102a54] text-[#93c5fd] text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          Celestial To-Do ☾
                        </span>
                      </>
                    ) : tpl.templateType === 'template-3-writing-plans' ? (
                      <>
                        <span className="bg-[#3e5f44] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          قالب شماره ۳
                        </span>
                        <span className="bg-[#ede4d3] text-[#4a392b] text-[10px] font-bold px-2 py-0.5 rounded-full font-serif">
                          Writing Plans ♡
                        </span>
                      </>
                    ) : tpl.templateType === 'template-2-one-big-thing' ? (
                      <>
                        <span className="bg-black text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                          قالب شماره ۲
                        </span>
                        <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          Eisenhower & Time-Blocking
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          قالب شماره ۱
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ۲۴H Chronodex
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tpl.desc}
                  </p>
                </div>

                {/* 3. Actions: Minimal Test Mode Button + Add Button + Subtle Delete if Custom */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSwoosh();
                      setTestPlaygroundTemplate(tpl);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="تست و کار با برگه بدون ذخیره در دفترچه‌ها"
                  >
                    <Eye size={14} />
                    <span>تست زنده</span>
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
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="افزودن این برگه به دفترچه یادداشت"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>افزودن</span>
                  </button>

                  {tpl.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomHtmlTemplate(tpl.id, e)}
                      className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200 hover:border-rose-200"
                      title="حذف قالب"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Journal Cards Grid (Matching reference image) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJournals.map((journal) => {
            const pageCount = Object.keys(journal.pages || {}).length;
            const isMenuOpen = activeMenuId === journal.id;

            return (
              <div
                key={journal.id}
                onClick={() => onOpenJournal(journal.id)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer relative group hover:-translate-y-1"
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
                      className="text-slate-300 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title={journal.starred ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                    >
                      <Star
                        size={18}
                        className={`transition-transform duration-200 hover:scale-125 ${
                          journal.starred ? 'text-amber-400 fill-amber-400 drop-shadow-xs' : ''
                        }`}
                      />
                    </button>
                    <h3 className="text-base font-extrabold text-slate-900 truncate tracking-tight">
                      {journal.title}
                    </h3>
                  </div>

                  {/* Meta Row: Page Count + Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="bg-[#ffede8] text-[#ff542e] font-bold text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center">
                      {toPersianDigits(pageCount)} برگه
                    </span>
                    <span className="font-mono text-[11px]">🕒 {toPersianDigits(journal.createdAt)}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 mt-1">
                    {/* More dropdown button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : journal.id);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg p-1.5 transition-colors cursor-pointer"
                        title="عملیات بیشتر"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 bottom-full mb-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-30"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditCover(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>تغییر نام</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDuplicate(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Copy size={13} />
                            <span>تکثیر ژورنال</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(journal.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg w-full text-right cursor-pointer"
                          >
                            <Trash2 size={13} />
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
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>ویرایش جلد</span>
                    </button>
                  </div>
                </div>

                {/* 3D Realistic Notebook Illustration (Left side in RTL) */}
                <div
                  className="w-20 h-28 rounded-r-2xl rounded-l-xs shadow-md shrink-0 relative transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2 notebook-spine overflow-hidden cursor-pointer flex flex-col justify-start border border-black/10"
                  style={{
                    backgroundColor: journal.color,
                    backgroundImage: journal.coverImage ? `url(${journal.coverImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!journal.coverImage && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10 pointer-events-none" />
                  )}
                  {/* Spine Crease */}
                  <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/30 to-transparent pointer-events-none z-10" />
                  <div className="absolute top-0 bottom-0 left-[5px] w-[1px] bg-black/25 pointer-events-none z-10" />

                  {/* Cream Title Label Strip (matching image.png) */}
                  <div className="relative mt-4 z-10 w-[84%] bg-[#fbf6f3] shadow-xs rounded-r-xl py-1 px-2 flex items-center border-y border-r border-[#eddcd4]/50">
                    <span className="text-[10px] font-bold text-slate-800 truncate tracking-tight">
                      {journal.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredJournals.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="text-4xl">📖</span>
              <p className="text-sm font-semibold text-slate-600">ژورنالی مطابق با جستجوی شما یافت نشد.</p>
              <button
                onClick={() => onCreateFromTemplate('ژورنال جدید من', '#5fa8e8')}
                className="mt-2 text-xs font-bold text-[#ff6438] hover:underline cursor-pointer"
              >
                + ساخت ژورنال جدید همین حالا
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Choose Notebook for Selected Sheet Template */}
      {selectedTemplateForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 border border-slate-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">
                  استفاده از {selectedTemplateForAdd.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplateForAdd(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              این برگه ({selectedTemplateForAdd.title}) را به کدام‌یک از دفترچه‌های خود اضافه می‌کنید؟
            </p>

            {/* List of User's Existing Notebooks */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {journals.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleApplyTemplateToExistingJournal(j.id)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all text-right cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-9 rounded-r-lg rounded-l-xs shadow-2xs shrink-0 relative notebook-spine"
                      style={{ backgroundColor: j.color }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">
                        {j.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {toPersianDigits(Object.keys(j.pages || {}).length)} برگه
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    افزودن برگه ↵
                  </span>
                </button>
              ))}
            </div>

            {/* Option to create a new notebook */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleCreateNewNotebookWithTemplate}
                className="w-full bg-[#ff6438] hover:bg-[#f05427] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
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
