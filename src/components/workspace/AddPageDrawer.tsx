import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  BookOpen,
  Clock,
  Sparkles,
  PenTool,
  FileCode,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Journal, TemplateType, DayPage } from '../../types';
import {
  createEmptyDayPage,
  createEmptyTemplate2Page,
  createEmptyTemplate3Page,
  createEmptyTemplate4Page,
  loadStoredCustomTemplates,
} from '../../utils/storage';
import { formatJalaliDate, parseDateKey, getDateKey } from '../../utils/jalali';
import { sound } from '../../utils/audio';

interface AddPageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  journal: Journal;
  currentWorkspacePageIds: string[];
  onAddExistingPage: (pageId: string) => void;
  onAddNewPageWithTemplate: (pageId: string, pageData: DayPage, title?: string) => void;
}

export const AddPageDrawer: React.FC<AddPageDrawerProps> = ({
  isOpen,
  onClose,
  journal,
  currentWorkspacePageIds,
  onAddExistingPage,
  onAddNewPageWithTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'existing'>('templates');
  const [searchQuery, setSearchQuery] = useState('');

  const customTemplates = useMemo(() => loadStoredCustomTemplates(), []);

  // Standard Templates List
  const standardTemplates = [
    {
      type: 'template-1-green' as TemplateType,
      title: 'قالب شماره ۱: برگه سبز ۲۴H Chronodex',
      badge: '۲۴H Chronodex & Sage',
      desc: 'الگوی کامل ۲۴ ساعته کرونودکس، زمان‌بندی خطی، ردیاب عادات، کارهای غیرروتین و ۳ اولویت طلایی.',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60',
      factory: () => createEmptyDayPage('template-1-green'),
    },
    {
      type: 'template-2-one-big-thing' as TemplateType,
      title: 'قالب شماره ۲: The One Big Thing و ماتریس آیزنهاور',
      badge: 'Eisenhower & Big Thing',
      desc: 'هدف بزرگ روز، زمان‌بندی نیم‌ساعته ۸ صبح تا ۶ عصر، ماتریس ۴ بخشی آیزنهاور و برگه خط‌چین تخلیه ذهن.',
      icon: Clock,
      color: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300/60',
      factory: () => createEmptyTemplate2Page(),
    },
    {
      type: 'template-3-writing-plans' as TemplateType,
      title: 'قالب شماره ۳: Writing Plans (نویسندگی و خلاقیت)',
      badge: 'Writing Plans',
      desc: 'پروژه نویسندگی، هدف کلمات، چک‌این روزانه، صحنه‌های ماندگار در ذهن و ردپای خلاقیت.',
      icon: PenTool,
      color: 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border-amber-200/60',
      factory: () => createEmptyTemplate3Page(),
    },
    {
      type: 'template-4-celestial-todo' as TemplateType,
      title: 'قالب شماره ۴: Celestial Daily To-Do کیهانی',
      badge: 'Celestial To-Do',
      desc: 'طراحی گرادینت آسمان شب و کوهستان، عادات ۴گانه روزمره و تسک‌های متمرکز کیهانی.',
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 border-indigo-200/60',
      factory: () => createEmptyTemplate4Page(),
    },
  ];

  // Existing Journal Pages list
  const existingJournalPages = useMemo(() => {
    return Object.entries(journal.pages || {})
      .map(([dateKey, page]) => {
        let display = dateKey;
        try {
          const d = parseDateKey(dateKey);
          if (!isNaN(d.getTime())) {
            display = formatJalaliDate(d);
          }
        } catch {}
        const isAlreadyIn = currentWorkspacePageIds.includes(dateKey);
        return {
          dateKey,
          display,
          page,
          isAlreadyIn,
        };
      })
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [journal.pages, currentWorkspacePageIds]);

  if (!isOpen) return null;

  const handleCreateNewPage = (
    templateType: TemplateType,
    factory: () => DayPage,
    title?: string,
    customHtml?: string
  ) => {
    sound.playAdd();
    // Generate a unique page ID for this sheet in the journal
    const baseKey = getDateKey(new Date());
    let newKey = baseKey;
    let counter = 1;
    while (journal.pages[newKey]) {
      newKey = `${baseKey}_sheet_${counter}`;
      counter++;
    }

    const pageData = factory();
    if (templateType === 'template-custom-html' && customHtml) {
      pageData.templateType = 'template-custom-html';
      pageData.customHtmlContent = customHtml;
    }

    onAddNewPageWithTemplate(newKey, pageData, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="w-full max-w-2xl bg-white dark:bg-[#181817] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-800 dark:text-stone-200">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                افزودن برگه به فضای کار
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                یک برگه از قالب‌های متنوع اضافه کنید یا برگه‌ای از دفترچه را انتخاب نمایید
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Soft Count Warning if >= 5 */}
        {currentWorkspacePageIds.length >= 5 && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>توجه: در حال حاضر {currentWorkspacePageIds.length} برگه در فضای کار فعال است. باز نگه داشتن بیش از ۵ برگه همزمان ممکن است در سیستم‌های ضعیف‌تر سرعت را تحت تأثیر قرار دهد.</span>
          </div>
        )}

        {/* Tabs & Search */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              قالب‌های جدید
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'existing'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              برگه‌های موجود دفترچه ({existingJournalPages.length})
            </button>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی قالب یا برگه..."
              className="w-full bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 rounded-xl pr-8 pl-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
            />
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'templates' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {standardTemplates
                .filter(
                  (t) =>
                    !searchQuery.trim() ||
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.type}
                      onClick={() => handleCreateNewPage(tpl.type, tpl.factory, tpl.badge)}
                      className="p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-850 hover:bg-white dark:hover:bg-stone-800 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${tpl.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-200 block">
                            {tpl.title}
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed block">
                            {tpl.desc}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                        <span className="text-[10px] text-stone-400">{tpl.badge}</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform">
                          <span>افزودن</span>
                          <Plus size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}

              {/* Custom HTML Templates */}
              {customTemplates
                .filter(
                  (ct) =>
                    !searchQuery.trim() ||
                    ct.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ct.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ct) => (
                  <div
                    key={ct.id}
                    onClick={() =>
                      handleCreateNewPage(
                        'template-custom-html',
                        () => createEmptyDayPage('template-custom-html'),
                        ct.title,
                        ct.htmlContent
                      )
                    }
                    className="p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-850 hover:bg-white dark:hover:bg-stone-800 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 shrink-0">
                        <FileCode size={18} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                          {ct.title}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed block">
                          {ct.desc || 'قالب HTML سفارشی'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                        HTML TEMPLATE
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform">
                        <span>افزودن</span>
                        <Plus size={13} />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-2">
              {existingJournalPages
                .filter(
                  (ep) =>
                    !searchQuery.trim() ||
                    ep.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ep.dateKey.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ep) => (
                  <div
                    key={ep.dateKey}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      ep.isAlreadyIn
                        ? 'bg-stone-100/70 dark:bg-stone-850 border-stone-200/60 dark:border-stone-800 opacity-60'
                        : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:border-stone-400 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!ep.isAlreadyIn) {
                        onAddExistingPage(ep.dateKey);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={17} className="text-stone-400" />
                      <div>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                          {ep.display}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{ep.dateKey}</span>
                      </div>
                    </div>

                    {ep.isAlreadyIn ? (
                      <span className="text-xs text-stone-400 flex items-center gap-1 font-medium">
                        <Check size={14} />
                        <span>در فضای کار قرار دارد</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold rounded-xl flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>افزودن</span>
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
