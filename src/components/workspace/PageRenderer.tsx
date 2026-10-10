import React, { memo, useRef, useEffect, useState, useMemo } from 'react';
import { DayPage, Journal, TemplateType } from '../../types';
import { ChronodexDial } from '../ChronodexDial';
import { LinearTimeBlocking } from '../LinearTimeBlocking';
import { HabitsAndNotes } from '../HabitsAndNotes';
import { NonRoutineTasks } from '../NonRoutineTasks';
import { PrioritiesAndTodos } from '../PrioritiesAndTodos';
import { Template2PlannerSheet } from '../Template2PlannerSheet';
import { Template3WritingSheet } from '../Template3WritingSheet';
import { Template4CelestialSheet } from '../Template4CelestialSheet';
import { DEFAULT_CATEGORIES } from '../../utils/storage';
import { injectHtmlSyncScript } from '../../utils/htmlTemplates';

interface PageRendererProps {
  pageId: string;
  pageData: DayPage;
  journal: Journal;
  onUpdate: (updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  compact?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = memo(({
  pageId,
  pageData,
  journal,
  onUpdate,
  compact = false,
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // HTML template iframe handling
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(compact ? 650 : 850);

  const iframeSrcDoc = useMemo(() => {
    if (pageData.templateType === 'template-custom-html' && pageData.customHtmlContent) {
      return injectHtmlSyncScript(pageData.customHtmlContent);
    }
    return '';
  }, [pageData.templateType, pageData.customHtmlContent]);

  useEffect(() => {
    if (pageData.templateType !== 'template-custom-html') return;

    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'PLANNER_HTML_SYNC') {
        const payload = e.data.payload;
        onUpdate((prev) => ({
          ...prev,
          timeSlots: payload.timeSlots || prev.timeSlots,
          habits: payload.habits || prev.habits,
          dailyNotes: payload.dailyNotes ?? prev.dailyNotes,
          priorities: payload.priorities || prev.priorities,
          todos: payload.todos || prev.todos,
          oneBigThing: payload.oneBigThing ?? prev.oneBigThing,
          halfHourSlots: payload.halfHourSlots || prev.halfHourSlots,
          eisenhowerMatrix: payload.eisenhowerMatrix || prev.eisenhowerMatrix,
          brainDump: payload.brainDump ?? prev.brainDump,
        }));
      } else if (e.data.type === 'PLANNER_DOC_HEIGHT') {
        if (typeof e.data.height === 'number' && e.data.height > 200) {
          setIframeHeight(Math.max(e.data.height + 40, 650));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pageData.templateType, onUpdate]);

  if (pageData.templateType === 'template-custom-html') {
    return (
      <div className="w-full bg-white dark:bg-stone-900 rounded-xl overflow-hidden p-2">
        <iframe
          ref={iframeRef}
          srcDoc={iframeSrcDoc}
          title={`Custom HTML Template - ${pageId}`}
          scrolling="no"
          style={{
            width: '100%',
            minHeight: '550px',
            height: `${iframeHeight}px`,
            border: 'none',
            overflow: 'hidden',
            display: 'block',
          }}
          sandbox="allow-scripts allow-forms"
        />
      </div>
    );
  }

  if (pageData.templateType === 'template-4-celestial-todo') {
    return (
      <div className="w-full">
        <Template4CelestialSheet
          pageData={pageData}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  if (pageData.templateType === 'template-3-writing-plans') {
    return (
      <div className="w-full">
        <Template3WritingSheet
          pageData={pageData}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  if (pageData.templateType === 'template-2-one-big-thing') {
    return (
      <div className="w-full">
        <Template2PlannerSheet
          pageData={pageData}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  // Template 1: Classic Green Sage 24H Chronodex
  return (
    <div
      className={`w-full bg-[#fcfbf9] dark:bg-[#181816] rounded-2xl p-4 sm:p-6 shadow-2xs border border-stone-200/70 dark:border-stone-800/70 grid ${
        compact ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-6 md:gap-8'
      }`}
    >
      {/* Left Column: Chronodex & Linear Time Blocking */}
      <div className="flex flex-col gap-6">
        <ChronodexDial
          pageData={pageData}
          categories={DEFAULT_CATEGORIES}
          activeCategoryFilter={activeCategoryFilter}
          onSelectCategoryFilter={setActiveCategoryFilter}
          hoveredHour={hoveredHour}
          onHoverHour={setHoveredHour}
          onUpdateHourColor={(hour, color, cat) => {
            onUpdate((prev) => {
              const slots = { ...prev.timeSlots };
              const currentSlot = slots[hour] || { text: '', color: '' };
              slots[hour] = { ...currentSlot, color, cat };
              return { ...prev, timeSlots: slots };
            });
          }}
        />

        <LinearTimeBlocking
          pageData={pageData}
          categories={DEFAULT_CATEGORIES}
          hoveredHour={hoveredHour}
          onHoverHour={setHoveredHour}
          onUpdateSlotText={(hour, text) => {
            onUpdate((prev) => {
              const slots = { ...prev.timeSlots };
              const currentSlot = slots[hour] || { text: '', color: '' };
              slots[hour] = { ...currentSlot, text };
              return { ...prev, timeSlots: slots };
            });
          }}
          onUpdateSlotColor={(hour, color, cat) => {
            onUpdate((prev) => {
              const slots = { ...prev.timeSlots };
              const currentSlot = slots[hour] || { text: '', color: '' };
              slots[hour] = { ...currentSlot, color, cat };
              return { ...prev, timeSlots: slots };
            });
          }}
        />
      </div>

      {/* Right Column: Habits, Non-Routine, Priorities & Todos */}
      <div className="flex flex-col gap-6">
        <PrioritiesAndTodos
          priorities={pageData.priorities || []}
          todos={pageData.todos || []}
          onUpdatePriority={(idx: number, text: string, done: boolean) => {
            onUpdate((prev) => {
              const list = [...(prev.priorities || [])];
              list[idx] = { text, done };
              return { ...prev, priorities: list };
            });
          }}
          onTogglePriorityDone={(idx: number) => {
            onUpdate((prev) => {
              const list = [...(prev.priorities || [])];
              if (list[idx]) list[idx] = { ...list[idx], done: !list[idx].done };
              return { ...prev, priorities: list };
            });
          }}
          onToggleTodoDone={(id: string) => {
            onUpdate((prev) => ({
              ...prev,
              todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
            }));
          }}
          onUpdateTodoText={(id: string, text: string) => {
            onUpdate((prev) => ({
              ...prev,
              todos: (prev.todos || []).map((t) => (t.id === id ? { ...t, text } : t)),
            }));
          }}
          onAddTodo={() => {
            onUpdate((prev) => ({
              ...prev,
              todos: [...(prev.todos || []), { id: `todo_${Date.now()}`, text: '', done: false }],
            }));
          }}
          onDeleteTodo={(id: string) => {
            onUpdate((prev) => ({
              ...prev,
              todos: (prev.todos || []).filter((t) => t.id !== id),
            }));
          }}
        />

        <HabitsAndNotes
          habits={pageData.habits || []}
          dailyNotes={pageData.dailyNotes || ''}
          onUpdateHabit={(id, done) => {
            onUpdate((prev) => ({
              ...prev,
              habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, done } : h)),
            }));
          }}
          onUpdateHabitText={(id, text) => {
            onUpdate((prev) => ({
              ...prev,
              habits: (prev.habits || []).map((h) => (h.id === id ? { ...h, text } : h)),
            }));
          }}
          onAddHabit={(text) => {
            onUpdate((prev) => ({
              ...prev,
              habits: [...(prev.habits || []), { id: `h_${Date.now()}`, text, done: false }],
            }));
          }}
          onDeleteHabit={(id) => {
            onUpdate((prev) => ({
              ...prev,
              habits: (prev.habits || []).filter((h) => h.id !== id),
            }));
          }}
          onUpdateNotes={(dailyNotes) => {
            onUpdate((prev) => ({ ...prev, dailyNotes }));
          }}
        />

        <NonRoutineTasks
          nonRoutine={pageData.nonRoutine}
          onChangeNonRoutine={(nonRoutine) => {
            onUpdate((prev) => ({ ...prev, nonRoutine }));
          }}
        />
      </div>
    </div>
  );
});
