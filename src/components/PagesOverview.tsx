import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  Calendar,
  Search,
  CalendarDays,
  LayoutGrid,
  Sun,
  Moon,
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
  colorMode?: ColorMode;
  onToggleColorMode?: () => void;
}

export const PagesOverview: React.FC<PagesOverviewProps> = ({
  journal,
  onBackToDashboard,
  onOpenPage,
  onAddNewPage,
  onDeletePage,
  onEditCover,
  colorMode,
  onToggleColorMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(() => getDateKey(new Date()));
  const [chosenTemplateForNewPage, setChosenTemplateForNewPage] = useState<TemplateType>('template-1-green');
  const [customTemplates] = useState<CustomHtmlTemplate[]>(() => loadStoredCustomTemplates());

  // Sort pages chronologically or reverse
  const pageEntries = Object.entries(journal.pages || {}).sort((a, b) => {
    // Sort descending by date (latest first)
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
  const nextDayName = PERSIAN_DAYS[nextSuggested.getDay()];

  const handleAddNextDay = (templateType: TemplateType = chosenTemplateForNewPage, initialData?: DayPage) => {
    sound.playAdd();
    const nextKey = getDateKey(nextSuggested);
    onAddNewPage(nextKey, templateType, initialData);
  };

  const handleCreateTodayPage = () => {
    sound.playAdd();
    const todayKey = getDateKey(new Date());
    onAddNewPage(todayKey, chosenTemplateForNewPage);
  };

  const handleCreateCustomDatePage = () => {
    if (customDateInput) {
      sound.playAdd();
      onAddNewPage(customDateInput, chosenTemplateForNewPage);
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f5f7f9] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 p-5 sm:p-8 md:p-10 flex flex-col gap-7 overflow-y-auto transition-colors duration-200">
      {/* Top Header & Breadcrumbs */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playSwoosh();
              onBackToDashboard();
            }}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer shrink-0"
            title="بازگشت به کتابخانه ژورنال‌ها"
          >
            <ArrowRight size={18} />
          </button>

          {/* Notebook Thumbnail & Title */}
          <div className="flex items-center gap-3.5">
            <div
              onClick={onEditCover}
              className="w-11 h-14 rounded-r-xl rounded-l-xs shadow-md shrink-0 relative notebook-spine cursor-pointer transition-transform hover:scale-105 border border-black/10 overflow-hidden flex flex-col justify-start"
              style={{
                backgroundColor: journal.color,
                backgroundImage: journal.coverImage ? `url(${journal.coverImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              title="کلیک برای ویرایش جلد و رنگ دفترچه"
            >
              <div className="relative mt-2 z-10 w-[84%] bg-[#fbf6f3] shadow-2xs rounded-r-md py-0.5 px-1 flex items-center border-y border-r border-[#eddcd4]/50">
                <span className="text-[7.5px] font-bold text-slate-800 truncate">
                  {journal.title}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {journal.title}
                </h1>
                <span className="bg-[#ffede8] dark:bg-orange-950/50 text-[#ff542e] dark:text-orange-400 font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {toPersianDigits(totalPages)} برگه روزانه
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                نمای کلی از برگه‌ها با قالب یکپارچه پلنر روزانه (کرونودکس ۲۴ ساعته، زمان‌بندی و عادات)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onToggleColorMode && (
            <button
              onClick={onToggleColorMode}
              title={colorMode === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              {colorMode === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
          )}

          <button
            onClick={handleCreateTodayPage}
            className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <CalendarDays size={15} />
            <span>برگه امروز</span>
          </button>

          <button
            onClick={() => handleAddNextDay()}
            className="bg-[#ff6438] hover:bg-[#f05427] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
            title={`افزودن برگه برای روز ${nextDayName}`}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ برگه روز {nextDayName}</span>
          </button>

          <button
            onClick={() => {
              sound.playAdd();
              setIsDatePickerOpen(true);
            }}
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="انتخاب تاریخ دلخواه"
          >
            <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
            <span>تاریخ دلخواه</span>
          </button>
        </div>
      </header>


      {/* Subheader & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
          <LayoutGrid size={18} className="text-[#ff6438]" />
          <span>آلبوم برگه‌های دفترچه (مشاهده قالب یکپارچه روزها)</span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی روز (مثلاً شنبه، یکشنبه...) یا یادداشت‌ها..."
            className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-[#ff6438] dark:focus:border-[#ff6438] rounded-xl pr-9 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of Miniature Planner Sheets (Exact same template for each day!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Existing Day Sheets */}
        {filteredPages.map(([dateKey, page], index) => {
          const dateObj = parseDateKey(dateKey);
          const dayName = PERSIAN_DAYS[dateObj.getDay()];

          if (page.templateType === 'template-4-celestial-todo') {
            return (
              <MiniTemplate4Sheet
                key={dateKey}
                dateKey={dateKey}
                page={page}
                onOpen={() => onOpenPage(dateKey)}
                onDelete={() => {
                  if (window.confirm(`آیا از حذف برگه روز ${dayName} (${dateKey}) مطمئن هستید؟`)) {
                    onDeletePage(dateKey);
                  }
                }}
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
                onDelete={() => {
                  if (window.confirm(`آیا از حذف برگه روز ${dayName} (${dateKey}) مطمئن هستید؟`)) {
                    onDeletePage(dateKey);
                  }
                }}
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
                onDelete={() => {
                  if (window.confirm(`آیا از حذف برگه روز ${dayName} (${dateKey}) مطمئن هستید؟`)) {
                    onDeletePage(dateKey);
                  }
                }}
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
              onDelete={() => {
                if (window.confirm(`آیا از حذف برگه روز ${dayName} (${dateKey}) مطمئن هستید؟`)) {
                  onDeletePage(dateKey);
                }
              }}
            />
          );
        })}

        {/* Blank Next Sheet Card (Dotted template inviting the user to add the next day) */}
        <div className="flex flex-col gap-2 group select-none">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">برگه آماده برای روز بعدی</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-slate-700">
              روز {nextDayName}
            </span>
          </div>

          <div className="w-full aspect-[1/1.34] rounded-[28px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#ff6438] dark:hover:border-[#ff6438] bg-white/70 dark:bg-slate-900/60 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 p-5 flex flex-col items-center justify-between text-center transition-all duration-300 group-hover:-translate-y-1.5 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ff6438] dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs mt-1">
              <Plus size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-[#ff6438] dark:group-hover:text-orange-400 transition-colors">
                افزودن برگه روز {nextDayName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                انتخاب قالب برای شروع روز جدید
              </p>
            </div>

            {/* Quick Template Choice Buttons */}
            <div className="flex flex-col w-full gap-1.5">
              <button
                type="button"
                onClick={() => handleAddNextDay('template-1-green')}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-1 px-2 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🌿</span>
                <span>قالب ۱ (برگه سبز)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddNextDay('template-2-one-big-thing')}
                className="w-full bg-neutral-900 hover:bg-black text-white py-1 px-2 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>📋</span>
                <span>قالب ۲ (One Big Thing)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddNextDay('template-3-writing-plans')}
                className="w-full bg-[#3e5f44] hover:bg-[#2e4733] text-white py-1 px-2 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🌲</span>
                <span>قالب ۳ (Writing Plans)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddNextDay('template-4-celestial-todo')}
                className="w-full bg-[#0b1b36] hover:bg-[#071329] text-white py-1 px-2 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 border border-[#1e3c6d]"
              >
                <span>☾</span>
                <span>قالب ۴ (Celestial To-Do)</span>
              </button>

              {customTemplates.slice(0, 3).map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() =>
                    handleAddNextDay('template-custom-html', {
                      templateType: 'template-custom-html',
                      customHtmlContent: ct.htmlContent,
                      timeSlots: {},
                      dialSectors: {},
                      habits: [],
                      dailyNotes: '',
                      nonRoutine: { followUps: [], admin: [], docs: [], team: [], misc: [] },
                      priorities: [],
                      todos: [],
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  title={ct.title}
                >
                  <span>🌐</span>
                  <span className="truncate">{ct.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredPages.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Calendar size={36} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">برگه‌ای مطابق با جستجو پیدا نشد.</p>
        </div>
      )}

      {/* Modal: Pick custom date for new page */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 border border-slate-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">ایجاد برگه برای تاریخ مشخص</h3>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">انتخاب تاریخ تقویم:</label>
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="border border-slate-200 focus:border-[#ff6438] rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors"
              />
              <span className="text-xs text-slate-500 mt-1">
                نام روز:{' '}
                <strong className="text-slate-800">
                  {PERSIAN_DAYS[parseDateKey(customDateInput).getDay()]} (
                  {formatJalaliDate(parseDateKey(customDateInput))})
                </strong>
              </span>
            </div>

            {/* Template Selection inside Modal */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">انتخاب قالب برگه:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChosenTemplateForNewPage('template-1-green')}
                  className={`p-2 rounded-xl border text-right flex flex-col gap-1 transition-all cursor-pointer ${
                    chosenTemplateForNewPage === 'template-1-green'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">🌿 قالب شماره ۱</span>
                  <span className="text-[10px] text-slate-400">برگه سبز مریم‌گلی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChosenTemplateForNewPage('template-2-one-big-thing')}
                  className={`p-2 rounded-xl border text-right flex flex-col gap-1 transition-all cursor-pointer ${
                    chosenTemplateForNewPage === 'template-2-one-big-thing'
                      ? 'border-black bg-neutral-100 text-black font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">📋 قالب شماره ۲</span>
                  <span className="text-[10px] text-slate-400">The One Big Thing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChosenTemplateForNewPage('template-3-writing-plans')}
                  className={`p-2 rounded-xl border text-right flex flex-col gap-1 transition-all cursor-pointer ${
                    chosenTemplateForNewPage === 'template-3-writing-plans'
                      ? 'border-[#3e5f44] bg-[#edf4ed] text-[#1e3422] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">🌲 قالب شماره ۳</span>
                  <span className="text-[10px] text-slate-400">Writing Plans</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateCustomDatePage}
                className="bg-[#ff6438] hover:bg-[#f05427] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                ایجاد برگه ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
