import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  Calendar,
  Search,
  CalendarDays,
  LayoutGrid,
  Sun,
  Moon,
  ChevronDown,
  Check,
  MoreHorizontal,
  X,
  Trash2,
  Palette,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Journal, TemplateType, CustomHtmlTemplate, DayPage, ColorMode } from '../types';
import { formatJalaliDate, getDateKey, parseDateKey, toPersianDigits, PERSIAN_DAYS } from '../utils/jalali';
import { sound } from '../utils/audio';
import { loadStoredCustomTemplates } from '../utils/storage';
import { MiniPlannerSheet } from './MiniPlannerSheet';
import { MiniTemplate2Sheet } from './MiniTemplate2Sheet';
import { MiniTemplate3Sheet } from './MiniTemplate3Sheet';
import { MiniTemplate4Sheet } from './MiniTemplate4Sheet';

interface PagesOverviewProps {
  journal: Journal;
  onBackToDashboard: () => void;
  onOpenPage: (dateKey: string) => void;
  onAddNewPage: (dateKey: string, templateType?: string, initialData?: DayPage) => void;
  onDeletePage: (dateKey: string) => void;
  onEditCover: () => void;
  onOpenWorkspace?: () => void;
  colorMode?: ColorMode;
  onToggleColorMode?: () => void;
}

interface TemplateOption {
  id: TemplateType;
  title: string;
  subtitle: string;
  icon: string;
}

export const PagesOverview: React.FC<PagesOverviewProps> = ({
  journal,
  onBackToDashboard,
  onOpenPage,
  onAddNewPage,
  onDeletePage,
  onEditCover,
  onOpenWorkspace,
  colorMode,
  onToggleColorMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(() => getDateKey(new Date()));
  const [chosenTemplateForNewPage, setChosenTemplateForNewPage] = useState<TemplateType>(() => {
    try {
      const saved = localStorage.getItem('planner_chosen_template');
      if (saved) return saved as TemplateType;
    } catch {}
    return 'template-1-green';
  });
  const [customTemplates] = useState<CustomHtmlTemplate[]>(() => loadStoredCustomTemplates());

  // Dropdown & Menu popover states
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isJournalMenuOpen, setIsJournalMenuOpen] = useState(false);
  const [deletingDateKey, setDeletingDateKey] = useState<string | null>(null);

  const createMenuRef = useRef<HTMLDivElement>(null);
  const journalMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
      }
      if (journalMenuRef.current && !journalMenuRef.current.contains(e.target as Node)) {
        setIsJournalMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (tpl: TemplateType) => {
    sound.playPop();
    setChosenTemplateForNewPage(tpl);
    try {
      localStorage.setItem('planner_chosen_template', tpl);
    } catch {}
  };

  // Sort pages chronologically descending (latest first)
  const pageEntries = Object.entries(journal.pages || {}).sort((a, b) => {
    return b[0].localeCompare(a[0]);
  });

  const filteredPages = pageEntries.filter(([dateKey, page]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const dateObj = parseDateKey(dateKey);
    const dateStr = formatJalaliDate(dateObj).toLowerCase();
    const dayName = PERSIAN_DAYS[dateObj.getDay()].toLowerCase();
    const notesStr = (page.dailyNotes || page.brainDump || '').toLowerCase();
    const bigThingStr = (page.oneBigThing || '').toLowerCase();
    const prioritiesStr = (page.priorities || []).map((p) => p.text).join(' ').toLowerCase();

    return (
      dateStr.includes(q) ||
      dayName.includes(q) ||
      notesStr.includes(q) ||
      bigThingStr.includes(q) ||
      prioritiesStr.includes(q)
    );
  });

  const totalPages = pageEntries.length;

  // Next suggested date calculation
  const getNextSuggestedDate = () => {
    if (pageEntries.length > 0) {
      const latestDateKey = pageEntries[0][0];
      const d = parseDateKey(latestDateKey);
      d.setDate(d.getDate() + 1);
      return d;
    }
    return new Date();
  };

  const nextSuggested = getNextSuggestedDate();
  const nextSuggestedKey = getDateKey(nextSuggested);
  const nextDayName = PERSIAN_DAYS[nextSuggested.getDay()];

  // Today date calculation
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayDayName = PERSIAN_DAYS[today.getDay()];
  const hasTodayPage = Boolean(journal.pages && journal.pages[todayKey]);

  // Unified page creation logic
  const createPage = (dateKey: string, tpl: TemplateType = chosenTemplateForNewPage) => {
    sound.playAdd();
    setIsCreateMenuOpen(false);

    if (tpl.startsWith('custom_') || tpl === 'template-custom-html') {
      const ct = customTemplates.find((t) => t.id === tpl);
      onAddNewPage(dateKey, 'template-custom-html', ct ? {
        templateType: 'template-custom-html',
        customHtmlContent: ct.htmlContent,
        timeSlots: {},
        dialSectors: {},
        habits: [],
        dailyNotes: '',
        nonRoutine: { followUps: [], admin: [], docs: [], team: [], misc: [] },
        priorities: [],
        todos: [],
      } : undefined);
    } else {
      onAddNewPage(dateKey, tpl);
    }
  };

  const handleCreateCustomDatePage = () => {
    if (customDateInput) {
      createPage(customDateInput, chosenTemplateForNewPage);
      setIsDatePickerOpen(false);
    }
  };

  const standardTemplates: TemplateOption[] = [
    {
      id: 'template-1-green',
      title: 'پلنر روزانه (مریم‌گلی)',
      subtitle: 'کرونودکس ۲۴ ساعته، زمان‌بندی خطی و عادات',
      icon: '🌿',
    },
    {
      id: 'template-2-one-big-thing',
      title: 'تمرکز و ماتریس (One Big Thing)',
      subtitle: 'هدف اصلی روز و ماتریس اولویت‌ها',
      icon: '📋',
    },
    {
      id: 'template-3-writing-plans',
      title: 'طرح‌ها و نویسندگی (Writing Plans)',
      subtitle: 'فضای متنی آزاد و یادداشت‌های عمیق',
      icon: '🌲',
    },
    {
      id: 'template-4-celestial-todo',
      title: 'تسک‌های آسمانی (Celestial)',
      subtitle: 'فهرست کارهای ستاره‌ای و آرامش شبانه',
      icon: '☾',
    },
  ];

  const currentTemplateTitle =
    standardTemplates.find((t) => t.id === chosenTemplateForNewPage)?.title ||
    customTemplates.find((t) => t.id === chosenTemplateForNewPage)?.title ||
    'پلنر روزانه';

  return (
    <div className="flex-1 min-h-screen bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto transition-colors duration-200">
      {/* 1. Header & Identity Section (Clutter-free & focused) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-5">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              sound.playSwoosh();
              onBackToDashboard();
            }}
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
            title="بازگشت به کتابخانه ژورنال‌ها"
          >
            <ArrowRight size={17} />
          </button>

          {/* Notebook Thumbnail & Title */}
          <div className="flex items-center gap-3">
            <div
              onClick={onEditCover}
              className="w-10 h-13 rounded-r-lg rounded-l-xs shadow-2xs shrink-0 relative notebook-spine cursor-pointer transition-transform hover:-translate-y-0.5 border border-stone-900/10 dark:border-white/10 overflow-hidden flex flex-col justify-start"
              style={{
                backgroundColor: journal.color,
                backgroundImage: journal.coverImage ? `url(${journal.coverImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              title="کلیک برای ویرایش جلد و رنگ"
            >
              <div className="relative mt-2 z-10 w-[84%] bg-[#fcfbf9]/95 dark:bg-[#232322]/95 shadow-2xs rounded-r-md py-0.5 px-1 flex items-center border-y border-r border-stone-200/60 dark:border-stone-700/60">
                <span className="text-[7.5px] font-medium text-stone-800 dark:text-stone-200 truncate">
                  {journal.title}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  {journal.title}
                </h1>
                <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium text-xs px-2.5 py-0.5 rounded-md">
                  {toPersianDigits(totalPages)} برگه
                </span>

                {/* Journal Context Menu (...) */}
                <div className="relative" ref={journalMenuRef}>
                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsJournalMenuOpen(!isJournalMenuOpen);
                    }}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                    title="گزینه‌های دفترچه"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {isJournalMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1c1c1b] border border-stone-200/80 dark:border-stone-800 rounded-xl shadow-float z-30 p-1.5 flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setIsJournalMenuOpen(false);
                          onEditCover();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                      >
                        <Palette size={14} className="text-stone-500" />
                        <span>ویرایش جلد و رنگ دفترچه</span>
                      </button>

                      {onToggleColorMode && (
                        <button
                          onClick={() => {
                            setIsJournalMenuOpen(false);
                            onToggleColorMode();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer border-t border-stone-100 dark:border-stone-800/60 pt-1.5"
                        >
                          {colorMode === 'dark' ? (
                            <>
                              <Sun size={14} className="text-amber-500" />
                              <span>حالت روشن (Light)</span>
                            </>
                          ) : (
                            <>
                              <Moon size={14} className="text-stone-400" />
                              <span>حالت تاریک (Dark)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                فهرست برگه‌های ثبت‌شده و زمان‌بندی روزانه
              </p>
            </div>
          </div>
        </div>

        {/* 2. Unified Primary Action (80/20 Pareto Consolidation) */}
        <div className="flex items-center gap-2">
          {onOpenWorkspace && (
            <button
              onClick={() => {
                sound.playSwoosh();
                onOpenWorkspace();
              }}
              className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700/80 cursor-pointer transition-all shadow-2xs active:scale-95"
              title="ورود به فضای کار چندبرگه‌ای (مشاهده و کار با چند برگه همزمان)"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">فضای کار چندبرگه‌ای</span>
            </button>
          )}

          {/* Split / Dropdown Action Button */}
          <div className="relative inline-flex items-stretch rounded-xl shadow-2xs" ref={createMenuRef}>
            {/* Primary Action Button */}
            {!hasTodayPage ? (
              <button
                onClick={() => createPage(todayKey)}
                className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-3.5 py-2 rounded-r-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                title={`ایجاد برگه امروز (${todayDayName})`}
              >
                <CalendarDays size={14} />
                <span>برگه امروز ({todayDayName})</span>
              </button>
            ) : (
              <button
                onClick={() => createPage(nextSuggestedKey)}
                className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-3.5 py-2 rounded-r-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                title={`افزودن برگه برای روز ${nextDayName}`}
              >
                <Plus size={15} />
                <span>روز بعد ({nextDayName})</span>
              </button>
            )}

            {/* Dropdown Trigger */}
            <button
              onClick={() => {
                sound.playPop();
                setIsCreateMenuOpen(!isCreateMenuOpen);
              }}
              className="bg-stone-800 hover:bg-stone-700 dark:bg-stone-200 dark:hover:bg-stone-300 text-stone-100 dark:text-stone-800 px-2 py-2 rounded-l-xl border-r border-stone-700/60 dark:border-stone-300/60 flex items-center justify-center cursor-pointer transition-colors"
              title="سایر گزینه‌ها و انتخاب قالب"
            >
              <ChevronDown size={14} className={`transition-transform duration-150 ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Progressive Disclosure Dropdown */}
            {isCreateMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1c1c1b] border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-float z-40 p-2 flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  ایجاد برگه برای تاریخ مشخص
                </div>

                {hasTodayPage ? (
                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onOpenPage(todayKey);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>باز کردن برگه امروز ({todayDayName})</span>
                    </span>
                    <span className="text-[10px] text-stone-400">ثبت‌شده</span>
                  </button>
                ) : (
                  <button
                    onClick={() => createPage(todayKey)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-stone-600 dark:text-stone-400" />
                      <span>برگه امروز ({todayDayName})</span>
                    </span>
                    <span className="text-[10px] text-stone-400">{formatJalaliDate(today)}</span>
                  </button>
                )}

                <button
                  onClick={() => createPage(nextSuggestedKey)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={14} className="text-stone-600 dark:text-stone-400" />
                    <span>برگه روز بعدی ({nextDayName})</span>
                  </span>
                  <span className="text-[10px] text-stone-400">{formatJalaliDate(nextSuggested)}</span>
                </button>

                <button
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    sound.playAdd();
                    setIsDatePickerOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                >
                  <Calendar size={14} className="text-stone-500" />
                  <span>انتخاب تاریخ دلخواه از تقویم...</span>
                </button>

                <div className="border-t border-stone-200/60 dark:border-stone-800 my-1" />

                <div className="px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>قالب فعال برای برگه‌های جدید</span>
                  <Sparkles size={11} className="text-amber-500" />
                </div>

                <div className="flex flex-col gap-0.5">
                  {standardTemplates.map((tpl) => {
                    const isSelected = chosenTemplateForNewPage === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-right transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tpl.icon}</span>
                          <div>
                            <div>{tpl.title}</div>
                            <div className="text-[10px] text-stone-400 font-normal leading-tight">
                              {tpl.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-stone-900 dark:text-stone-100 shrink-0" />}
                      </button>
                    );
                  })}

                  {customTemplates.map((ct) => {
                    const isSelected = chosenTemplateForNewPage === ct.id;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => handleSelectTemplate(ct.id as TemplateType)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-right transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🌐</span>
                          <span className="truncate">{ct.title}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-stone-900 dark:text-stone-100 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. Subheader & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <LayoutGrid size={16} className="text-stone-500" />
          <span>آرشیو برگه‌های دفترچه</span>
          {searchQuery.trim() && (
            <span className="text-stone-400 font-normal">
              (نمایش {toPersianDigits(filteredPages.length)} از {toPersianDigits(totalPages)} برگه)
            </span>
          )}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در روزها، یادداشت‌ها یا اولویت‌ها..."
            className="w-full bg-stone-100/70 dark:bg-stone-800/60 border border-transparent focus:border-stone-300 dark:focus:border-stone-600 focus:bg-white dark:focus:bg-stone-800 rounded-xl pr-8 pl-8 py-2 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
              title="پاک کردن جستجو"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Grid of Miniature Planner Sheets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Existing Day Sheets */}
        {filteredPages.map(([dateKey, page], index) => {
          if (page.templateType === 'template-4-celestial-todo') {
            return (
              <MiniTemplate4Sheet
                key={dateKey}
                dateKey={dateKey}
                page={page}
                onOpen={() => onOpenPage(dateKey)}
                onDelete={() => setDeletingDateKey(dateKey)}
              />
            );
          }

          if (page.templateType === 'template-3-writing-plans') {
            return (
              <MiniTemplate3Sheet
                key={dateKey}
                dateKey={dateKey}
                page={page}
                onOpen={() => onOpenPage(dateKey)}
                onDelete={() => setDeletingDateKey(dateKey)}
              />
            );
          }

          if (page.templateType === 'template-2-one-big-thing') {
            return (
              <MiniTemplate2Sheet
                key={dateKey}
                dateKey={dateKey}
                page={page}
                onOpen={() => onOpenPage(dateKey)}
                onDelete={() => setDeletingDateKey(dateKey)}
              />
            );
          }

          return (
            <MiniPlannerSheet
              key={dateKey}
              dateKey={dateKey}
              page={page}
              theme={journal.theme}
              pageIndex={index}
              onOpen={() => onOpenPage(dateKey)}
              onDelete={() => setDeletingDateKey(dateKey)}
            />
          );
        })}

        {/* 5. Minimalist Next Day Card (De-cluttered: no 7 neon buttons!) */}
        <div className="flex flex-col gap-2 group select-none">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500">برگه آماده برای روز بعدی</span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200/80 dark:border-stone-700/80">
              روز {nextDayName}
            </span>
          </div>

          <div
            onClick={() => createPage(nextSuggestedKey)}
            className="w-full aspect-[1/1.34] rounded-[24px] border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 bg-stone-100/40 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-900/80 p-6 flex flex-col items-center justify-between text-center transition-all duration-200 group-hover:-translate-y-1 shadow-2xs hover:shadow-soft cursor-pointer"
          >
            {/* Top Indicator */}
            <div className="w-12 h-12 rounded-2xl bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-stone-900 group-hover:text-stone-50 dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 transition-all shadow-2xs mt-2">
              <Plus size={22} strokeWidth={2} />
            </div>

            {/* Middle Prompt */}
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                افزودن برگه روز {nextDayName}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {formatJalaliDate(nextSuggested)}
              </p>
              <div className="mt-2 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-200/50 dark:bg-stone-800/80 text-[11px] text-stone-600 dark:text-stone-300 mx-auto">
                <span>قالب فعال:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-100">{currentTemplateTitle}</span>
              </div>
            </div>

            {/* Bottom Subtle Action */}
            <div className="w-full flex items-center justify-center gap-2">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors">
                کلیک برای ایجاد و شروع برنامه‌ریزی ←
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredPages.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-400">
          <Calendar size={36} className="text-stone-300 dark:text-stone-700" />
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">برگه‌ای مطابق با جستجو پیدا نشد.</p>
        </div>
      )}

      {/* 6. Modal: Pick Custom Date */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1c1c1b] rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-float flex flex-col gap-4 border border-stone-200/80 dark:border-stone-800 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                ایجاد برگه برای تاریخ مشخص
              </h3>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">تاریخ تقویم:</label>
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="bg-stone-100/70 dark:bg-stone-800/60 border border-transparent focus:border-stone-300 dark:focus:border-stone-600 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 outline-none transition-colors"
              />
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                روز:{' '}
                <strong className="text-stone-800 dark:text-stone-200">
                  {PERSIAN_DAYS[parseDateKey(customDateInput).getDay()]} (
                  {formatJalaliDate(parseDateKey(customDateInput))})
                </strong>
              </span>
            </div>

            {/* Template Selection inside Modal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">قالب برگه:</label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {standardTemplates.map((tpl) => {
                  const isSelected = chosenTemplateForNewPage === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-800 dark:border-stone-200 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                          : 'border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tpl.icon}</span>
                        <span className="text-xs">{tpl.title}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-stone-900 dark:text-stone-100" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateCustomDatePage}
                className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors active:scale-[0.98]"
              >
                ایجاد برگه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Delete Page Confirmation (Editorial UX instead of browser confirm) */}
      {deletingDateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1c1c1b] rounded-2xl p-6 max-w-sm w-full shadow-float flex flex-col gap-4 border border-stone-200/80 dark:border-stone-800 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">حذف برگه روزانه</h3>
                <p className="text-xs text-stone-500">
                  {PERSIAN_DAYS[parseDateKey(deletingDateKey).getDay()]} (
                  {formatJalaliDate(parseDateKey(deletingDateKey))})
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              آیا از حذف این برگه اطمینان دارید؟ تمام یادداشت‌ها، زمان‌بندی‌ها و اطلاعات ثبت‌شده در این روز از دفترچه پاک خواهند شد.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setDeletingDateKey(null)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTrash();
                  onDeletePage(deletingDateKey);
                  setDeletingDateKey(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-2xs active:scale-95"
              >
                حذف دائمی برگه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
