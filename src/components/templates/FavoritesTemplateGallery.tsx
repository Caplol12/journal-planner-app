import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Search,
  Check,
  Bookmark,
} from 'lucide-react';
import { Journal, DayPage, TemplateType } from '../../types';
import { formatJalaliDate, parseDateKey, toPersianDigits } from '../../utils/jalali';
import { sound } from '../../utils/audio';
import { TestTemplateItem } from '../TemplateTestPlaygroundModal';
import { MiniPlannerSheet } from '../MiniPlannerSheet';
import { MiniTemplate2Sheet } from '../MiniTemplate2Sheet';
import { MiniTemplate3Sheet } from '../MiniTemplate3Sheet';
import { MiniTemplate4Sheet } from '../MiniTemplate4Sheet';
import { Template2PlannerSheet } from '../Template2PlannerSheet';
import { Template3WritingSheet } from '../Template3WritingSheet';
import { Template4CelestialSheet } from '../Template4CelestialSheet';
import { ChronodexDial } from '../ChronodexDial';
import { LinearTimeBlocking } from '../LinearTimeBlocking';
import { HabitsAndNotes } from '../HabitsAndNotes';
import { NonRoutineTasks } from '../NonRoutineTasks';
import { PrioritiesAndTodos } from '../PrioritiesAndTodos';
import { DEFAULT_CATEGORIES } from '../../utils/storage';
import { injectHtmlSyncScript } from '../../utils/htmlTemplates';

export interface CollectedPageItem {
  journalId: string;
  journalTitle: string;
  journalColor: string;
  journalTheme?: string;
  dateKey: string;
  pageData: DayPage;
}

interface FavoritesTemplateGalleryProps {
  journals: Journal[];
  templates: TestTemplateItem[];
  onOpenJournalPage: (journalId: string, dateKey: string) => void;
  onUpdateJournalPage?: (journalId: string, dateKey: string, updatedPage: DayPage) => void;
  onAddNewPageWithTemplate: (templateType: TemplateType, pageData: DayPage) => void;
}

export const FavoritesTemplateGallery: React.FC<FavoritesTemplateGalleryProps> = ({
  journals,
  templates,
  onOpenJournalPage,
  onUpdateJournalPage,
  onAddNewPageWithTemplate,
}) => {
  // Search query in favorites gallery
  const [searchQuery, setSearchQuery] = useState('');

  // Selected template for the flipbook reader
  const [activeFlipbookTemplate, setActiveFlipbookTemplate] = useState<TestTemplateItem | null>(null);

  // Current page index in the flipbook
  const [currentFlipIndex, setCurrentFlipIndex] = useState(0);

  // Template 1 interaction states
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Calculate page count usage across all journals for each template
  const templateUsageMap = useMemo(() => {
    const map = new Map<string, { totalPages: number; journalCount: number }>();

    for (const t of templates) {
      let totalPages = 0;
      const journalsWithTemplate = new Set<string>();

      for (const j of journals) {
        for (const dateKey of Object.keys(j.pages)) {
          const page = j.pages[dateKey];
          const pageTemplate = page.templateType || 'template-1-green';
          if (pageTemplate === t.templateType) {
            totalPages++;
            journalsWithTemplate.add(j.id);
          }
        }
      }

      map.set(t.id, { totalPages, journalCount: journalsWithTemplate.size });
    }

    return map;
  }, [journals, templates]);

  // Collect all pages in all journals that use the activeFlipbookTemplate
  const collectedPages: CollectedPageItem[] = useMemo(() => {
    if (!activeFlipbookTemplate) return [];

    const list: CollectedPageItem[] = [];
    const targetType = activeFlipbookTemplate.templateType;

    for (const j of journals) {
      for (const dateKey of Object.keys(j.pages)) {
        const page = j.pages[dateKey];
        const pageTemplate = page.templateType || 'template-1-green';

        if (pageTemplate === targetType) {
          list.push({
            journalId: j.id,
            journalTitle: j.title,
            journalColor: j.color,
            journalTheme: j.theme,
            dateKey,
            pageData: page,
          });
        }
      }
    }

    // Sort chronologically by dateKey
    return list.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [activeFlipbookTemplate, journals]);

  // Reset current flip index when template changes
  useEffect(() => {
    setCurrentFlipIndex(0);
  }, [activeFlipbookTemplate]);

  // Keyboard navigation for page flip
  useEffect(() => {
    if (!activeFlipbookTemplate || collectedPages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // In RTL: ArrowRight = previous page, ArrowLeft = next page
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        setActiveFlipbookTemplate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFlipbookTemplate, collectedPages.length, currentFlipIndex]);

  const handleNextPage = () => {
    if (currentFlipIndex < collectedPages.length - 1) {
      sound.playSwoosh();
      setCurrentFlipIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentFlipIndex > 0) {
      sound.playSwoosh();
      setCurrentFlipIndex((prev) => prev - 1);
    }
  };

  const handleUpdateCurrentPage = (updater: (prev: DayPage) => DayPage) => {
    const currentItem = collectedPages[currentFlipIndex];
    if (!currentItem || !onUpdateJournalPage) return;

    const updated = updater(currentItem.pageData);
    onUpdateJournalPage(currentItem.journalId, currentItem.dateKey, updated);
  };

  // Filter templates for display
  const displayTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // Active page item in flipbook
  const activePageItem = collectedPages[currentFlipIndex];

  // =========================================================================
  // VIEW 1: FLIPBOOK PAGE VIEWER (when a template is selected)
  // =========================================================================
  if (activeFlipbookTemplate) {
    const hasPages = collectedPages.length > 0;

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        {/* Flipbook Header Bar */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playSwoosh();
                setActiveFlipbookTemplate(null);
              }}
              title="بازگشت به گالری قالب‌های علاقه‌مندی‌ها"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <ArrowRight size={17} />
              <span>بازگشت به گالری قالب‌ها</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {activeFlipbookTemplate.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ffece5] dark:bg-orange-950/60 text-[#ff6438] border border-[#ff6438]/20">
                  {activeFlipbookTemplate.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ورق زدن تمام برگه‌های ثبت‌شده با این قالب در همه دفترچه‌ها
              </p>
            </div>
          </div>

          {/* Flip Controls & Counter */}
          {hasPages && (
            <div className="flex items-center gap-3 justify-between sm:justify-end">
              {/* Page Counter */}
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                برگه {toPersianDigits(currentFlipIndex + 1)} از {toPersianDigits(collectedPages.length)}
              </div>

              {/* Navigation Flip Buttons */}
              <div className="flex items-center gap-1.5" dir="ltr">
                <button
                  onClick={handlePrevPage}
                  disabled={currentFlipIndex === 0}
                  title="برگه قبلی (Arrow Right)"
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentFlipIndex === collectedPages.length - 1}
                  title="برگه بعدی (Arrow Left)"
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* Open in Planner Full View Button */}
              {activePageItem && (
                <button
                  onClick={() => {
                    sound.playTick(true);
                    onOpenJournalPage(activePageItem.journalId, activePageItem.dateKey);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#ff6438] hover:bg-[#e04f26] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <ExternalLink size={14} />
                  <span>ورود به پلنر</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            NO PAGES FOUND STATE
           ===================================================================== */}
        {!hasPages ? (
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-12 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-[#ff6438] flex items-center justify-center shadow-inner">
              <Layers size={32} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                هنوز برگه‌ای با این قالب در هیچ دفترچه‌ای ثبت نشده است
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                شما می‌توانید اولین برگه با ساختار «{activeFlipbookTemplate.title}» را هم‌اکنون به دفترچه‌های خود اضافه کنید.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playAdd();
                onAddNewPageWithTemplate(
                  activeFlipbookTemplate.templateType,
                  activeFlipbookTemplate.pageData
                );
              }}
              className="mt-2 bg-[#ff6438] hover:bg-[#e04f26] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>ایجاد اولین برگه با این قالب در ژورنال</span>
            </button>
          </div>
        ) : (
          /* =====================================================================
              ACTIVE PAGE FLIPBOOK STAGE
             ===================================================================== */
          <div className="flex flex-col gap-4">
            {/* Page Metadata Bar (Journal title, date, tag) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-3">
                {/* Journal Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: activePageItem.journalColor || '#ff6438' }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    دفترچه: {activePageItem.journalTitle}
                  </span>
                </div>

                {/* Date Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar size={14} className="text-[#ff6438]" />
                  <span>
                    تاریخ: {formatJalaliDate(parseDateKey(activePageItem.dateKey))} ({toPersianDigits(activePageItem.dateKey)})
                  </span>
                </div>
              </div>

              {/* Keyboard Tip */}
              <div className="text-[11px] text-slate-400 font-mono hidden md:block">
                ورق‌زدن با کلیدهای جهت‌نما: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">←</kbd> بعدی · <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">→</kbd> قبلی
              </div>
            </div>

            {/* Page Rendering Canvas with 3D perspective shadow */}
            <div className="relative w-full max-w-5xl mx-auto rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300">
              {/* Template Rendering Branch */}
              {activeFlipbookTemplate.templateType === 'template-4-celestial-todo' ? (
                <div className="p-4 sm:p-6 bg-[#0a0f1d] text-white">
                  <Template4CelestialSheet
                    pageData={activePageItem.pageData}
                    onUpdate={handleUpdateCurrentPage}
                  />
                </div>
              ) : activeFlipbookTemplate.templateType === 'template-3-writing-plans' ? (
                <div className="p-4 sm:p-6 bg-[#fcfaf7] dark:bg-[#1a231d]">
                  <Template3WritingSheet
                    pageData={activePageItem.pageData}
                    onUpdate={handleUpdateCurrentPage}
                  />
                </div>
              ) : activeFlipbookTemplate.templateType === 'template-2-one-big-thing' ? (
                <div className="p-4 sm:p-6 bg-white dark:bg-[#161a23]">
                  <Template2PlannerSheet
                    pageData={activePageItem.pageData}
                    onUpdate={handleUpdateCurrentPage}
                  />
                </div>
              ) : activeFlipbookTemplate.templateType === 'template-custom-html' ? (
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-[600px]">
                  <iframe
                    srcDoc={injectHtmlSyncScript(activePageItem.pageData.customHtmlContent || '')}
                    title="Custom HTML Template"
                    className="w-full min-h-[600px] border-none"
                    sandbox="allow-scripts allow-forms"
                  />
                </div>
              ) : (
                /* Template 1: Classic Green Chronodex */
                <div className="p-6 md:p-8 bg-[#f4f7f4] dark:bg-[#111c16] text-slate-800 dark:text-slate-100 grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-8">
                  {/* Left Column: Chronodex + Linear time */}
                  <div className="flex flex-col gap-6">
                    <ChronodexDial
                      pageData={activePageItem.pageData}
                      categories={DEFAULT_CATEGORIES}
                      activeCategoryFilter={activeCategoryFilter}
                      onSelectCategoryFilter={setActiveCategoryFilter}
                      hoveredHour={hoveredHour}
                      onHoverHour={setHoveredHour}
                      onUpdateHourColor={(hour, color, cat) => {
                        handleUpdateCurrentPage((prev) => {
                          const slots = { ...prev.timeSlots };
                          const currentSlot = slots[hour] || { text: '', color: '' };
                          slots[hour] = { ...currentSlot, color, cat };
                          return { ...prev, timeSlots: slots };
                        });
                      }}
                    />

                    <LinearTimeBlocking
                      pageData={activePageItem.pageData}
                      categories={DEFAULT_CATEGORIES}
                      hoveredHour={hoveredHour}
                      onHoverHour={setHoveredHour}
                      onUpdateSlotText={(hour, text) => {
                        handleUpdateCurrentPage((prev) => {
                          const slots = { ...prev.timeSlots };
                          const currentSlot = slots[hour] || { text: '', color: '' };
                          slots[hour] = { ...currentSlot, text };
                          return { ...prev, timeSlots: slots };
                        });
                      }}
                      onUpdateSlotColor={(hour, color, cat) => {
                        handleUpdateCurrentPage((prev) => {
                          const slots = { ...prev.timeSlots };
                          const currentSlot = slots[hour] || { text: '', color: '' };
                          slots[hour] = { ...currentSlot, color, cat };
                          return { ...prev, timeSlots: slots };
                        });
                      }}
                    />
                  </div>

                  {/* Right Column: Habits, Priorities, Todos */}
                  <div className="flex flex-col gap-6">
                    <PrioritiesAndTodos
                      priorities={activePageItem.pageData.priorities || []}
                      todos={activePageItem.pageData.todos || []}
                      onUpdatePriority={(idx, text, done) => {
                        handleUpdateCurrentPage((prev) => {
                          const updated = [...(prev.priorities || [])];
                          updated[idx] = { text, done };
                          return { ...prev, priorities: updated };
                        });
                      }}
                      onTogglePriorityDone={(idx) => {
                        handleUpdateCurrentPage((prev) => {
                          const updated = [...(prev.priorities || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], done: !updated[idx].done };
                          }
                          return { ...prev, priorities: updated };
                        });
                      }}
                      onUpdateTodoText={(id, text) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, text } : t)),
                        }));
                      }}
                      onToggleTodoDone={(id) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
                        }));
                      }}
                      onAddTodo={() => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          todos: [...(prev.todos || []), { id: `t_${Date.now()}`, text: '', done: false }],
                        }));
                      }}
                      onDeleteTodo={(id) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          todos: (prev.todos || []).filter((t) => t.id !== id),
                        }));
                      }}
                    />

                    <HabitsAndNotes
                      habits={activePageItem.pageData.habits || []}
                      dailyNotes={activePageItem.pageData.dailyNotes || ''}
                      onUpdateHabit={(id, done) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, done } : h)),
                        }));
                      }}
                      onUpdateHabitText={(id, text) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, text } : h)),
                        }));
                      }}
                      onAddHabit={(text) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          habits: [...(prev.habits || []), { id: `h_${Date.now()}`, text, done: false }],
                        }));
                      }}
                      onDeleteHabit={(id) => {
                        handleUpdateCurrentPage((prev) => ({
                          ...prev,
                          habits: (prev.habits || []).filter((h) => h.id !== id),
                        }));
                      }}
                      onUpdateNotes={(dailyNotes) => {
                        handleUpdateCurrentPage((prev) => ({ ...prev, dailyNotes }));
                      }}
                    />

                    <NonRoutineTasks
                      nonRoutine={activePageItem.pageData.nonRoutine}
                      onChangeNonRoutine={(nonRoutine) => {
                        handleUpdateCurrentPage((prev) => ({ ...prev, nonRoutine }));
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Pages Strip (Jump to any page in the sequence) */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                برگه‌های موجود:
              </span>
              {collectedPages.map((item, idx) => {
                const isCurrent = idx === currentFlipIndex;
                return (
                  <button
                    key={`${item.journalId}-${item.dateKey}`}
                    onClick={() => {
                      sound.playTick(true);
                      setCurrentFlipIndex(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#ff6438] text-white shadow-sm scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.journalColor }}
                    />
                    <span>{toPersianDigits(item.dateKey)}</span>
                    <span className="text-[10px] opacity-80">({item.journalTitle})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FAVORITES TEMPLATES GALLERY (Initial Grid of Template Cards)
  // =========================================================================
  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 dark:from-orange-950/30 dark:via-slate-900/50 dark:to-purple-950/30 rounded-3xl p-6 sm:p-8 border border-orange-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6438] text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Star size={20} className="fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>گالری قالب‌های برگزیده (Favorites)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                تصویر هر قالب را مشاهده کنید و با یک کلیک، تمام برگه‌های استفاده‌شده از آن را در تمام دفترچه‌ها به‌صورت متوالی ورق بزنید.
              </p>
            </div>
          </div>
        </div>

        {/* Search inside templates */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان قالب..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-[#ff6438]"
          />
        </div>
      </div>

      {/* Templates Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
        {displayTemplates.map((t) => {
          const usage = templateUsageMap.get(t.id) || { totalPages: 0, journalCount: 0 };

          return (
            <div
              key={t.id}
              onClick={() => {
                sound.playSwoosh();
                setActiveFlipbookTemplate(t);
              }}
              className="group bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#ff6438]/50 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#ff6438] transition-colors">
                      {t.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {t.desc}
                  </p>
                </div>

                {/* Star Marker */}
                <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#ff6438] shrink-0">
                  <Star size={16} className="fill-[#ff6438]" />
                </span>
              </div>

              {/* Visual Live Sheet Thumbnail Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center overflow-hidden min-h-[300px] relative group-hover:scale-[1.01] transition-transform duration-300">
                <div className="w-full max-w-[420px] pointer-events-none select-none rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                  {t.templateType === 'template-4-celestial-todo' ? (
                    <MiniTemplate4Sheet page={t.pageData} onOpen={() => {}} />
                  ) : t.templateType === 'template-3-writing-plans' ? (
                    <MiniTemplate3Sheet page={t.pageData} onOpen={() => {}} />
                  ) : t.templateType === 'template-2-one-big-thing' ? (
                    <MiniTemplate2Sheet page={t.pageData} onOpen={() => {}} />
                  ) : (
                    <MiniPlannerSheet page={t.pageData} onOpen={() => {}} />
                  )}
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-[#ff6438]/10 opacity-0 group-hover:opacity-100 backdrop-blur-3xs flex items-center justify-center transition-opacity duration-300">
                  <span className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 text-[#ff6438] dark:text-orange-400 font-bold text-xs shadow-lg flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>کلیک برای ورق زدن تمام برگه‌ها</span>
                  </span>
                </div>
              </div>

              {/* Card Footer: Usage Count & Action */}
              <div className="p-4 px-5 bg-white dark:bg-slate-800 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6438]" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {usage.totalPages > 0 ? (
                      <span>
                        <b className="font-mono text-[#ff6438] ml-1">{toPersianDigits(usage.totalPages)}</b>
                        برگه ثبت‌شده در {toPersianDigits(usage.journalCount)} دفترچه
                      </span>
                    ) : (
                      <span className="text-slate-400">هنوز برگه‌ای ثبت نشده</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-[#ff6438] group-hover:translate-x-[-4px] transition-transform">
                  <span>مشاهده و ورق‌زدن</span>
                  <ChevronLeft size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
