import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Orbit,
  Moon as MoonIcon,
  Sun,
  Plus,
  Check,
  Trash2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Compass,
  CalendarDays,
  Clock,
  Layers,
} from 'lucide-react';
import { CelestialStarfield } from './CelestialStarfield';
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
  FA_WEEKDAY_HEADERS,
  EN_WEEKDAY_HEADERS,
  CalendarTaskNote,
  DayEvent,
} from '../../utils/celestialDateEngine';
import { sound } from '../../utils/audio';
import { Journal } from '../../types';

interface OrbitCalendarProps {
  onBackToApp: () => void;
  onOpenJournalDate?: (dateKey: string) => void;
  journals?: Journal[];
}

type CalendarSystem = 'jalali' | 'gregorian';
type CalendarViewMode = 'month' | 'year';

export const OrbitCalendar: React.FC<OrbitCalendarProps> = ({
  onBackToApp,
  onOpenJournalDate,
  journals = [],
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

  // View mode (ماهانه / سالانه)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Today JDN
  const todayJdn = useMemo(() => getTodayJdn(), []);

  // Selected JDN
  const [selectedJdn, setSelectedJdn] = useState<number>(todayJdn);

  // Current viewed Year & Month (in terms of active calendarSystem)
  const [viewYear, setViewYear] = useState<number>(() => {
    const todayParts = calendarSystem === 'jalali' ? d2j(todayJdn) : d2g(todayJdn);
    return todayParts.y;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const todayParts = calendarSystem === 'jalali' ? d2j(todayJdn) : d2g(todayJdn);
    return todayParts.m;
  });

  // Starfield warp effect trigger counter
  const [warpTrigger, setWarpTrigger] = useState(0);

  // Notes state for selected day
  const [dayNotes, setDayNotes] = useState<CalendarTaskNote[]>(() => loadCalendarNotes(todayJdn));
  const [newNoteInput, setNewNoteInput] = useState('');
  const [datesWithNotes, setDatesWithNotes] = useState<Set<number>>(() => getAllDatesWithNotes());

  // Live Clock state
  const [currentTime, setCurrentTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    secFraction: number;
    timezoneStr: string;
  }>({
    hours: '--',
    minutes: '--',
    seconds: '--',
    secFraction: 0,
    timezoneStr: 'UTC+03:30',
  });

  // Synchronize notes when selected day changes
  useEffect(() => {
    setDayNotes(loadCalendarNotes(selectedJdn));
  }, [selectedJdn]);

  // Live Clock tick
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const frac = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;

      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const offH = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
      const offM = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

      setCurrentTime({
        hours: h,
        minutes: m,
        seconds: s,
        secFraction: frac,
        timezoneStr: `${tzName.split('/').pop()?.replace(/_/g, ' ') || 'Local'} · UTC${sign}${offH}:${offM}`,
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save calendar system preference
  const handleSwitchSystem = (system: CalendarSystem) => {
    if (system === calendarSystem) return;
    sound.playTick(true);
    setWarpTrigger((prev) => prev + 1);

    // Synchronize viewYear and viewMonth to the selected day in new system
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
    setWarpTrigger((prev) => prev + 1);
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

  // Year navigation
  const handlePrevYear = () => {
    sound.playTick(false);
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    sound.playTick(false);
    setViewYear((y) => y + 1);
  };

  // Jump from Annual View to a specific Month
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
    // If clicked day is in adjacent month, adjust view
    const p = calendarSystem === 'jalali' ? d2j(jdn) : d2g(jdn);
    if (p.y !== viewYear || p.m !== viewMonth) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  };

  // Task/Notes operations
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

  // Year Progress calculation for selected day
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

  // Days difference from today (امروز / فردا / دیروز / X روز دیگر)
  const relativeDaysDiff = selectedJdn - todayJdn;
  const relativeDateText = useMemo(() => {
    if (relativeDaysDiff === 0) return 'امروز (Current Stardate)';
    if (relativeDaysDiff === 1) return 'فردا (Tomorrow)';
    if (relativeDaysDiff === -1) return 'دیروز (Yesterday)';
    if (relativeDaysDiff > 0)
      return `${toPersianDigits(relativeDaysDiff)} روز دیگر (+${relativeDaysDiff}d)`;
    return `${toPersianDigits(Math.abs(relativeDaysDiff))} روز پیش (${relativeDaysDiff}d)`;
  }, [relativeDaysDiff]);

  // Build Monthly 42-day Grid
  const monthGridDays = useMemo(() => {
    const isJalali = calendarSystem === 'jalali';
    const monthStartJdn = isJalali
      ? j2d(viewYear, viewMonth, 1)
      : g2d(viewYear, viewMonth, 1);

    const monthLength = isJalali
      ? jalaliMonthLength(viewYear, viewMonth)
      : gregorianMonthLength(viewYear, viewMonth);

    // Week start: Saturday (6) for Jalali, Monday (1) for Gregorian
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
      // Weekend: Friday (5) for Jalali, Sat/Sun (6,0) for Gregorian
      const isWeekend = isJalali ? dow === 5 : dow === 0 || dow === 6;
      const events = getEventsForJdn(jdn);
      const hasHoliday = events.some((e) => e.isHoliday);
      const hasNotes = datesWithNotes.has(jdn);
      const isToday = jdn === todayJdn;
      const isSelected = jdn === selectedJdn;

      cells.push({
        jdn,
        primaryNum: isJalali ? jalaliParts.d : gregParts.d,
        secondaryNum: isJalali ? gregParts.d : jalaliParts.d,
        secondaryMonthName: isJalali
          ? gregParts.d === 1
            ? GREGORIAN_MONTH_NAMES[gregParts.m - 1].slice(0, 3)
            : ''
          : jalaliParts.d === 1
          ? JALALI_MONTH_NAMES[jalaliParts.m - 1]
          : '',
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

  // Secondary calendar date range for month title (e.g. March / April 2026)
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
        : `${m1} / ${m2} ${secEnd.y}`;
    } else {
      const m1 = JALALI_MONTH_NAMES[secStart.m - 1];
      const m2 = JALALI_MONTH_NAMES[secEnd.m - 1];
      return secStart.m === secEnd.m
        ? `${m1} ${toPersianDigits(secStart.y)}`
        : `${m1} / ${m2} ${toPersianDigits(secEnd.y)}`;
    }
  }, [calendarSystem, viewYear, viewMonth]);

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

      // Check if current month contains today
      const isCurrentMonthThisYear =
        todayJdn >= mStartJdn && todayJdn < mStartJdn + mLen;

      // Count holidays in this month
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
  const handleOpenSelectedDateInPlanner = () => {
    sound.playAdd();
    const dateKey = jdnToJalaliDateKey(selectedJdn);
    if (onOpenJournalDate) {
      onOpenJournalDate(dateKey);
    }
  };

  const isJalali = calendarSystem === 'jalali';
  const weekdayHeaders = isJalali ? FA_WEEKDAY_HEADERS : EN_WEEKDAY_HEADERS;

  return (
    <div
      className="relative min-h-screen w-full bg-[#080d1a] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200"
      dir={isJalali ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isJalali
          ? "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
          : "'Space Grotesk', 'Vazirmatn', sans-serif",
      }}
    >
      {/* Live Canvas Starfield Background with warp burst & parallax */}
      <CelestialStarfield warpTrigger={warpTrigger} />

      {/* Main Cosmic Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* =========================================================
            1. TOP COSMIC HUD BAR
           ========================================================= */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle cosmic reticle corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none" />

          {/* Brand & Return to App */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت به صفحه ژورنال‌ها"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm text-xs font-semibold group"
            >
              <ArrowRight
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>بازگشت به ژورنال‌ها</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-700/70 hidden sm:block" />

            {/* Orbit Celestial Badge */}
            <div className="flex items-center gap-3 select-none">
              <div className="relative w-8 h-8 rounded-full border border-cyan-400/60 flex items-center justify-center animate-[spin_16s_linear_infinite]">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_12px_#8b5cf6]" />
                <span className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>مدار</span>
                    <span className="text-cyan-400 font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/30">
                      ORBIT
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                  CELESTIAL DUAL CALENDAR
                </p>
              </div>
            </div>
          </div>

          {/* Center: System Switcher (شمسی / میلادی) & View Mode (ماه / سال) */}
          <div className="flex flex-wrap items-center gap-2.5 justify-center">
            {/* Calendar Switcher (Jalali vs Gregorian) */}
            <div
              className="flex items-center p-1 rounded-2xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-inner"
              role="group"
              aria-label="سیستم گاه‌شماری"
            >
              <button
                type="button"
                onClick={() => handleSwitchSystem('jalali')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  calendarSystem === 'jalali'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_14px_-2px_rgba(6,182,212,0.6)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                شمسی (خورشیدی)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSystem('gregorian')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  calendarSystem === 'gregorian'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_14px_-2px_rgba(6,182,212,0.6)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                میلادی (Gregorian)
              </button>
            </div>

            {/* View Mode Switcher (ماهانه / سالانه) */}
            <div
              className="flex items-center p-1 rounded-2xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-inner"
              role="group"
              aria-label="نمای تقویم"
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('month');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-400/50 shadow-[0_0_14px_-2px_rgba(139,92,246,0.6)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon size={14} />
                <span>نمای ماهانه</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('year');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-400/50 shadow-[0_0_14px_-2px_rgba(139,92,246,0.6)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>نمای سالانه (۱۲ ماه)</span>
              </button>
            </div>
          </div>

          {/* Right: Live Digital Clock & Seconds Orbit Bar */}
          <div className="flex flex-col items-end gap-1 font-mono min-w-[140px] text-right">
            <div className="flex items-baseline gap-1 text-white font-light text-xl sm:text-2xl tracking-wider">
              <span>{currentTime.hours}:{currentTime.minutes}</span>
              <span className="text-cyan-400 text-sm font-semibold">:{currentTime.seconds}</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${Math.round(currentTime.secFraction * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-sans">
              {currentTime.timezoneStr}
            </div>
          </div>
        </header>

        {/* =========================================================
            2. MAIN CONTENT LAYOUT (CALENDAR + DAY HUD)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Surface (8 columns on lg) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* VIEW MODE 1: MONTHLY VIEW */}
            {viewMode === 'month' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/50 border border-slate-700/60 backdrop-blur-xl shadow-2xl relative">
                {/* Month Navigation & Big Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-widest">
                      <span>{isJalali ? 'گاه‌شماری خورشیدی مدار' : 'GREGORIAN SOLAR ORBIT'}</span>
                      {yearStats.isLeap && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          سال کبیسه (Leap Year)
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-tight mt-1">
                      {isJalali ? JALALI_MONTH_NAMES[viewMonth - 1] : GREGORIAN_MONTH_NAMES[viewMonth - 1]}
                      <span className="font-mono font-normal text-cyan-300 text-2xl sm:text-3xl mr-3">
                        {isJalali ? toPersianDigits(viewYear) : viewYear}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {secondaryMonthRangeStr}
                    </p>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="ماه قبل (Previous Month)"
                      className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
                    >
                      <ChevronRight size={20} className={isJalali ? '' : 'rotate-180'} />
                    </button>

                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      title="پرش نوری به امروز (Warp to Today)"
                      className="flex items-center gap-2 px-3.5 h-10 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all duration-300 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.8)] active:scale-95 cursor-pointer group"
                    >
                      <Orbit size={16} className="transition-transform group-hover:rotate-180 duration-700" />
                      <span>امروز</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="ماه بعد (Next Month)"
                      className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
                    >
                      <ChevronLeft size={20} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 my-4 text-center">
                  {weekdayHeaders.map((dayLabel, idx) => {
                    const isWe = isJalali ? idx === 6 : idx === 5 || idx === 6;
                    return (
                      <span
                        key={idx}
                        className={`text-xs font-bold py-1.5 rounded-lg select-none ${
                          isWe
                            ? 'text-pink-400/90 font-black'
                            : 'text-slate-400'
                        }`}
                      >
                        {dayLabel}
                      </span>
                    );
                  })}
                </div>

                {/* 42 Days Calendar Matrix */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {monthGridDays.map((cell) => {
                    return (
                      <button
                        key={cell.jdn}
                        type="button"
                        onClick={() => handleSelectDay(cell.jdn)}
                        className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 min-h-[64px] sm:min-h-[78px] rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
                          cell.isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_24px_-4px_rgba(6,182,212,0.7)] scale-[1.03] z-10'
                            : cell.isCurrentMonth
                            ? 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 hover:border-slate-600'
                            : 'bg-slate-900/20 border-transparent opacity-35 hover:opacity-70'
                        }`}
                      >
                        {/* Event or Note Indicators */}
                        <div className="w-full flex items-center justify-between px-0.5">
                          {/* Event star */}
                          {cell.events.length > 0 ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className={`text-[10px] leading-none ${
                                cell.hasHoliday
                                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse'
                                  : 'text-cyan-300'
                              }`}
                            >
                              ★
                            </span>
                          ) : (
                            <span />
                          )}

                          {/* Note dot indicator */}
                          {cell.hasNotes && (
                            <span
                              title="دارای یادداشت یا وظیفه"
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
                            />
                          )}
                        </div>

                        {/* Main Date Display & Orbit Ring for Today */}
                        <div className="relative flex items-center justify-center">
                          {cell.isToday && (
                            <>
                              {/* Pulsing glow */}
                              <span className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
                              {/* Rotating planetary orbit */}
                              <span className="absolute -inset-1.5 rounded-full border border-dashed border-cyan-300 animate-[spin_8s_linear_infinite] pointer-events-none" />
                            </>
                          )}
                          <span
                            className={`text-base sm:text-xl font-light tabular-nums leading-none ${
                              cell.isToday
                                ? 'font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                                : cell.hasHoliday
                                ? 'text-amber-300 font-semibold'
                                : cell.isWeekend
                                ? 'text-pink-300'
                                : 'text-white'
                            }`}
                          >
                            {isJalali ? toPersianDigits(cell.primaryNum) : cell.primaryNum}
                          </span>
                        </div>

                        {/* Secondary Calendar Date */}
                        <div className="text-[10px] font-mono leading-none text-slate-400">
                          {cell.secondaryMonthName ? (
                            <span className="text-cyan-400 font-semibold">
                              {cell.secondaryMonthName} {isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}
                            </span>
                          ) : (
                            <span>{isJalali ? cell.secondaryNum : toPersianDigits(cell.secondaryNum)}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      <span>امروز</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400 text-sm">★</span>
                      <span>تعطیلات رسمی و رویدادهای فضایی</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      <span>دارای یادداشت / مأموریت</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                    کلیدها: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">T</kbd> امروز · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">C</kbd> تغییر تقویم
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: ANNUAL VIEW (12 MONTHS CELESTIAL OVERVIEW) */}
            {viewMode === 'year' && (
              <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/50 border border-slate-700/60 backdrop-blur-xl shadow-2xl relative flex flex-col gap-6">
                {/* Year Header & Nav */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold uppercase tracking-widest">
                      <span>نمای مداری سالانه (Annual 12-Month Cosmic View)</span>
                      {yearStats.isLeap && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          سال کبیسه (Leap Year)
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight mt-1 flex items-baseline gap-3">
                      <span>سال {isJalali ? toPersianDigits(viewYear) : viewYear}</span>
                      <span className="text-sm font-mono text-slate-400">
                        ({isJalali ? `${viewYear + 621} - ${viewYear + 622} میلادی` : `${viewYear - 622} - ${viewYear - 621} خورشیدی`})
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      title="سال قبل (Previous Year)"
                      className="px-3.5 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      <ChevronRight size={16} className={isJalali ? '' : 'rotate-180'} />
                      <span>سال قبل</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      title="بازگشت به امسال"
                      className="px-3.5 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-cyan-500/30 transition-all"
                    >
                      <Orbit size={16} />
                      <span>امسال</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextYear}
                      title="سال بعد (Next Year)"
                      className="px-3.5 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      <span>سال بعد</span>
                      <ChevronLeft size={16} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Year Progress Bar */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-cyan-400">پیشرفت مأموریت سالانه</span>
                    <span className="font-mono text-slate-300">
                      {isJalali ? toPersianDigits(yearStats.pct) : yearStats.pct}٪ تکمیل شده (روز {isJalali ? toPersianDigits(yearStats.dayOfYear) : yearStats.dayOfYear} از {isJalali ? toPersianDigits(yearStats.totalDays) : yearStats.totalDays})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-amber-300 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                      style={{ width: `${yearStats.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>آغاز سال: ۱ {isJalali ? JALALI_MONTH_NAMES[0] : GREGORIAN_MONTH_NAMES[0]}</span>
                    <span>{isJalali ? toPersianDigits(yearStats.daysLeft) : yearStats.daysLeft} روز تا تحویل سال نو</span>
                  </div>
                </div>

                {/* 12 Months Celestial Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {annualMonthsData.map((mObj) => {
                    return (
                      <div
                        key={mObj.monthIndex}
                        onClick={() => handleJumpToMonth(mObj.monthIndex)}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl ${
                          mObj.isCurrentMonthThisYear
                            ? 'bg-slate-800/60 border-cyan-400/60 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Month Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <div>
                            <span className="text-xs font-mono text-cyan-400 font-bold ml-1.5">
                              {isJalali ? toPersianDigits(mObj.monthIndex) : mObj.monthIndex}.
                            </span>
                            <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {isJalali ? mObj.nameFa : mObj.nameEn}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isJalali ? toPersianDigits(mObj.daysLength) : mObj.daysLength} روز
                          </span>
                        </div>

                        {/* Mini Month Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center my-1">
                          {weekdayHeaders.map((dh, i) => (
                            <span key={i} className="text-[9px] text-slate-400 font-bold">
                              {dh}
                            </span>
                          ))}
                          {mObj.days.map((d, dIdx) => (
                            <span
                              key={dIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToMonth(mObj.monthIndex, d.jdn);
                              }}
                              className={`text-[10px] py-0.5 rounded transition-colors ${
                                !d.inMonth
                                  ? 'opacity-10'
                                  : d.isToday
                                  ? 'bg-cyan-500 font-bold text-slate-950 shadow-[0_0_6px_#22d3ee]'
                                  : d.isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                                  : d.isHol
                                  ? 'text-amber-300 font-semibold'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                              }`}
                            >
                              {d.inMonth ? (isJalali ? toPersianDigits(d.dayNum) : d.dayNum) : ''}
                            </span>
                          ))}
                        </div>

                        {/* Footer info */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                          <span>
                            {mObj.holidayCount > 0 ? (
                              <span className="text-amber-300 flex items-center gap-1">
                                ★ {isJalali ? toPersianDigits(mObj.holidayCount) : mObj.holidayCount} مناسبت
                              </span>
                            ) : (
                              'عادی'
                            )}
                          </span>
                          <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                            مشاهده ماه ←
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* =========================================================
              3. DAY HUD / MISSION LOG (RIGHT COLUMN)
             ========================================================= */}
          <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-700/70 backdrop-blur-xl shadow-2xl relative flex flex-col gap-5 overflow-hidden">
              {/* Reticle HUD Corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none" />

              {/* HUD Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} />
                  <span>گزارش مأموریت روز (Mission Log)</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {relativeDateText}
                </span>
              </div>

              {/* Day Hero Title */}
              <div className="flex items-center gap-5">
                <span className="text-6xl sm:text-7xl font-extralight text-cyan-300 tracking-tighter tabular-nums drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                  {isJalali ? toPersianDigits(selectedJalali.d) : selectedGregorian.d}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {FA_WEEKDAY_NAMES[selectedWeekday]}
                  </h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    {JALALI_MONTH_NAMES[selectedJalali.m - 1]} {toPersianDigits(selectedJalali.y)}
                  </p>
                </div>
              </div>

              {/* Dual Date Box */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">تاریخ میلادی متناظر:</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedGregorian.d} {GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]} {selectedGregorian.y}
                  </span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] text-slate-400">روز سال:</span>
                  <span className="text-cyan-400 font-semibold">
                    {isJalali ? toPersianDigits(yearStats.dayOfYear) : yearStats.dayOfYear} / {isJalali ? toPersianDigits(yearStats.totalDays) : yearStats.totalDays}
                  </span>
                </div>
              </div>

              {/* Astronomical Moon Phase */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    dangerouslySetInnerHTML={{ __html: getMoonSvg(selectedMoon.phase) }}
                  />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                      فاز نجومی ماه (Lunar Phase)
                    </span>
                    <span className="text-xs font-bold text-amber-200">
                      {selectedMoon.nameFa}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {toPersianDigits(Math.round(selectedMoon.illumination * 100))}٪
                  </span>
                  <span className="text-[10px] text-slate-400 block">روشنایی</span>
                </div>
              </div>

              {/* Day Events & Holidays */}
              {selectedEvents.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>مناسبت‌ها و رویدادهای این روز:</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                          ev.isHoliday
                            ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <span className="text-amber-400 text-sm mt-0.5">★</span>
                        <div className="flex-1">
                          <p className="font-semibold leading-relaxed">{ev.fa}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ev.en}</p>
                        </div>
                        {ev.isHoliday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                            تعطیل رسمی
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Notes & Tasks */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>یادداشت‌ها و مأموریت‌ها</span>
                    {dayNotes.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        {toPersianDigits(dayNotes.length)}
                      </span>
                    )}
                  </span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="ثبت یادداشت یا وظیفه جدید برای این روز..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    title="افزودن"
                    className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Notes List */}
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {dayNotes.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-3 border border-dashed border-slate-800 rounded-xl">
                      هنوز یادداشتی برای این روز ثبت نشده است.
                    </p>
                  ) : (
                    dayNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`group flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                          note.done
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-200'
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
                          {note.done && <Check size={12} strokeWidth={3} />}
                        </button>
                        <span className="flex-1 text-right break-all">{note.text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity cursor-pointer mr-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Jump to Planner Action */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleOpenSelectedDateInPlanner}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all duration-200 active:scale-98 cursor-pointer"
                >
                  <BookOpen size={16} />
                  <span>باز کردن یا ایجاد برگه در پلنر برای این تاریخ</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
