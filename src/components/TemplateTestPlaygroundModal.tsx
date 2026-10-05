import React, { useState, useEffect } from 'react';
import { DayPage, Journal, TemplateType } from '../types';
import { sound } from '../utils/audio';
import { getDateKey, formatJalaliDate, parseDateKey, PERSIAN_DAYS } from '../utils/jalali';
import { injectHtmlSyncScript } from '../utils/htmlTemplates';
import {
  X,
  Plus,
  RotateCcw,
  Check,
  Calendar,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Template4CelestialSheet } from './Template4CelestialSheet';
import { Template3WritingSheet } from './Template3WritingSheet';
import { Template2PlannerSheet } from './Template2PlannerSheet';
import { ChronodexDial } from './ChronodexDial';
import { LinearTimeBlocking } from './LinearTimeBlocking';
import { HabitsAndNotes } from './HabitsAndNotes';
import { NonRoutineTasks } from './NonRoutineTasks';
import { PrioritiesAndTodos } from './PrioritiesAndTodos';
import { DEFAULT_CATEGORIES } from '../utils/storage';

export interface TestTemplateItem {
  id: string;
  templateType: TemplateType;
  title: string;
  badge: string;
  desc: string;
  pageData: DayPage;
  customHtmlContent?: string;
  isCustom?: boolean;
}

interface TemplateTestPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TestTemplateItem | null;
  journals: Journal[];
  onApplyToJournal: (journalId: string, pageData: DayPage, title: string, customDateKey?: string) => void;
  onCreateJournalWithTemplate?: (title: string, color: string, pageData: DayPage) => void;
}

export const TemplateTestPlaygroundModal: React.FC<TemplateTestPlaygroundModalProps> = ({
  isOpen,
  onClose,
  template,
  journals,
  onApplyToJournal,
  onCreateJournalWithTemplate,
}) => {
  if (!isOpen || !template) return null;

  // Local isolated state for testing - DOES NOT SAVE TO ANY JOURNAL
  const [testPageData, setTestPageData] = useState<DayPage>(() =>
    structuredClone(template.pageData || {})
  );

  const [playgroundIframeDoc, setPlaygroundIframeDoc] = useState<string>(() => {
    const raw =
      template?.customHtmlContent ||
      template?.pageData?.customHtmlContent ||
      '<h1>قالب HTML</h1>';
    return injectHtmlSyncScript(raw);
  });
  const currentTemplateIdRef = React.useRef<string>(template?.id || '');

  // Sync testPageData and playgroundIframeDoc only when switching template
  useEffect(() => {
    if (template && template.id !== currentTemplateIdRef.current) {
      currentTemplateIdRef.current = template.id;
      setTestPageData(structuredClone(template.pageData || {}));
      const raw =
        template.customHtmlContent ||
        template.pageData?.customHtmlContent ||
        '<h1>قالب HTML</h1>';
      setPlaygroundIframeDoc(injectHtmlSyncScript(raw));
    }
  }, [template]);

  // Apply to Journal Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string>(journals[0]?.id || '');
  const [dateChoice, setDateChoice] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDateValue, setCustomDateValue] = useState(() => getDateKey(new Date()));

  // Template 1 interactions
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const [customHtmlHeight, setCustomHtmlHeight] = useState<number>(950);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Listen to iframe state synchronization and auto-resizing messages without reloading the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'CUSTOM_HTML_SYNC' && typeof e.data.html === 'string') {
        // Keep updated HTML in testPageData for "Apply to Journal" without reloading the iframe
        setTestPageData((prev) => ({
          ...prev,
          customHtmlContent: e.data.html,
        }));
      }
      if (e.data.type === 'CUSTOM_HTML_RESIZE' && typeof e.data.height === 'number') {
        setCustomHtmlHeight(Math.max(e.data.height, 500));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleUpdate = (updater: (prev: DayPage) => DayPage) => {
    setTestPageData((prev) => updater(prev));
  };

  const handleReset = () => {
    sound.playTick(true);
    const fresh = structuredClone(template.pageData || {});
    setTestPageData(fresh);
    const raw =
      template.customHtmlContent ||
      fresh.customHtmlContent ||
      '<h1>قالب HTML</h1>';
    setPlaygroundIframeDoc(injectHtmlSyncScript(raw));
  };

  const getComputedTargetDateKey = () => {
    if (dateChoice === 'today') {
      return getDateKey(new Date());
    } else if (dateChoice === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return getDateKey(d);
    } else {
      return customDateValue;
    }
  };

  const handleConfirmApply = () => {
    if (!selectedJournalId) return;
    sound.playAdd();
    const targetDateKey = getComputedTargetDateKey();
    onApplyToJournal(selectedJournalId, testPageData, template.title, targetDateKey);
    setShowApplyModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col p-3 sm:p-5 overflow-hidden animate-in fade-in duration-150">
      {/* Minimal Clean Top Bar */}
      <div
        dir="rtl"
        className="w-full max-w-5xl mx-auto bg-white border border-slate-200/80 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-sm mb-4 shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playSwoosh();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="بازگشت"
          >
            <ArrowRight size={16} />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{template.title}</h2>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              تست زنده
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="بازنشانی تغییرات آزمایشی"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">بازنشانی</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playAdd();
              setShowApplyModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>استفاده در دفترچه</span>
          </button>
        </div>
      </div>

      {/* Main Sheet Container in Playground */}
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto rounded-3xl flex justify-center items-start">
        <div className="w-full relative">
          {template.templateType === 'template-custom-html' ? (
            <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <iframe
                ref={iframeRef}
                key={template.id}
                srcDoc={playgroundIframeDoc}
                title="Custom HTML Template Playground"
                scrolling="no"
                style={{
                  width: '100%',
                  height: `${customHtmlHeight}px`,
                  border: 'none',
                  overflow: 'hidden',
                  display: 'block',
                }}
                sandbox="allow-scripts allow-forms"
              />
            </div>
          ) : template.templateType === 'template-4-celestial-todo' ? (
            <Template4CelestialSheet
              pageData={testPageData}
              onUpdate={handleUpdate}
            />
          ) : template.templateType === 'template-3-writing-plans' ? (
            <Template3WritingSheet
              pageData={testPageData}
              onUpdate={handleUpdate}
            />
          ) : template.templateType === 'template-2-one-big-thing' ? (
            <Template2PlannerSheet
              pageData={testPageData}
              onUpdate={handleUpdate}
            />
          ) : (
            <main className="w-full bg-[#263e32]/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-white/20 grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-8 text-white">
              {/* Chronodex & Linear Time Blocking */}
              <div className="flex flex-col gap-8">
                <ChronodexDial
                  pageData={testPageData}
                  categories={DEFAULT_CATEGORIES}
                  activeCategoryFilter={activeCategoryFilter}
                  onSelectCategoryFilter={setActiveCategoryFilter}
                  hoveredHour={hoveredHour}
                  onHoverHour={setHoveredHour}
                  onUpdateHourColor={(hour, color, cat) => {
                    handleUpdate((prev) => {
                      const slots = { ...prev.timeSlots };
                      const currentSlot = slots[hour] || { text: '', color: '' };
                      slots[hour] = { ...currentSlot, color, cat };
                      return { ...prev, timeSlots: slots };
                    });
                  }}
                />

                <LinearTimeBlocking
                  pageData={testPageData}
                  categories={DEFAULT_CATEGORIES}
                  hoveredHour={hoveredHour}
                  onHoverHour={setHoveredHour}
                  onUpdateSlotText={(hour, text) => {
                    handleUpdate((prev) => {
                      const slots = { ...prev.timeSlots };
                      const currentSlot = slots[hour] || { text: '', color: '' };
                      slots[hour] = { ...currentSlot, text };
                      return { ...prev, timeSlots: slots };
                    });
                  }}
                  onUpdateSlotColor={(hour, color, cat) => {
                    handleUpdate((prev) => {
                      const slots = { ...prev.timeSlots };
                      const currentSlot = slots[hour] || { text: '', color: '' };
                      slots[hour] = { ...currentSlot, color, cat };
                      return { ...prev, timeSlots: slots };
                    });
                  }}
                />
              </div>

              {/* Habits, Notes, Priorities */}
              <div className="flex flex-col gap-6">
                <HabitsAndNotes
                  habits={testPageData.habits || []}
                  dailyNotes={testPageData.dailyNotes || ''}
                  onUpdateHabit={(id, done) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, done } : h)),
                    }));
                  }}
                  onUpdateHabitText={(id, text) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, text } : h)),
                    }));
                  }}
                  onAddHabit={(text) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      habits: [...(prev.habits || []), { id: `h_${Date.now()}`, text, done: false }],
                    }));
                  }}
                  onDeleteHabit={(id) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      habits: (prev.habits || []).filter((h) => h.id !== id),
                    }));
                  }}
                  onUpdateNotes={(dailyNotes) => {
                    handleUpdate((prev) => ({ ...prev, dailyNotes }));
                  }}
                />

                <NonRoutineTasks
                  nonRoutine={testPageData.nonRoutine}
                  onChangeNonRoutine={(nonRoutine) => {
                    handleUpdate((prev) => ({ ...prev, nonRoutine }));
                  }}
                />

                <PrioritiesAndTodos
                  priorities={testPageData.priorities || []}
                  todos={testPageData.todos || []}
                  onUpdatePriority={(idx, text, done) => {
                    handleUpdate((prev) => {
                      const updated = [...(prev.priorities || [])];
                      updated[idx] = { text, done };
                      return { ...prev, priorities: updated };
                    });
                  }}
                  onTogglePriorityDone={(idx) => {
                    handleUpdate((prev) => {
                      const updated = [...(prev.priorities || [])];
                      if (updated[idx]) {
                        updated[idx] = { ...updated[idx], done: !updated[idx].done };
                      }
                      return { ...prev, priorities: updated };
                    });
                  }}
                  onUpdateTodoText={(id, text) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, text } : t)),
                    }));
                  }}
                  onToggleTodoDone={(id) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
                    }));
                  }}
                  onAddTodo={() => {
                    handleUpdate((prev) => ({
                      ...prev,
                      todos: [...(prev.todos || []), { id: `t_${Date.now()}`, text: '', done: false }],
                    }));
                  }}
                  onDeleteTodo={(id) => {
                    handleUpdate((prev) => ({
                      ...prev,
                      todos: (prev.todos || []).filter((t) => t.id !== id),
                    }));
                  }}
                />
              </div>
            </main>
          )}
        </div>
      </div>

      {/* Clean Apply to Notebook Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            dir="rtl"
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100 flex flex-col gap-4 text-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold">انتخاب دفترچه مقصد</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={15} />
              </button>
            </div>

            {/* Choose Notebook */}
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {journals.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setSelectedJournalId(j.id)}
                  className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition-colors cursor-pointer ${
                    selectedJournalId === j.id
                      ? 'border-slate-900 bg-slate-50 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: j.color }}
                    />
                    <span className="text-xs">{j.title}</span>
                  </div>
                  {selectedJournalId === j.id && <Check size={14} className="text-slate-900" />}
                </button>
              ))}
            </div>

            {/* Date Choice */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600">تاریخ برگه:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDateChoice('today')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    dateChoice === 'today'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  امروز
                </button>
                <button
                  type="button"
                  onClick={() => setDateChoice('tomorrow')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    dateChoice === 'tomorrow'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  فردا
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                تأیید و افزودن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
