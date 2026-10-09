import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Calendar, FileText, Settings, Volume2, VolumeX, ArrowRight, PenTool, Sun, Moon } from 'lucide-react';
import { Journal, DayPage, AppSettings, CategoryOption, DrawingStroke, PageTextFormat } from '../types';
import { formatJalaliDate, getDateKey, parseDateKey } from '../utils/jalali';
import { sound } from '../utils/audio';
import { ChronodexDial } from './ChronodexDial';
import { LinearTimeBlocking } from './LinearTimeBlocking';
import { HabitsAndNotes } from './HabitsAndNotes';
import { NonRoutineTasks } from './NonRoutineTasks';
import { PrioritiesAndTodos } from './PrioritiesAndTodos';
import { Template2PlannerSheet } from './Template2PlannerSheet';
import { Template3WritingSheet } from './Template3WritingSheet';
import { Template4CelestialSheet } from './Template4CelestialSheet';
import { createEmptyDayPage, DEFAULT_CATEGORIES } from '../utils/storage';
import { WordStyleToolbar, PERSIAN_FONTS } from './WordStyleToolbar';
import { DrawingCanvasOverlay } from './DrawingCanvasOverlay';
import { injectHtmlSyncScript } from '../utils/htmlTemplates';

interface PlannerViewProps {
  journal: Journal;
  initialDateKey?: string;
  onBackToPagesOverview: () => void;
  onBackToDashboard: () => void;
  onUpdateJournalPage: (dateKey: string, pageData: DayPage) => void;
  onOpenSettings: () => void;
  onOpenMarkdownModal: (date: Date, pageData: DayPage) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenCalendar?: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  journal,
  initialDateKey,
  onBackToPagesOverview,
  onBackToDashboard,
  onUpdateJournalPage,
  onOpenSettings,
  onOpenMarkdownModal,
  settings,
  onUpdateSettings,
  onOpenCalendar,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    initialDateKey ? parseDateKey(initialDateKey) : new Date()
  );
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [pageFlipClass, setPageFlipClass] = useState<string>('');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  useEffect(() => {
    if (initialDateKey) {
      setCurrentDate(parseDateKey(initialDateKey));
    }
  }, [initialDateKey]);

  const dateKey = getDateKey(currentDate);

  // Get or initialize active day's data
  const pageData: DayPage = journal.pages[dateKey] || createEmptyDayPage();

  const [customHtmlHeight, setCustomHtmlHeight] = useState<number>(950);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Active element reference for Word-style formatting
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  // Text formatting state
  const [textFormat, setTextFormat] = useState<PageTextFormat>(() => pageData.textFormat || {
    fontFamily: 'Vazirmatn',
    fontSize: 14,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'right',
    textColor: '#1e293b',
  });

  useEffect(() => {
    if (pageData.textFormat) {
      setTextFormat(pageData.textFormat);
    }
  }, [dateKey]);

  // Color conversion helper
  const rgbToHex = (rgbStr: string): string => {
    if (!rgbStr || rgbStr.startsWith('#')) return rgbStr || '#1e293b';
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return rgbStr;
    const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  // Inspect element styles and update toolbar view to match active selection or focused element
  const inspectAndSyncToolbar = useCallback((el: HTMLElement) => {
    try {
      const computed = window.getComputedStyle(el);
      const fs = parseInt(el.style.fontSize || computed.fontSize, 10);
      const col = el.style.color || computed.color;
      const fw = el.style.fontWeight || computed.fontWeight;
      const fontFam = el.style.fontFamily || computed.fontFamily;
      const isItalic = (el.style.fontStyle || computed.fontStyle) === 'italic';
      const textDec = el.style.textDecoration || computed.textDecoration || '';
      const isUnderline = textDec.includes('underline');

      let matchedFont: string | undefined;
      for (const f of PERSIAN_FONTS) {
        if (fontFam.toLowerCase().includes(f.id.toLowerCase())) {
          matchedFont = f.id;
          break;
        }
      }

      setTextFormat((prev) => ({
        fontFamily: matchedFont || prev.fontFamily,
        fontSize: fs || prev.fontSize,
        textColor: col ? rgbToHex(col) : prev.textColor,
        isBold: fw === 'bold' || fw === '700' || fw === '800' || fw === '900' || parseInt(fw, 10) >= 600,
        isItalic,
        isUnderline,
        textAlign: (el.style.textAlign || (computed.textAlign as any)) || prev.textAlign,
      }));
    } catch (err) {}
  }, []);

  // Listen to focus and mouse events in main window for Word-style formatting
  useEffect(() => {
    const handleMainFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        lastActiveElementRef.current = target;
        inspectAndSyncToolbar(target);
      }
    };
    const handleMainMouseUp = () => {
      const active = document.activeElement as HTMLElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        lastActiveElementRef.current = active;
        inspectAndSyncToolbar(active);
      }
    };
    document.addEventListener('focusin', handleMainFocusIn);
    document.addEventListener('mouseup', handleMainMouseUp);
    return () => {
      document.removeEventListener('focusin', handleMainFocusIn);
      document.removeEventListener('mouseup', handleMainMouseUp);
    };
  }, [inspectAndSyncToolbar]);

  // Isolate iframeSrcDoc from typing updates so the iframe never reloads on keystrokes
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>(() => {
    return injectHtmlSyncScript(
      pageData.customHtmlContent || '<h1 style="text-align:center;font-family:sans-serif;margin-top:60px;">قالب HTML سفارشی</h1>'
    );
  });
  const activeDateKeyRef = React.useRef<string>(dateKey);
  const activeTemplateTypeRef = React.useRef<string>(pageData.templateType || '');

  const pageDataRef = React.useRef(pageData);
  pageDataRef.current = pageData;
  const dateKeyRef = React.useRef(dateKey);
  dateKeyRef.current = dateKey;

  // Only reload iframeSrcDoc when switching dates or template types
  useEffect(() => {
    if (
      activeDateKeyRef.current !== dateKey ||
      activeTemplateTypeRef.current !== pageData.templateType
    ) {
      activeDateKeyRef.current = dateKey;
      activeTemplateTypeRef.current = pageData.templateType || '';
      const rawHtml =
        journal.pages[dateKey]?.customHtmlContent ||
        '<h1 style="text-align:center;font-family:sans-serif;margin-top:60px;">قالب HTML سفارشی</h1>';
      setIframeSrcDoc(injectHtmlSyncScript(rawHtml));
    }
  }, [dateKey, pageData.templateType, journal.pages]);

  // Listen to iframe state changes, auto-resizing, and format inspections
  useEffect(() => {
    const handleCustomHtmlMessage = (e: MessageEvent) => {
      // Validate that message originates from our specific custom iframe
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'CUSTOM_HTML_SYNC' && typeof e.data.html === 'string') {
        // Save the updated HTML without triggering an iframe reload
        onUpdateJournalPage(dateKeyRef.current, {
          ...pageDataRef.current,
          customHtmlContent: e.data.html,
        });
      }
      if (e.data.type === 'CUSTOM_HTML_RESIZE' && typeof e.data.height === 'number') {
        setCustomHtmlHeight(Math.max(e.data.height, 500));
      }
      if (e.data.type === 'CUSTOM_HTML_FORMAT_INSPECT') {
        setTextFormat((prev) => ({
          ...prev,
          fontSize: typeof e.data.fontSize === 'number' ? e.data.fontSize : prev.fontSize,
          textColor: e.data.textColor ? rgbToHex(e.data.textColor) : prev.textColor,
          isBold: typeof e.data.isBold === 'boolean' ? e.data.isBold : prev.isBold,
          isItalic: typeof e.data.isItalic === 'boolean' ? e.data.isItalic : prev.isItalic,
          isUnderline: typeof e.data.isUnderline === 'boolean' ? e.data.isUnderline : prev.isUnderline,
          textAlign: e.data.textAlign || prev.textAlign,
          fontFamily: e.data.fontFamily || prev.fontFamily,
        }));
      }
    };
    window.addEventListener('message', handleCustomHtmlMessage);
    return () => window.removeEventListener('message', handleCustomHtmlMessage);
  }, [onUpdateJournalPage]);

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: 'APPLY_STYLE_FORMAT',
            updates: textFormat,
          },
          '*'
        );
      }
    } catch (e) {
      // Handled via postMessage
    }
  };


  // Task Rollover: Check if previous day had unfinished todos/priorities
  useEffect(() => {
    if (settings.autoRolloverTasks && !journal.pages[dateKey]) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevKey = getDateKey(prevDate);
      const prevPage = journal.pages[prevKey];

      if (prevPage) {
        const unfinishedTodos = (prevPage.todos || []).filter((t) => !t.done && t.text.trim());
        const unfinishedPriorities = (prevPage.priorities || []).filter((p) => !p.done && p.text.trim());

        if (unfinishedTodos.length > 0 || unfinishedPriorities.length > 0) {
          const freshPage = createEmptyDayPage();
          if (unfinishedTodos.length > 0) {
            freshPage.todos = unfinishedTodos.map((t) => ({ ...t, id: `t_${Date.now()}_${Math.random()}` }));
          }
          if (unfinishedPriorities.length > 0) {
            freshPage.priorities = unfinishedPriorities.map((p) => ({ ...p, done: false }));
          }
          onUpdateJournalPage(dateKey, freshPage);
        }
      }
    }
  }, [dateKey, journal.pages, settings.autoRolloverTasks, currentDate, onUpdateJournalPage]);

  // Navigate Date with Animation
  const navigateDate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isFlipping) return;
      setIsFlipping(true);
      sound.playSwoosh();

      if (settings.animationStyle === 'flip') {
        setPageFlipClass(direction === 'next' ? 'sheet-flip-next-exit' : 'sheet-flip-prev-exit');

        setTimeout(() => {
          const nextD = new Date(currentDate);
          if (direction === 'next') nextD.setDate(nextD.getDate() + 1);
          else nextD.setDate(nextD.getDate() - 1);
          setCurrentDate(nextD);

          setPageFlipClass(direction === 'next' ? 'sheet-flip-next-enter' : 'sheet-flip-prev-enter');

          setTimeout(() => {
            setPageFlipClass('');
            setIsFlipping(false);
          }, 420);
        }, 300);
      } else {
        const nextD = new Date(currentDate);
        if (direction === 'next') nextD.setDate(nextD.getDate() + 1);
        else nextD.setDate(nextD.getDate() - 1);
        setCurrentDate(nextD);
        setIsFlipping(false);
      }
    },
    [currentDate, isFlipping, settings.animationStyle]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        navigateDate('prev');
      } else if (e.key === 'ArrowRight') {
        navigateDate('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateDate]);

  // Handler helpers
  const handleUpdate = (updater: (prev: DayPage) => DayPage) => {
    const updated = updater(pageData);
    onUpdateJournalPage(dateKey, updated);
  };

  // Color themes mapping
  const themeClasses: Record<string, { bg: string; sheetBg: string }> = {
    sage: {
      bg: 'from-[#2b4336] via-[#365343] to-[#2f493b]',
      sheetBg: 'bg-[#263e32]/90 border-white/20',
    },
    midnight: {
      bg: 'from-[#121a26] via-[#1e2c40] to-[#152030]',
      sheetBg: 'bg-[#1a2638]/90 border-white/20',
    },
    latte: {
      bg: 'from-[#3d3129] via-[#524237] to-[#43352c]',
      sheetBg: 'bg-[#382c25]/90 border-white/20',
    },
    plum: {
      bg: 'from-[#301b2c] via-[#482941] to-[#381e33]',
      sheetBg: 'bg-[#331d2f]/90 border-white/20',
    },
    oled: {
      bg: 'from-[#0b0f14] via-[#121820] to-[#0c1015]',
      sheetBg: 'bg-[#121922]/90 border-white/15',
    },
    rose: {
      bg: 'from-[#381d26] via-[#4a2835] to-[#3b1e28]',
      sheetBg: 'bg-[#3b202a]/90 border-white/20',
    },
  };

  const activeTheme = themeClasses[journal.theme || 'sage'] || themeClasses.sage;

  // ==========================================
  // Drawing & Inking (قلم و نقاشی) State
  // ==========================================
  const [showWordToolbar, setShowWordToolbar] = useState(false);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [strokeSize, setStrokeSize] = useState(2.5);
  const [undoStack, setUndoStack] = useState<DrawingStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[][]>([]);

  // Word-style formatting engine: applies styles strictly to selected or active elements
  const applyFormatToElement = (el: HTMLElement, updates: Partial<PageTextFormat>) => {
    if (updates.fontSize) el.style.fontSize = `${updates.fontSize}px`;
    if (updates.textColor) el.style.color = updates.textColor;
    if (updates.fontFamily) el.style.fontFamily = `'${updates.fontFamily}', sans-serif`;
    if (updates.isBold !== undefined) el.style.fontWeight = updates.isBold ? '700' : '400';
    if (updates.isItalic !== undefined) el.style.fontStyle = updates.isItalic ? 'italic' : 'normal';
    if (updates.isUnderline !== undefined) el.style.textDecoration = updates.isUnderline ? 'underline' : 'none';
    if (updates.textAlign) el.style.textAlign = updates.textAlign;
  };

  const applyFormatToSelection = (
    doc: Document,
    win: Window,
    sel: Selection,
    updates: Partial<PageTextFormat>
  ) => {
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);

    const span = doc.createElement('span');
    if (updates.fontSize) span.style.fontSize = `${updates.fontSize}px`;
    if (updates.textColor) span.style.color = updates.textColor;
    if (updates.fontFamily) span.style.fontFamily = `'${updates.fontFamily}', sans-serif`;
    if (updates.isBold !== undefined) span.style.fontWeight = updates.isBold ? '700' : '400';
    if (updates.isItalic !== undefined) span.style.fontStyle = updates.isItalic ? 'italic' : 'normal';
    if (updates.isUnderline !== undefined) span.style.textDecoration = updates.isUnderline ? 'underline' : 'none';

    try {
      const extracted = range.extractContents();
      span.appendChild(extracted);
      range.insertNode(span);

      sel.removeAllRanges();
      const newRange = doc.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    } catch (e) {
      if (updates.textColor) doc.execCommand('foreColor', false, updates.textColor);
      if (updates.isBold !== undefined) doc.execCommand('bold', false);
      if (updates.isItalic !== undefined) doc.execCommand('italic', false);
      if (updates.isUnderline !== undefined) doc.execCommand('underline', false);
    }

    if (typeof (win as any).__planner_sync_state__ === 'function') {
      (win as any).__planner_sync_state__();
    }
  };

  const handleApplyFormat = (updates: Partial<PageTextFormat>) => {
    setTextFormat((prev) => ({ ...prev, ...updates }));

    let formatted = false;

    // 1. Format inside Custom HTML Template (iframe)
    const iframe = iframeRef.current;
    if (pageData.templateType === 'template-custom-html' && iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          {
            type: 'APPLY_STYLE_FORMAT',
            updates,
          },
          '*'
        );
        formatted = true;
      } catch (err) {
        console.warn('Notice posting format message to iframe:', err);
      }
    }

    // 2. Format inside Native Planner Sheet (Template 1, 2, 3, 4)
    if (!formatted) {
      const activeNative = (lastActiveElementRef.current || document.activeElement) as HTMLElement | null;
      if (
        activeNative &&
        (activeNative.tagName === 'INPUT' ||
          activeNative.tagName === 'TEXTAREA' ||
          activeNative.isContentEditable)
      ) {
        applyFormatToElement(activeNative, updates);

        let textId = activeNative.getAttribute('data-text-id');
        if (!textId) {
          textId =
            activeNative.id ||
            activeNative.getAttribute('placeholder') ||
            `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          activeNative.setAttribute('data-text-id', textId);
        }

        handleUpdate((prev) => ({
          ...prev,
          elementStyles: {
            ...(prev.elementStyles || {}),
            [textId!]: {
              ...((prev.elementStyles || {})[textId!] || {}),
              ...updates,
            },
          },
        }));
        formatted = true;
      }
    }

    // 3. Fallback: Save as default active format for future typing without modifying existing elements
    handleUpdate((prev) => ({
      ...prev,
      textFormat: {
        ...(prev.textFormat || textFormat),
        ...updates,
      },
    }));
  };

  const handleUpdateTextFormat = (updater: (prev: PageTextFormat) => PageTextFormat) => {
    const updated = updater(textFormat);
    handleApplyFormat(updated);
  };

  // Re-apply saved elementStyles on active day inputs
  useEffect(() => {
    if (pageData.elementStyles) {
      Object.entries(pageData.elementStyles).forEach(([id, styles]) => {
        const el = document.querySelector(`[data-text-id="${id}"]`) as HTMLElement | null;
        if (el) {
          applyFormatToElement(el, styles);
        }
      });
    }
  }, [dateKey, pageData.elementStyles]);

  const handleUpdateStrokes = (newStrokes: DrawingStroke[]) => {
    setUndoStack((prev) => [...prev, pageData.drawingStrokes || []]);
    setRedoStack([]);
    handleUpdate((prev) => ({
      ...prev,
      drawingStrokes: newStrokes,
    }));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, pageData.drawingStrokes || []]);
    handleUpdate((prev) => ({
      ...prev,
      drawingStrokes: previous,
    }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, pageData.drawingStrokes || []]);
    handleUpdate((prev) => ({
      ...prev,
      drawingStrokes: next,
    }));
  };

  const handleClearStrokes = () => {
    setUndoStack((prev) => [...prev, pageData.drawingStrokes || []]);
    setRedoStack([]);
    handleUpdate((prev) => ({
      ...prev,
      drawingStrokes: [],
    }));
  };

  // Dynamic CSS variables for sheet typography (fallback font family and font styling)
  const sheetTypographyStyles: React.CSSProperties = {
    ['--sheet-font-family' as any]: `'${textFormat.fontFamily}', sans-serif`,
    ['--sheet-font-size' as any]: `${textFormat.fontSize}px`,
    ['--sheet-font-weight' as any]: textFormat.isBold ? '700' : '400',
    ['--sheet-font-style' as any]: textFormat.isItalic ? 'italic' : 'normal',
    ['--sheet-text-decoration' as any]: textFormat.isUnderline ? 'underline' : 'none',
    ['--sheet-text-align' as any]: textFormat.textAlign,
    ['--sheet-text-color' as any]: textFormat.textColor,
  };


  return (
    <div
      className="min-h-screen w-full bg-[#f6f5f1] dark:bg-[#121211] p-3 sm:p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden pb-24 sm:pb-12 text-stone-900 dark:text-stone-100"
    >
      {/* Top Navigation Toolbar Inside Journal */}
      <header className="w-full max-w-5xl bg-white/80 dark:bg-[#181816]/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-2 sm:p-2.5 md:px-4 md:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-stone-800 dark:text-stone-200 shadow-2xs z-20 mb-4 sm:mb-6">
        {/* Left: Back button to Pages Overview + Library + Active Journal Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playSwoosh();
              onBackToPagesOverview();
            }}
            className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="بازگشت به نمای کلی برگه‌های این دفترچه"
          >
            <ArrowRight size={14} />
            <span>برگه‌ها</span>
          </button>

          <button
            onClick={() => {
              sound.playSwoosh();
              onBackToDashboard();
            }}
            className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors"
            title="بازگشت به کتابخانه ژورنال‌ها"
          >
            کتابخانه
          </button>

          <div className="flex items-center gap-2 bg-stone-100/70 dark:bg-stone-850 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: journal.color }}
            />
            <span className="truncate max-w-[130px] md:max-w-[200px]">{journal.title}</span>
          </div>
        </div>

        {/* Center: Date Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title="روز قبل (کلید چپ کیبورد)"
          >
            <ChevronRight size={16} />
          </button>

          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-1 sm:py-1.5 rounded-lg text-xs md:text-sm font-semibold text-stone-800 dark:text-stone-200">
            <Calendar size={14} className="text-stone-500 dark:text-stone-400" />
            <span>{formatJalaliDate(currentDate)}</span>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title="روز بعد (کلید راست کیبورد)"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => {
              sound.playSwoosh();
              setCurrentDate(new Date());
            }}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-800"
          >
            امروز
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Template Switcher */}
          <button
            onClick={() => {
              sound.playAdd();
              let nextType:
                | 'template-1-green'
                | 'template-2-one-big-thing'
                | 'template-3-writing-plans'
                | 'template-4-celestial-todo' = 'template-1-green';

              if (pageData.templateType === 'template-1-green' || !pageData.templateType) {
                nextType = 'template-2-one-big-thing';
              } else if (pageData.templateType === 'template-2-one-big-thing') {
                nextType = 'template-3-writing-plans';
              } else if (pageData.templateType === 'template-3-writing-plans') {
                nextType = 'template-4-celestial-todo';
              } else {
                nextType = 'template-1-green';
              }

              handleUpdate((prev) => {
                const fresh = createEmptyDayPage(nextType);
                return {
                  ...prev,
                  templateType: nextType,
                  ...(nextType === 'template-4-celestial-todo' && !prev.celestialTodo
                    ? { celestialTodo: fresh.celestialTodo }
                    : {}),
                  ...(nextType === 'template-3-writing-plans' && !prev.writingPlans
                    ? { writingPlans: fresh.writingPlans }
                    : {}),
                  ...(nextType === 'template-2-one-big-thing' && !prev.halfHourSlots
                    ? { halfHourSlots: fresh.halfHourSlots, eisenhowerMatrix: fresh.eisenhowerMatrix }
                    : {}),
                };
              });
            }}
            className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="تغییر قالب برگه بین قالب‌های ۱، ۲، ۳ و ۴"
          >
            <span className="opacity-70">
              {pageData.templateType === 'template-4-celestial-todo'
                ? '☾'
                : pageData.templateType === 'template-3-writing-plans'
                ? '🌲'
                : pageData.templateType === 'template-2-one-big-thing'
                ? '📋'
                : '🌿'}
            </span>
            <span>
              {pageData.templateType === 'template-4-celestial-todo'
                ? 'قالب شماره ۴'
                : pageData.templateType === 'template-3-writing-plans'
                ? 'قالب شماره ۳'
                : pageData.templateType === 'template-2-one-big-thing'
                ? 'قالب شماره ۲'
                : 'قالب شماره ۱'}
            </span>
          </button>

          <button
            onClick={() => onOpenMarkdownModal(currentDate, pageData)}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="خروجی مارک‌داون .md"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">خروجی .md</span>
          </button>

          {/* Minimal Pen & Typography Toolbar Trigger */}
          <button
            onClick={() => {
              sound.playTick();
              setShowWordToolbar((prev) => !prev);
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              showWordToolbar
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
            }`}
            title="نوار ابزار قلم و فونت"
          >
            <PenTool size={13} className={isDrawingActive ? 'text-amber-500' : ''} />
            <span className="hidden sm:inline">قلم و فونت</span>
            {isDrawingActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Quick Dark/Light Theme Toggle */}
          <button
            onClick={() => {
              const nextMode: 'light' | 'dark' = settings.colorMode === 'dark' ? 'light' : 'dark';
              onUpdateSettings({ ...settings, colorMode: nextMode });
              sound.playTick(true);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title={settings.colorMode === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
          >
            {settings.colorMode === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          <button
            onClick={onOpenSettings}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title="تنظیمات پلنر"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={() => {
              const updated = !settings.soundEnabled;
              sound.enabled = updated;
              onUpdateSettings({ ...settings, soundEnabled: updated });
              if (updated) sound.playTick(true);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title={settings.soundEnabled ? 'قطع صدا' : 'فعال‌سازی صدا'}
          >
            {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* Minimal Glassmorphic Ribbon Toolbar (Toggled via Header Button) */}
      {showWordToolbar && (
        <WordStyleToolbar
          onClose={() => setShowWordToolbar(false)}
          isDrawingActive={isDrawingActive}
          onToggleDrawing={() => {
            sound.playTick();
            setIsDrawingActive(!isDrawingActive);
          }}
          currentTool={currentTool}
          onChangeTool={(tool) => {
            setCurrentTool(tool);
            if (tool === 'highlighter' && strokeColor === '#1e293b') {
              setStrokeColor('#fef08a');
              setStrokeSize(8);
            } else if (tool === 'pen' && strokeColor === '#fef08a') {
              setStrokeColor('#1e293b');
              setStrokeSize(2.5);
            }
          }}
          strokeColor={strokeColor}
          onChangeStrokeColor={setStrokeColor}
          strokeSize={strokeSize}
          onChangeStrokeSize={setStrokeSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onClearStrokes={handleClearStrokes}
          totalStrokes={(pageData.drawingStrokes || []).length}
          textFormat={textFormat}
          onUpdateTextFormat={handleUpdateTextFormat}
          onApplyFormat={handleApplyFormat}
        />
      )}

      {/* 3D Perspective Book Wrapper */}
      <div
        className="w-full max-w-5xl [perspective:1800px] relative planner-page-content"
        style={sheetTypographyStyles}
      >
        {/* Drawing & Annotation Canvas Overlay on the planner sheet */}
        <DrawingCanvasOverlay
          strokes={pageData.drawingStrokes || []}
          onUpdateStrokes={handleUpdateStrokes}
          isDrawingActive={isDrawingActive}
          currentTool={currentTool}
          strokeColor={strokeColor}
          strokeSize={strokeSize}
        />
        {pageData.templateType === 'template-custom-html' ? (
          <div
            className={`w-full bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-200 ${pageFlipClass}`}
            style={{ minHeight: `${customHtmlHeight + 40}px` }}
          >
            <iframe
              ref={iframeRef}
              key={dateKey}
              srcDoc={iframeSrcDoc}
              title="Custom HTML Template"
              onLoad={handleIframeLoad}
              scrolling="no"
              style={{
                width: '100%',
                minHeight: '650px',
                height: `${Math.max(customHtmlHeight, 650)}px`,
                border: 'none',
                overflow: 'hidden',
                display: 'block',
              }}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        ) : pageData.templateType === 'template-4-celestial-todo' ? (
          <div className={pageFlipClass}>
            <Template4CelestialSheet
              pageData={pageData}
              onUpdate={handleUpdate}
            />
          </div>
        ) : pageData.templateType === 'template-3-writing-plans' ? (
          <div className={pageFlipClass}>
            <Template3WritingSheet
              pageData={pageData}
              onUpdate={handleUpdate}
            />
          </div>
        ) : pageData.templateType === 'template-2-one-big-thing' ? (
          <div className={pageFlipClass}>
            <Template2PlannerSheet
              pageData={pageData}
              onUpdate={handleUpdate}
            />
          </div>
        ) : (
          <main
            className={`w-full bg-[#fcfbf9] dark:bg-[#181816] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800/80 grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-6 md:gap-10 ${pageFlipClass}`}
          >
            {/* LEFT COLUMN: 24h Chronodex & Linear Time Blocking */}
            <div className="flex flex-col gap-8">
              <ChronodexDial
                pageData={pageData}
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
                pageData={pageData}
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

            {/* RIGHT COLUMN: Habits, Non-routine, Priorities & Todos */}
            <div className="flex flex-col gap-6">
              <HabitsAndNotes
                habits={pageData.habits || []}
                dailyNotes={pageData.dailyNotes || ''}
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
                nonRoutine={pageData.nonRoutine}
                onChangeNonRoutine={(nonRoutine) => {
                  handleUpdate((prev) => ({ ...prev, nonRoutine }));
                }}
              />

              <PrioritiesAndTodos
                priorities={pageData.priorities || []}
                todos={pageData.todos || []}
                onUpdatePriority={(index, text, done) => {
                  handleUpdate((prev) => {
                    const list = [...(prev.priorities || [])];
                    list[index] = { text, done };
                    return { ...prev, priorities: list };
                  });
                }}
                onTogglePriorityDone={(index) => {
                  handleUpdate((prev) => {
                    const list = [...(prev.priorities || [])];
                    const current = list[index] || { text: '', done: false };
                    list[index] = { ...current, done: !current.done };
                    return { ...prev, priorities: list };
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
  );
};
