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
import { ZODIAC_MAP } from './CalendarVisualWidgets';
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
        isToday,
        isSelected,
      });
    }

    return cells;
  }, [calendarSystem, viewYear, viewMonth, datesWithNotes, todayJdn, selectedJdn]);

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
      className="relative min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-200"
      dir={isJalali ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isJalali
          ? "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
          : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Subtle Atmospheric Gradient Backdrop */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_45%_at_50%_-15%,rgba(56,189,248,0.06),transparent_75%)]" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1360px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-5 sm:gap-6">
        
        {/* =========================================================
            1. MINIMAL ELEGANT HEADER
           ========================================================= */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-white/[0.06] backdrop-blur-xl shadow-lg">
          {/* Back & Clean Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer active:scale-95 group"
            >
              <ArrowRight
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>بازگشت</span>
            </button>

            <div className="h-4 w-[1px] bg-white/[0.08] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight">تقویم</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                {isJalali ? 'خورشیدی' : 'میلادی'}
              </span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline" title={`برج ${currentZodiac.zodiacSign}`}>
                · {currentZodiac.symbol} {currentZodiac.persianName}
              </span>
            </div>
          </div>

          {/* Unified Controls: System & View Switchers */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* System Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950/70 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleSwitchSystem('jalali')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  calendarSystem === 'jalali'
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                شمسی
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSystem('gregorian')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  calendarSystem === 'gregorian'
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                میلادی
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950/70 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('month');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white/10 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-white/10 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-white/10 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-xs font-medium transition-all cursor-pointer active:scale-95"
            >
              <CalendarIcon size={13} />
              <span>امروز</span>
            </button>
            <div className="hidden sm:block font-mono text-xs text-slate-400 pl-1 tracking-wider">
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
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/35 border border-white/[0.06] backdrop-blur-xl shadow-xl flex flex-col">
                {/* Month Title & Nav */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight flex items-baseline gap-2">
                      <span className="font-semibold">
                        {isJalali ? JALALI_MONTH_NAMES[viewMonth - 1] : GREGORIAN_MONTH_NAMES[viewMonth - 1]}
                      </span>
                      <span className="font-mono text-cyan-400 text-lg font-normal">
                        {isJalali ? toPersianDigits(viewYear) : viewYear}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {secondaryMonthRangeStr}
                    </p>
                  </div>

                  {/* Nav Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="ماه قبل"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="ماه بعد"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
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
                        className={`text-xs font-medium py-1 select-none ${
                          isWe ? 'text-rose-400/80' : 'text-slate-400'
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
                        className={`group relative flex flex-col items-center justify-between p-2 min-h-[64px] sm:min-h-[74px] rounded-2xl transition-all duration-150 cursor-pointer text-center select-none ${
                          cell.isSelected
                            ? 'bg-cyan-500/15 border border-cyan-400/80 text-white shadow-sm ring-1 ring-cyan-400/30 z-10'
                            : cell.isCurrentMonth
                            ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.09]'
                            : 'bg-transparent border border-transparent opacity-20 hover:opacity-40'
                        }`}
                      >
                        {/* Status Dot Top Row */}
                        <div className="w-full flex items-center justify-between px-1 h-2.5">
                          {cell.hasHoliday ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                            />
                          ) : cell.events.length > 0 ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400/80"
                            />
                          ) : (
                            <span />
                          )}

                          {cell.hasNotes && (
                            <span
                              title="دارای یادداشت"
                              className="w-1.5 h-1.5 rounded-full bg-cyan-300"
                            />
                          )}
                        </div>

                        {/* Primary Date Number */}
                        <div className="relative my-auto">
                          <span
                            className={`text-base sm:text-lg tabular-nums ${
                              cell.isToday
                                ? 'font-bold text-cyan-300'
                                : cell.hasHoliday
                                ? 'text-amber-300 font-medium'
                                : cell.isWeekend
                                ? 'text-rose-300/85 font-normal'
                                : 'text-slate-100 font-normal'
                            }`}
                          >
                            {isJalali ? toPersianDigits(cell.primaryNum) : cell.primaryNum}
                          </span>
                          {cell.isToday && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                          )}
                        </div>

                        {/* Secondary Date Number */}
                        <div className="text-[10px] font-mono leading-none">
                          {cell.secondaryMonthName ? (
                            <span className="text-cyan-400/80 font-medium">
                              {cell.secondaryMonthName} {isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}
                            </span>
                          ) : (
                            <span className="text-slate-500 group-hover:text-slate-400">
                              {isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Minimal Legend */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-white/[0.06] text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>امروز</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>رویداد یا تعطیل</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      <span>یادداشت‌ها</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
                    کلید <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">T</kbd> امروز · <kbd className="px-1 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">C</kbd> تغییر تقویم
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- VIEW 2: WEEK VIEW ----------------- */}
            {viewMode === 'week' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/35 border border-white/[0.06] backdrop-blur-xl shadow-xl flex flex-col gap-4">
                {/* Week Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-xl font-light text-white tracking-tight flex items-baseline gap-2">
                      <span className="font-semibold">نمای هفتگی</span>
                      <span className="text-xs font-mono text-cyan-400">
                        ({weekDays[0].primaryNum} تا {weekDays[6].primaryNum} {weekDays[0].monthName})
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      title="هفته قبل"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-2.5 h-8 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-all cursor-pointer"
                    >
                      این هفته
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      title="هفته بعد"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
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
                      className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                        day.isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/80 shadow-sm ring-1 ring-cyan-400/30'
                          : day.isToday
                          ? 'bg-white/[0.04] border-cyan-500/30'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.04] hover:border-white/[0.08]'
                      }`}
                    >
                      <div>
                        {/* Day & Date Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
                          <span
                            className={`text-xs font-medium ${
                              day.isWeekend ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            {isJalali ? day.weekdayNameFa : day.weekdayNameEn}
                          </span>
                          {day.isToday && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 font-semibold">
                              امروز
                            </span>
                          )}
                        </div>

                        <div className="my-2 flex items-baseline gap-1.5">
                          <span
                            className={`text-xl font-semibold tabular-nums ${
                              day.isToday
                                ? 'text-cyan-300'
                                : day.hasHoliday
                                ? 'text-amber-300'
                                : 'text-white'
                            }`}
                          >
                            {isJalali ? toPersianDigits(day.primaryNum) : day.primaryNum}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {isJalali ? day.secondaryNum : toPersianDigits(day.secondaryNum)}
                          </span>
                        </div>

                        {/* Holiday or Event Tag */}
                        {day.events.length > 0 && (
                          <div className="mb-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded line-clamp-1 block ${
                                day.hasHoliday
                                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium'
                                  : 'bg-white/[0.04] text-slate-300'
                              }`}
                              title={day.events.map((e) => e.fa).join(' | ')}
                            >
                              ★ {day.events[0].fa}
                            </span>
                          </div>
                        )}

                        {/* Tasks Count */}
                        <div className="text-[10px] text-slate-500">
                          {day.notes.length > 0 ? (
                            <span className="text-cyan-400">
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
                        className="mt-2 w-full py-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 text-[10px] font-medium transition-all"
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
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/35 border border-white/[0.06] backdrop-blur-xl shadow-xl flex flex-col gap-5">
                {/* Year Header & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight flex items-baseline gap-2">
                      <span className="font-semibold">سال {isJalali ? toPersianDigits(viewYear) : viewYear}</span>
                      {yearStats.isLeap && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          کبیسه
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      روز {isJalali ? toPersianDigits(yearStats.dayOfYear) : yearStats.dayOfYear} از {isJalali ? toPersianDigits(yearStats.totalDays) : yearStats.totalDays} ({isJalali ? toPersianDigits(yearStats.pct) : yearStats.pct}٪ تکمیل شده)
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      title="سال قبل"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-2.5 h-8 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-all cursor-pointer"
                    >
                      امسال
                    </button>
                    <button
                      type="button"
                      onClick={handleNextYear}
                      title="سال بعد"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={17} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Minimal Progress Line */}
                <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${yearStats.pct}%` }}
                  />
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {annualMonthsData.map((mObj) => (
                    <div
                      key={mObj.monthIndex}
                      onClick={() => handleJumpToMonth(mObj.monthIndex)}
                      className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between group hover:border-cyan-400/40 ${
                        mObj.isCurrentMonthThisYear
                          ? 'bg-white/[0.04] border-cyan-400/40'
                          : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {isJalali ? mObj.nameFa : mObj.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
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
                                ? 'bg-cyan-400 text-slate-950 font-bold'
                                : d.isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                                : d.isHol
                                ? 'text-amber-300 font-medium'
                                : 'text-slate-300'
                            }`}
                          >
                            {d.inMonth ? (isJalali ? toPersianDigits(d.dayNum) : d.dayNum) : ''}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.04] text-[10px] text-slate-500">
                        <span>{mObj.holidayCount > 0 ? `★ ${mObj.holidayCount} رویداد` : 'عادی'}</span>
                        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform text-[10px]">
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
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/35 border border-white/[0.06] backdrop-blur-xl shadow-xl flex flex-col gap-5">
              
              {/* Day Hero Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-400">
                      {FA_WEEKDAY_NAMES[selectedWeekday]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {relativeDateText}
                    </span>
                  </div>

                  <h3 className="text-4xl sm:text-5xl font-extralight text-white tracking-tight mt-1 flex items-baseline gap-2">
                    <span>{isJalali ? toPersianDigits(selectedJalali.d) : selectedGregorian.d}</span>
                    <span className="text-lg font-light text-slate-400">
                      {isJalali ? JALALI_MONTH_NAMES[selectedJalali.m - 1] : GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]}
                    </span>
                  </h3>

                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {selectedGregorian.d} {GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]} {selectedGregorian.y}
                  </div>
                </div>

                {/* Minimal Moon Phase Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  title={`فاز ماه: ${selectedMoon.nameFa} (${Math.round(selectedMoon.illumination * 100)}% روشنایی)`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: getMoonSvg(selectedMoon.phase) }}
                    className="w-5 h-5 shrink-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300">
                    {toPersianDigits(Math.round(selectedMoon.illumination * 100))}٪
                  </span>
                </div>
              </div>

              {/* Day Events / Holidays */}
              {selectedEvents.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>مناسبت‌های امروز</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          ev.isHoliday
                            ? 'bg-amber-500/10 border-amber-400/20 text-amber-200'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="font-medium truncate">{ev.fa}</span>
                        </div>
                        {ev.isHoliday && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                            تعطیل
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks / Notes Checklist */}
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span>یادداشت‌ها و کارها</span>
                    {dayNotes.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
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
                    className="flex-1 bg-slate-950/70 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="submit"
                    title="افزودن"
                    className="w-7 h-7 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </form>

                {/* Task Checklist */}
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {dayNotes.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-2.5 border border-dashed border-white/[0.06] rounded-xl">
                      یادداشتی برای این روز ثبت نشده است.
                    </p>
                  ) : (
                    dayNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`group flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                          note.done
                            ? 'bg-slate-950/30 border-white/[0.03] text-slate-500 line-through'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleNote(note.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ml-2 cursor-pointer transition-colors ${
                            note.done
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                              : 'border-slate-500 hover:border-cyan-400'
                          }`}
                        >
                          {note.done && <Check size={11} strokeWidth={3} />}
                        </button>
                        <span className="flex-1 text-right break-all">{note.text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer mr-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Primary Action Button: Open in Planner */}
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => handleOpenSelectedDateInPlanner()}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <BookOpen size={14} />
                  <span>باز کردن در پلنر روزانه</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
