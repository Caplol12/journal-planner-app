import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  Check,
  Trash2,
  BookOpen,
  CalendarDays,
  Columns,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  d2j,
  d2g,
  j2d,
  g2d,
  isJalaliLeap,
  isGregorianLeap,
  jalaliMonthLength,
  gregorianMonthLength,
  getWeekday,
  getTodayJdn,
  getEventsForJdn,
  getMoonPhase,
  getMoonSvg,
  loadCalendarNotes,
  saveCalendarNote,
  toggleCalendarNote,
  deleteCalendarNote,
  getAllDatesWithNotes,
  jdnToJalaliDateKey,
  toPersianDigits,
  JALALI_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES,
  FA_WEEKDAY_NAMES,
  EN_WEEKDAY_NAMES,
  CalendarTaskNote,
} from '../../utils/celestialDateEngine';
import {
  ZODIAC_MAP,
  SolarDayArcWidget,
  ZodiacConstellationCard,
  DayMoodStickerPicker,
  loadStickersStorage,
  saveStickerStorage,
  MOOD_STICKERS,
} from './CalendarVisualWidgets';
import { sound } from '../../utils/audio';
import { Journal } from '../../types';

interface OrbitCalendarProps {
  onBackToApp: () => void;
  onOpenJournalDate?: (dateKey: string) => void;
  journals?: Journal[];
}

type CalendarSystem = 'jalali' | 'gregorian';
type CalendarViewMode = 'month' | 'week' | 'year';

const SHORT_FA_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const FULL_FA_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const SHORT_EN_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const FULL_EN_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const OrbitCalendar: React.FC<OrbitCalendarProps> = ({
  onBackToApp,
  onOpenJournalDate,
}) => {
  // Calendar System (شمسی / میلادی)
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(() => {
    try {
      const saved = localStorage.getItem('orbit_calendar_system');
      return saved === 'gregorian' ? 'gregorian' : 'jalali';
    } catch {
      return 'jalali';
    }
  });

  // View Mode (ماهانه / هفتگی / سالانه)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Today JDN
  const todayJdn = useMemo(() => getTodayJdn(), []);

  // Selected JDN
  const [selectedJdn, setSelectedJdn] = useState<number>(todayJdn);

  // Current viewed Year & Month
  const [viewYear, setViewYear] = useState<number>(() => {
    const todayParts = calendarSystem === 'jalali' ? d2j(todayJdn) : d2g(todayJdn);
    return todayParts.y;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const todayParts = calendarSystem === 'jalali' ? d2j(todayJdn) : d2g(todayJdn);
    return todayParts.m;
  });

  // Notes state for selected day
  const [dayNotes, setDayNotes] = useState<CalendarTaskNote[]>(() => loadCalendarNotes(todayJdn));
  const [newNoteInput, setNewNoteInput] = useState('');
  const [datesWithNotes, setDatesWithNotes] = useState<Set<number>>(() => getAllDatesWithNotes());

  // Stickers state for days
  const [stickers, setStickers] = useState<Record<number, string>>(() => loadStickersStorage());
  const [showCelestialWidgets, setShowCelestialWidgets] = useState(false);

  const handleSelectSticker = (stickerId: string | null) => {
    sound.playTick(true);
    const updated = saveStickerStorage(selectedJdn, stickerId);
    setStickers({ ...updated });
  };

  // Live Clock state (HH:mm)
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  // Synchronize notes when selected day changes
  useEffect(() => {
    setDayNotes(loadCalendarNotes(selectedJdn));
  }, [selectedJdn]);

  // Live Clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Switch Calendar System
  const handleSwitchSystem = (system: CalendarSystem) => {
    if (system === calendarSystem) return;
    sound.playTick(true);

    const targetParts = system === 'jalali' ? d2j(selectedJdn) : d2g(selectedJdn);
    setCalendarSystem(system);
    setViewYear(targetParts.y);
    setViewMonth(targetParts.m);

    try {
      localStorage.setItem('orbit_calendar_system', system);
    } catch {}
  };

  // Warp to Today
  const handleWarpToToday = () => {
    sound.playSwoosh();
    setSelectedJdn(todayJdn);
    const todayParts = calendarSystem === 'jalali' ? d2j(todayJdn) : d2g(todayJdn);
    setViewYear(todayParts.y);
    setViewMonth(todayParts.m);
  };

  // Month navigation
  const handlePrevMonth = () => {
    sound.playTick(false);
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playTick(false);
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Week navigation
  const handlePrevWeek = () => {
    sound.playTick(false);
    const nextJdn = selectedJdn - 7;
    setSelectedJdn(nextJdn);
    const p = calendarSystem === 'jalali' ? d2j(nextJdn) : d2g(nextJdn);
    setViewYear(p.y);
    setViewMonth(p.m);
  };

  const handleNextWeek = () => {
    sound.playTick(false);
    const nextJdn = selectedJdn + 7;
    setSelectedJdn(nextJdn);
    const p = calendarSystem === 'jalali' ? d2j(nextJdn) : d2g(nextJdn);
    setViewYear(p.y);
    setViewMonth(p.m);
  };

  // Year navigation
  const handlePrevYear = () => {
    sound.playTick(false);
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    sound.playTick(false);
    setViewYear((y) => y + 1);
  };

  // Jump from Annual View to Month View
  const handleJumpToMonth = (monthIdx: number, specificJdn?: number) => {
    sound.playSwoosh();
    setViewMonth(monthIdx);
    if (specificJdn) {
      setSelectedJdn(specificJdn);
    }
    setViewMode('month');
  };

  // Day Selection
  const handleSelectDay = (jdn: number) => {
    sound.playTick(true);
    setSelectedJdn(jdn);
    const p = calendarSystem === 'jalali' ? d2j(jdn) : d2g(jdn);
    if (p.y !== viewYear || p.m !== viewMonth) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  };

  // Notes operations
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    sound.playAdd();
    const updated = saveCalendarNote(selectedJdn, newNoteInput.trim());
    setDayNotes(updated);
    setNewNoteInput('');
    setDatesWithNotes(getAllDatesWithNotes());
  };

  const handleToggleNote = (id: string) => {
    sound.playTick(true);
    const updated = toggleCalendarNote(selectedJdn, id);
    setDayNotes(updated);
    setDatesWithNotes(getAllDatesWithNotes());
  };

  const handleDeleteNote = (id: string) => {
    sound.playSwoosh();
    const updated = deleteCalendarNote(selectedJdn, id);
    setDayNotes(updated);
    setDatesWithNotes(getAllDatesWithNotes());
  };

  // Selected Day Details calculation
  const selectedJalali = useMemo(() => d2j(selectedJdn), [selectedJdn]);
  const selectedGregorian = useMemo(() => d2g(selectedJdn), [selectedJdn]);
  const selectedWeekday = useMemo(() => getWeekday(selectedJdn), [selectedJdn]);
  const selectedEvents = useMemo(() => getEventsForJdn(selectedJdn), [selectedJdn]);
  const selectedMoon = useMemo(() => getMoonPhase(selectedJdn), [selectedJdn]);

  // Year Progress calculation
  const yearStats = useMemo(() => {
    if (calendarSystem === 'jalali') {
      const jy = selectedJalali.y;
      const startJdn = j2d(jy, 1, 1);
      const endJdn = j2d(jy + 1, 1, 1);
      const totalDays = endJdn - startJdn;
      const dayOfYear = selectedJdn - startJdn + 1;
      const daysLeft = totalDays - dayOfYear;
      const pct = Math.min(100, Math.max(0, Math.round((dayOfYear / totalDays) * 100)));
      return {
        year: jy,
        isLeap: isJalaliLeap(jy),
        totalDays,
        dayOfYear,
        daysLeft,
        pct,
      };
    } else {
      const gy = selectedGregorian.y;
      const startJdn = g2d(gy, 1, 1);
      const endJdn = g2d(gy + 1, 1, 1);
      const totalDays = endJdn - startJdn;
      const dayOfYear = selectedJdn - startJdn + 1;
      const daysLeft = totalDays - dayOfYear;
      const pct = Math.min(100, Math.max(0, Math.round((dayOfYear / totalDays) * 100)));
      return {
        year: gy,
        isLeap: isGregorianLeap(gy),
        totalDays,
        dayOfYear,
        daysLeft,
        pct,
      };
    }
  }, [calendarSystem, selectedJdn, selectedJalali.y, selectedGregorian.y]);

  // Relative days calculation
  const relativeDaysDiff = selectedJdn - todayJdn;
  const relativeDateText = useMemo(() => {
    if (relativeDaysDiff === 0) return 'امروز';
    if (relativeDaysDiff === 1) return 'فردا';
    if (relativeDaysDiff === -1) return 'دیروز';
    if (relativeDaysDiff > 0) return `${toPersianDigits(relativeDaysDiff)} روز بعد`;
    return `${toPersianDigits(Math.abs(relativeDaysDiff))} روز پیش`;
  }, [relativeDaysDiff]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key.toLowerCase() === 't') {
        handleWarpToToday();
      } else if (e.key.toLowerCase() === 'c') {
        handleSwitchSystem(calendarSystem === 'jalali' ? 'gregorian' : 'jalali');
      } else if (e.key === '1') {
        setViewMode('month');
      } else if (e.key === '2') {
        setViewMode('week');
      } else if (e.key === '3') {
        setViewMode('year');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calendarSystem]);

  // Monthly 42-day Grid
  const monthGridDays = useMemo(() => {
    const isJalali = calendarSystem === 'jalali';
    const monthStartJdn = isJalali
      ? j2d(viewYear, viewMonth, 1)
      : g2d(viewYear, viewMonth, 1);

    const weekStartOffset = isJalali ? 6 : 1;
    const firstDayDow = getWeekday(monthStartJdn);
    const leadingDays = ((firstDayDow - weekStartOffset) % 7 + 7) % 7;
    const firstCellJdn = monthStartJdn - leadingDays;

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const jdn = firstCellJdn + i;
      const jalaliParts = d2j(jdn);
      const gregParts = d2g(jdn);
      const isCurrentMonth = isJalali ? jalaliParts.m === viewMonth : gregParts.m === viewMonth;
      const dow = getWeekday(jdn);
      const isWeekend = isJalali ? dow === 5 : dow === 0 || dow === 6;
      const events = getEventsForJdn(jdn);
      const hasHoliday = events.some((e) => e.isHoliday);
      const hasNotes = datesWithNotes.has(jdn);
      const stkId = stickers[jdn];
      const stickerObj = stkId ? MOOD_STICKERS.find((s) => s.id === stkId) : undefined;
      const isToday = jdn === todayJdn;
      const isSelected = jdn === selectedJdn;

      const secondaryMonthName = isJalali
        ? gregParts.d === 1
          ? GREGORIAN_MONTH_NAMES[gregParts.m - 1].slice(0, 3)
          : ''
        : jalaliParts.d === 1
        ? JALALI_MONTH_NAMES[jalaliParts.m - 1]
        : '';

      cells.push({
        jdn,
        primaryNum: isJalali ? jalaliParts.d : gregParts.d,
        secondaryNum: isJalali ? gregParts.d : jalaliParts.d,
        secondaryMonthName,
        isCurrentMonth,
        isWeekend,
        events,
        hasHoliday,
        hasNotes,
        sticker: stickerObj,
        isToday,
        isSelected,
      });
    }

    return cells;
  }, [calendarSystem, viewYear, viewMonth, datesWithNotes, stickers, todayJdn, selectedJdn]);

  // Secondary month range string
  const secondaryMonthRangeStr = useMemo(() => {
    const isJalali = calendarSystem === 'jalali';
    const startJdn = isJalali
      ? j2d(viewYear, viewMonth, 1)
      : g2d(viewYear, viewMonth, 1);
    const endJdn =
      startJdn +
      (isJalali ? jalaliMonthLength(viewYear, viewMonth) : gregorianMonthLength(viewYear, viewMonth)) -
      1;

    const secStart = isJalali ? d2g(startJdn) : d2j(startJdn);
    const secEnd = isJalali ? d2g(endJdn) : d2j(endJdn);

    if (isJalali) {
      const m1 = GREGORIAN_MONTH_NAMES[secStart.m - 1];
      const m2 = GREGORIAN_MONTH_NAMES[secEnd.m - 1];
      return secStart.m === secEnd.m
        ? `${m1} ${secStart.y}`
        : `${m1} — ${m2} ${secEnd.y}`;
    } else {
      const m1 = JALALI_MONTH_NAMES[secStart.m - 1];
      const m2 = JALALI_MONTH_NAMES[secEnd.m - 1];
      return secStart.m === secEnd.m
        ? `${m1} ${toPersianDigits(secStart.y)}`
        : `${m1} — ${m2} ${toPersianDigits(secEnd.y)}`;
    }
  }, [calendarSystem, viewYear, viewMonth]);

  // Week View Days calculation (7 days around selectedJdn)
  const weekDays = useMemo(() => {
    const isJalali = calendarSystem === 'jalali';
    const dow = getWeekday(selectedJdn);
    const weekStartOffset = isJalali ? 6 : 1;
    const offsetFromStart = ((dow - weekStartOffset) % 7 + 7) % 7;
    const weekStartJdn = selectedJdn - offsetFromStart;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const jdn = weekStartJdn + i;
      const jalaliParts = d2j(jdn);
      const gregParts = d2g(jdn);
      const dayDow = getWeekday(jdn);
      const isWeekend = isJalali ? dayDow === 5 : dayDow === 0 || dayDow === 6;
      const events = getEventsForJdn(jdn);
      const hasHoliday = events.some((e) => e.isHoliday);
      const hasNotes = datesWithNotes.has(jdn);
      const notes = loadCalendarNotes(jdn);
      const isToday = jdn === todayJdn;
      const isSelected = jdn === selectedJdn;

      days.push({
        jdn,
        dow: dayDow,
        weekdayNameFa: FA_WEEKDAY_NAMES[dayDow],
        weekdayNameEn: EN_WEEKDAY_NAMES[dayDow],
        primaryNum: isJalali ? jalaliParts.d : gregParts.d,
        secondaryNum: isJalali ? gregParts.d : jalaliParts.d,
        monthName: isJalali ? JALALI_MONTH_NAMES[jalaliParts.m - 1] : GREGORIAN_MONTH_NAMES[gregParts.m - 1],
        isWeekend,
        events,
        hasHoliday,
        hasNotes,
        notes,
        isToday,
        isSelected,
      });
    }
    return days;
  }, [calendarSystem, selectedJdn, todayJdn, datesWithNotes]);

  // Annual View 12 Months data
  const annualMonthsData = useMemo(() => {
    const isJalali = calendarSystem === 'jalali';
    const months = [];

    for (let m = 1; m <= 12; m++) {
      const mStartJdn = isJalali ? j2d(viewYear, m, 1) : g2d(viewYear, m, 1);
      const mLen = isJalali ? jalaliMonthLength(viewYear, m) : gregorianMonthLength(viewYear, m);
      const weekStartOffset = isJalali ? 6 : 1;
      const firstDow = getWeekday(mStartJdn);
      const lead = ((firstDow - weekStartOffset) % 7 + 7) % 7;
      const firstCell = mStartJdn - lead;

      const isCurrentMonthThisYear =
        todayJdn >= mStartJdn && todayJdn < mStartJdn + mLen;

      let holidayCount = 0;
      const days = [];
      for (let d = 0; d < 35; d++) {
        const jdn = firstCell + d;
        const p = isJalali ? d2j(jdn) : d2g(jdn);
        const inMonth = p.m === m && p.y === viewYear;
        const ev = getEventsForJdn(jdn);
        const isHol = ev.some((e) => e.isHoliday);
        if (inMonth && isHol) holidayCount++;

        days.push({
          jdn,
          dayNum: p.d,
          inMonth,
          isToday: jdn === todayJdn,
          isSelected: jdn === selectedJdn,
          isHol,
          hasNotes: datesWithNotes.has(jdn),
        });
      }

      months.push({
        monthIndex: m,
        nameFa: JALALI_MONTH_NAMES[m - 1],
        nameEn: GREGORIAN_MONTH_NAMES[m - 1],
        daysLength: mLen,
        isCurrentMonthThisYear,
        holidayCount,
        days,
      });
    }

    return months;
  }, [calendarSystem, viewYear, todayJdn, selectedJdn, datesWithNotes]);

  // Open Planner Page for Selected Date
  const handleOpenSelectedDateInPlanner = (specificJdn?: number) => {
    sound.playAdd();
    const targetJdn = specificJdn || selectedJdn;
    const dateKey = jdnToJalaliDateKey(targetJdn);
    if (onOpenJournalDate) {
      onOpenJournalDate(dateKey);
    }
  };

  const isJalali = calendarSystem === 'jalali';
  const shortHeaders = isJalali ? SHORT_FA_WEEKDAYS : SHORT_EN_WEEKDAYS;
  const fullHeaders = isJalali ? FULL_FA_WEEKDAYS : FULL_EN_WEEKDAYS;
  const currentZodiac = ZODIAC_MAP[isJalali ? viewMonth : (viewMonth + 9) % 12 || 12] || ZODIAC_MAP[1];

  return (
    <div
      className="relative min-h-screen w-full bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 flex flex-col overflow-x-hidden selection:bg-stone-200 selection:text-stone-900 dark:selection:bg-stone-800 dark:selection:text-stone-100 transition-colors"
      dir={isJalali ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isJalali
          ? "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
          : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1360px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-5 sm:gap-6">
        
        {/* =========================================================
            1. MINIMAL ARCHIVAL HEADER
           ========================================================= */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 shadow-2xs transition-colors">
          {/* Back & Clean Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 transition-all text-xs font-semibold cursor-pointer active:scale-95 group"
            >
              <ArrowRight
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>بازگشت</span>
            </button>

            <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight">گاه‌شمار و تقویم مدار</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 font-medium">
                {isJalali ? 'خورشیدی' : 'میلادی'}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-normal hidden sm:inline" title={`برج ${currentZodiac.zodiacSign}`}>
                · {currentZodiac.symbol} {currentZodiac.persianName}
              </span>
            </div>
          </div>

          {/* Unified Controls: System & View Switchers */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* System Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800/80">
              <button
                type="button"
                onClick={() => handleSwitchSystem('jalali')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  calendarSystem === 'jalali'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                شمسی
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSystem('gregorian')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  calendarSystem === 'gregorian'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                میلادی
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800/80">
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('month');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <CalendarDays size={13} />
                <span>ماهانه</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('week');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Columns size={13} />
                <span>هفتگی</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('year');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Layers size={13} />
                <span>سالانه</span>
              </button>
            </div>
          </div>

          {/* Today Button & Clean Clock */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleWarpToToday}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <CalendarIcon size={13} />
              <span>امروز</span>
            </button>
            <div className="hidden sm:block font-mono text-xs text-stone-500 dark:text-stone-400 pl-1 tracking-wider">
              {currentTime}
            </div>
          </div>
        </header>

        {/* =========================================================
            2. MAIN CALENDAR GRID & DAY INSPECTOR
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Calendar Section (8 cols on desktop) */}
          <main className="lg:col-span-8 flex flex-col gap-6">
            
            {/* ----------------- VIEW 1: MONTH VIEW ----------------- */}
            {viewMode === 'month' && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col transition-colors">
                {/* Month Title & Nav */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/70">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-2">
                      <span className="font-bold">
                        {isJalali ? JALALI_MONTH_NAMES[viewMonth - 1] : GREGORIAN_MONTH_NAMES[viewMonth - 1]}
                      </span>
                      <span className="font-mono text-stone-600 dark:text-stone-400 text-lg font-normal">
                        {isJalali ? toPersianDigits(viewYear) : viewYear}
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-mono">
                      {secondaryMonthRangeStr}
                    </p>
                  </div>

                  {/* Nav Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="ماه قبل"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="ماه بعد"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Weekday Row */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 my-3 text-center">
                  {fullHeaders.map((dayLabel, idx) => {
                    const isWe = isJalali ? idx === 6 : idx === 5 || idx === 6;
                    return (
                      <span
                        key={idx}
                        className={`text-xs font-semibold py-1 select-none ${
                          isWe ? 'text-rose-600/80 dark:text-rose-400/80' : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        <span className="hidden sm:inline">{dayLabel}</span>
                        <span className="sm:hidden">{shortHeaders[idx]}</span>
                      </span>
                    );
                  })}
                </div>

                {/* 42-day Clean Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {monthGridDays.map((cell) => {
                    return (
                      <button
                        key={cell.jdn}
                        type="button"
                        onClick={() => handleSelectDay(cell.jdn)}
                        className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2 min-h-[64px] sm:min-h-[76px] rounded-xl sm:rounded-2xl transition-all duration-150 cursor-pointer text-center select-none ${
                          cell.isSelected
                            ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold border-stone-900 dark:border-stone-100 shadow-2xs ring-2 ring-stone-900 dark:ring-stone-100 z-10'
                            : cell.isToday
                            ? 'bg-stone-100/90 dark:bg-stone-800/90 border border-stone-400 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-bold'
                            : cell.isCurrentMonth
                            ? 'bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800/70 text-stone-800 dark:text-stone-200'
                            : 'bg-transparent border border-transparent opacity-25 hover:opacity-50 text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        {/* Status Dot Top Row */}
                        <div className="w-full flex items-center justify-between px-1 h-2.5">
                          {cell.hasHoliday ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className="w-1.5 h-1.5 rounded-full bg-amber-500"
                            />
                          ) : cell.events.length > 0 ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className={`w-1.5 h-1.5 rounded-full ${cell.isSelected ? 'bg-stone-300 dark:bg-stone-600' : 'bg-stone-400 dark:bg-stone-500'}`}
                            />
                          ) : (
                            <span />
                          )}

                          {cell.sticker ? (
                            <span className="text-[10px] leading-none" title={cell.sticker.title}>
                              {cell.sticker.emoji}
                            </span>
                          ) : cell.hasNotes ? (
                            <span
                              title="دارای یادداشت"
                              className={`w-1.5 h-1.5 rounded-full ${cell.isSelected ? 'bg-amber-300' : 'bg-[#c2593f]'}`}
                            />
                          ) : (
                            <span />
                          )}
                        </div>

                        {/* Primary Date Number */}
                        <div className="relative my-auto">
                          <span
                            className={`text-base sm:text-lg tabular-nums ${
                              cell.isSelected
                                ? 'font-bold text-stone-50 dark:text-stone-900'
                                : cell.isToday
                                ? 'font-bold text-stone-900 dark:text-stone-100'
                                : cell.hasHoliday
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : cell.isWeekend
                                ? 'text-rose-600/90 dark:text-rose-400/90 font-normal'
                                : 'text-stone-800 dark:text-stone-200 font-normal'
                            }`}
                          >
                            {isJalali ? toPersianDigits(cell.primaryNum) : cell.primaryNum}
                          </span>
                          {cell.isToday && !cell.isSelected && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c2593f]" />
                          )}
                        </div>

                        {/* Secondary Date Number */}
                        <div className="text-[10px] font-mono leading-none">
                          {cell.secondaryMonthName ? (
                            <span className={cell.isSelected ? 'text-stone-300 dark:text-stone-700 font-medium' : 'text-stone-600 dark:text-stone-400 font-medium'}>
                              {cell.secondaryMonthName} {isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}
                            </span>
                          ) : (
                            <span className={cell.isSelected ? 'text-stone-400 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'}>
                              {isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Minimal Legend */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/70 text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c2593f]" />
                      <span>امروز</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>رویداد یا تعطیل</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-700 dark:bg-stone-300" />
                      <span>یادداشت‌ها</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 hidden sm:block">
                    کلید <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 font-sans">T</kbd> امروز · <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 font-sans">C</kbd> تغییر تقویم
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- VIEW 2: WEEK VIEW ----------------- */}
            {viewMode === 'week' && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col gap-4 transition-colors">
                {/* Week Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/70">
                  <div>
                    <h2 className="text-xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-2">
                      <span className="font-bold">نمای هفتگی</span>
                      <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                        ({isJalali ? toPersianDigits(weekDays[0].primaryNum) : weekDays[0].primaryNum} تا {isJalali ? toPersianDigits(weekDays[6].primaryNum) : weekDays[6].primaryNum} {weekDays[0].monthName})
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      title="هفته قبل"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-3 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                    >
                      این هفته
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      title="هفته بعد"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* 7 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
                  {weekDays.map((day) => (
                    <div
                      key={day.jdn}
                      onClick={() => handleSelectDay(day.jdn)}
                      className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                        day.isSelected
                          ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold border-stone-900 dark:border-stone-100 shadow-2xs ring-2 ring-stone-900 dark:ring-stone-100'
                          : day.isToday
                          ? 'bg-stone-100/90 dark:bg-stone-800/90 border border-stone-400 dark:border-stone-600'
                          : 'bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 border-stone-200/70 dark:border-stone-800/70'
                      }`}
                    >
                      <div>
                        {/* Day & Date Header */}
                        <div className={`flex items-center justify-between pb-1.5 border-b ${day.isSelected ? 'border-stone-700 dark:border-stone-200' : 'border-stone-200/60 dark:border-stone-800/60'}`}>
                          <span
                            className={`text-xs font-semibold ${
                              day.isSelected
                                ? 'text-stone-300 dark:text-stone-700'
                                : day.isWeekend
                                ? 'text-rose-600/80 dark:text-rose-400/80'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {isJalali ? day.weekdayNameFa : day.weekdayNameEn}
                          </span>
                          {day.isToday && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${day.isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'}`}>
                              امروز
                            </span>
                          )}
                        </div>

                        <div className="my-2 flex items-baseline gap-1.5">
                          <span
                            className={`text-xl font-bold tabular-nums ${
                              day.isSelected
                                ? 'text-stone-50 dark:text-stone-900'
                                : day.isToday
                                ? 'text-stone-900 dark:text-stone-100'
                                : day.hasHoliday
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {isJalali ? toPersianDigits(day.primaryNum) : day.primaryNum}
                          </span>
                          <span className={`text-[10px] font-mono ${day.isSelected ? 'text-stone-400 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'}`}>
                            {isJalali ? day.secondaryNum : toPersianDigits(day.secondaryNum)}
                          </span>
                        </div>

                        {/* Holiday or Event Tag */}
                        {day.events.length > 0 && (
                          <div className="mb-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded line-clamp-1 block ${
                                day.hasHoliday
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium'
                                  : day.isSelected
                                  ? 'bg-stone-800 dark:bg-stone-200 text-stone-200 dark:text-stone-800'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60'
                              }`}
                              title={day.events.map((e) => e.fa).join(' | ')}
                            >
                              ★ {day.events[0].fa}
                            </span>
                          </div>
                        )}

                        {/* Tasks Count */}
                        <div className={`text-[10px] ${day.isSelected ? 'text-stone-300 dark:text-stone-700' : 'text-stone-500'}`}>
                          {day.notes.length > 0 ? (
                            <span className="font-medium">
                              {toPersianDigits(day.notes.filter((n) => n.done).length)}/{toPersianDigits(day.notes.length)} وظیفه
                            </span>
                          ) : (
                            <span>بدون وظیفه</span>
                          )}
                        </div>
                      </div>

                      {/* Direct Planner Link */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSelectedDateInPlanner(day.jdn);
                        }}
                        className={`mt-2 w-full py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                          day.isSelected
                            ? 'bg-stone-800 hover:bg-stone-700 text-stone-100 dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        پلنر روز ←
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- VIEW 3: YEAR VIEW ----------------- */}
            {viewMode === 'year' && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col gap-5 transition-colors">
                {/* Year Header & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800/70">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-2">
                      <span className="font-bold">سال {isJalali ? toPersianDigits(viewYear) : viewYear}</span>
                      {yearStats.isLeap && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60">
                          کبیسه
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-mono">
                      روز {isJalali ? toPersianDigits(yearStats.dayOfYear) : yearStats.dayOfYear} از {isJalali ? toPersianDigits(yearStats.totalDays) : yearStats.totalDays} ({isJalali ? toPersianDigits(yearStats.pct) : yearStats.pct}٪ تکمیل شده)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      title="سال قبل"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-3 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                    >
                      امسال
                    </button>
                    <button
                      type="button"
                      onClick={handleNextYear}
                      title="سال بعد"
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Minimal Progress Line */}
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden border border-stone-200/60 dark:border-stone-700/60">
                  <div
                    className="h-full bg-stone-900 dark:bg-stone-100 rounded-full transition-all duration-500"
                    style={{ width: `${yearStats.pct}%` }}
                  />
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {annualMonthsData.map((mObj) => (
                    <div
                      key={mObj.monthIndex}
                      onClick={() => handleJumpToMonth(mObj.monthIndex)}
                      className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between group hover:border-stone-400 dark:hover:border-stone-600 ${
                        mObj.isCurrentMonthThisYear
                          ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-400 dark:border-stone-600'
                          : 'bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 border-stone-200/70 dark:border-stone-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60 dark:border-stone-800/60">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
                          {isJalali ? mObj.nameFa : mObj.nameEn}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {isJalali ? toPersianDigits(mObj.daysLength) : mObj.daysLength} روز
                        </span>
                      </div>

                      {/* Mini Grid */}
                      <div className="grid grid-cols-7 gap-0.5 text-center my-2">
                        {mObj.days.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className={`text-[9px] py-0.5 rounded transition-colors ${
                              !d.inMonth
                                ? 'opacity-10'
                                : d.isToday
                                ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold'
                                : d.isSelected
                                ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold'
                                : d.isHol
                                ? 'text-amber-600 dark:text-amber-400 font-medium'
                                : 'text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {d.inMonth ? (isJalali ? toPersianDigits(d.dayNum) : d.dayNum) : ''}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60 dark:border-stone-800/60 text-[10px] text-stone-500">
                        <span>{mObj.holidayCount > 0 ? `★ ${toPersianDigits(mObj.holidayCount)} رویداد` : 'عادی'}</span>
                        <span className="text-stone-700 dark:text-stone-300 group-hover:translate-x-0.5 transition-transform text-[10px] font-medium">
                          مشاهده ماه ←
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* =========================================================
              3. MINIMAL EDITORIAL DAY INSPECTOR (SIDEBAR)
             ========================================================= */}
          <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-6">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col gap-5 transition-colors">
              
              {/* Day Hero Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      {FA_WEEKDAY_NAMES[selectedWeekday]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700 font-medium">
                      {relativeDateText}
                    </span>
                  </div>

                  <h3 className="text-4xl sm:text-5xl font-extralight text-stone-900 dark:text-stone-100 tracking-tight mt-1 flex items-baseline gap-2">
                    <span className="font-bold">{isJalali ? toPersianDigits(selectedJalali.d) : selectedGregorian.d}</span>
                    <span className="text-lg font-normal text-stone-500 dark:text-stone-400">
                      {isJalali ? JALALI_MONTH_NAMES[selectedJalali.m - 1] : GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]}
                    </span>
                  </h3>

                  <div className="text-xs text-stone-400 font-mono mt-1">
                    {selectedGregorian.d} {GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]} {selectedGregorian.y}
                  </div>
                </div>

                {/* Minimal Moon Phase Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60"
                  title={`فاز ماه: ${selectedMoon.nameFa} (${Math.round(selectedMoon.illumination * 100)}% روشنایی)`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: getMoonSvg(selectedMoon.phase) }}
                    className="w-5 h-5 shrink-0"
                  />
                  <span className="text-[10px] font-mono text-stone-600 dark:text-stone-300 font-medium">
                    {toPersianDigits(Math.round(selectedMoon.illumination * 100))}٪
                  </span>
                </div>
              </div>

              {/* Day Mood Sticker Picker */}
              <DayMoodStickerPicker
                selectedJdn={selectedJdn}
                activeStickerId={stickers[selectedJdn]}
                onSelectSticker={handleSelectSticker}
              />

              {/* Toggleable Celestial Horizon and Constellation Section */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowCelestialWidgets(!showCelestialWidgets)}
                  className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 py-1 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>افق خورشیدی و صورت فلکی</span>
                  </span>
                  <span className="text-[10px] font-mono">{showCelestialWidgets ? '▲ بستن' : '▼ مشاهده'}</span>
                </button>
                {showCelestialWidgets && (
                  <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
                    <SolarDayArcWidget />
                    <ZodiacConstellationCard monthIndex={isJalali ? selectedJalali.m : selectedGregorian.m} />
                  </div>
                )}
              </div>

              {/* Day Events / Holidays */}
              {selectedEvents.length > 0 && (
                <div className="flex flex-col gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/70">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>مناسبت‌های این روز</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          ev.isHoliday
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
                            : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="font-medium truncate">{ev.fa}</span>
                        </div>
                        {ev.isHoliday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100 shrink-0">
                            تعطیل
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks / Notes Checklist */}
              <div className="flex flex-col gap-2.5 pt-1 border-t border-stone-100 dark:border-stone-800/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <span>یادداشت‌ها و کارهای این روز</span>
                    {dayNotes.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                        {toPersianDigits(dayNotes.length)}
                      </span>
                    )}
                  </span>
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="ثبت کار یا یادداشت سریع..."
                    className="flex-1 bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                  />
                  <button
                    type="submit"
                    title="افزودن"
                    className="w-7 h-7 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </form>

                {/* Task Checklist */}
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {dayNotes.length === 0 ? (
                    <p className="text-[11px] text-stone-400 text-center py-2.5 border border-dashed border-stone-200/80 dark:border-stone-800/80 rounded-xl">
                      یادداشتی برای این روز ثبت نشده است.
                    </p>
                  ) : (
                    dayNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`group flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                          note.done
                            ? 'bg-stone-50/60 dark:bg-stone-900/30 border-stone-200/40 dark:border-stone-800/40 text-stone-400 dark:text-stone-500 line-through'
                            : 'bg-white dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-800/70 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleNote(note.id)}
                          className={`w-4 h-4 rounded-[5px] border flex items-center justify-center ml-2 cursor-pointer transition-colors ${
                            note.done
                              ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900'
                              : 'border-stone-300 dark:border-stone-600 hover:border-stone-500'
                          }`}
                        >
                          {note.done && <Check size={11} strokeWidth={3} />}
                        </button>
                        <span className="flex-1 text-right break-all">{note.text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity cursor-pointer mr-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Primary Action Button: Open in Planner */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/70">
                <button
                  type="button"
                  onClick={() => handleOpenSelectedDateInPlanner()}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  <BookOpen size={14} />
                  <span>باز کردن این روز در پلنر روزانه</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
