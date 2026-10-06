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
  Clock,
  Layers,
  CalendarDays,
  Columns,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { CelestialStarfield } from './CelestialStarfield';
import {
  SolarDayArcWidget,
  ZodiacConstellationCard,
  DayMoodStickerPicker,
  MOOD_STICKERS,
  loadStickersStorage,
  saveStickerStorage,
  ZODIAC_MAP,
} from './CalendarVisualWidgets';
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
} from '../../utils/celestialDateEngine';
import { sound } from '../../utils/audio';
import { Journal } from '../../types';

interface OrbitCalendarProps {
  onBackToApp: () => void;
  onOpenJournalDate?: (dateKey: string) => void;
  journals?: Journal[];
}

type CalendarSystem = 'jalali' | 'gregorian';
type CalendarViewMode = 'month' | 'week' | 'year';

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

  // View mode (ماهانه / هفتگی / سالانه)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Background Starfield toggle (ستاره‌ها یا تاریک مینیمال خالص)
  const [showStarfield, setShowStarfield] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('orbit_calendar_stars');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

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

  // Starfield warp effect trigger
  const [warpTrigger, setWarpTrigger] = useState(0);

  // Notes state for selected day
  const [dayNotes, setDayNotes] = useState<CalendarTaskNote[]>(() => loadCalendarNotes(todayJdn));
  const [newNoteInput, setNewNoteInput] = useState('');
  const [datesWithNotes, setDatesWithNotes] = useState<Set<number>>(() => getAllDatesWithNotes());

  // Day Mood / Sticker tags state
  const [dayStickers, setDayStickers] = useState<Record<number, string>>(() => loadStickersStorage());

  // Live Clock state
  const [currentTime, setCurrentTime] = useState<{
    timeStr: string;
    sec: string;
    dateSummary: string;
  }>({
    timeStr: '--:--',
    sec: '00',
    dateSummary: '',
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

      setCurrentTime({
        timeStr: `${h}:${m}`,
        sec: s,
        dateSummary: new Intl.DateTimeFormat('fa-IR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Switch Calendar System
  const handleSwitchSystem = (system: CalendarSystem) => {
    if (system === calendarSystem) return;
    sound.playTick(true);
    setWarpTrigger((prev) => prev + 1);

    const targetParts = system === 'jalali' ? d2j(selectedJdn) : d2g(selectedJdn);
    setCalendarSystem(system);
    setViewYear(targetParts.y);
    setViewMonth(targetParts.m);

    try {
      localStorage.setItem('orbit_calendar_system', system);
    } catch {}
  };

  const handleToggleStars = () => {
    const nextVal = !showStarfield;
    setShowStarfield(nextVal);
    sound.playTick(false);
    try {
      localStorage.setItem('orbit_calendar_stars', String(nextVal));
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

  // Week navigation (moves selectedJdn by 7 days)
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

  // Sticker Selection
  const handleSelectSticker = (stickerId: string | null) => {
    sound.playTick(true);
    const updated = saveStickerStorage(selectedJdn, stickerId);
    setDayStickers(updated);
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
      const stickerId = dayStickers[jdn];
      const stickerObj = stickerId ? MOOD_STICKERS.find((s) => s.id === stickerId) : undefined;

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
        sticker: stickerObj,
      });
    }

    return cells;
  }, [calendarSystem, viewYear, viewMonth, datesWithNotes, todayJdn, selectedJdn, dayStickers]);

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
        : `${m1} - ${m2} ${secEnd.y}`;
    } else {
      const m1 = JALALI_MONTH_NAMES[secStart.m - 1];
      const m2 = JALALI_MONTH_NAMES[secEnd.m - 1];
      return secStart.m === secEnd.m
        ? `${m1} ${toPersianDigits(secStart.y)}`
        : `${m1} - ${m2} ${toPersianDigits(secEnd.y)}`;
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
      const stickerId = dayStickers[jdn];
      const stickerObj = stickerId ? MOOD_STICKERS.find((s) => s.id === stickerId) : undefined;

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
        sticker: stickerObj,
      });
    }
    return days;
  }, [calendarSystem, selectedJdn, todayJdn, datesWithNotes, dayStickers]);

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
  const weekdayHeaders = isJalali ? FA_WEEKDAY_HEADERS : EN_WEEKDAY_HEADERS;
  const currentZodiac = ZODIAC_MAP[isJalali ? viewMonth : (viewMonth + 9) % 12 || 12] || ZODIAC_MAP[1];

  return (
    <div
      className="relative min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-500"
      dir={isJalali ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isJalali
          ? "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
          : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dynamic Starfield Background with subtle opacity */}
      {showStarfield && (
        <div className="opacity-70 transition-opacity duration-700 pointer-events-none">
          <CelestialStarfield warpTrigger={warpTrigger} />
        </div>
      )}

      {/* Subtle Ambient Background Gradient Lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,189,248,0.12),transparent_70%)]" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* =========================================================
            1. MINIMAL LUXURY GLASS HEADER
           ========================================================= */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl shadow-xl">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت به ژورنال‌ها"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer text-xs font-medium group"
            >
              <ArrowRight
                size={15}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>بازگشت</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>تقویم هوشمند</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                  {isJalali ? 'خورشیدی' : 'Gregorian'}
                </span>
                <span className="text-sm hidden sm:inline" title={`صورت فلکی ${currentZodiac.zodiacSign}`}>
                  {currentZodiac.symbol}
                </span>
              </h1>
            </div>
          </div>

          {/* Center: System & View Mode Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {/* Calendar System Switcher */}
            <div
              className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-inner"
              role="group"
            >
              <button
                type="button"
                onClick={() => handleSwitchSystem('jalali')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  calendarSystem === 'jalali'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                شمسی
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSystem('gregorian')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  calendarSystem === 'gregorian'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                میلادی
              </button>
            </div>

            {/* View Mode Switcher (ماهانه / هفتگی / سالانه) */}
            <div
              className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-inner"
              role="group"
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('month');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon size={13} />
                <span>ماهانه</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setViewMode('week');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={13} />
                <span>سالانه</span>
              </button>
            </div>

            {/* Stars toggle */}
            <button
              type="button"
              onClick={handleToggleStars}
              title={showStarfield ? 'حالت مینیمال خالص (خاموش کردن ستاره‌ها)' : 'فعال کردن ستاره‌های کیهانی'}
              className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/90 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className={showStarfield ? 'text-cyan-400' : 'text-slate-600'} />
            </button>
          </div>

          {/* Right: Minimal Live Clock */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleWarpToToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-cyan-300 text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <Orbit size={13} />
              <span>امروز</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 font-mono text-sm text-slate-300 pl-1">
              <span className="font-semibold text-white">{currentTime.timeStr}</span>
              <span className="text-[10px] text-cyan-400 font-normal">:{currentTime.sec}</span>
            </div>
          </div>
        </header>

        {/* =========================================================
            2. MAIN CONTENT GRID (CALENDAR VIEW + VISUAL DAY DIGEST)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Calendar Section (8 columns on desktop) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* VIEW MODE 1: MINIMAL MONTH VIEW */}
            {viewMode === 'month' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative">
                {/* Header with Title and Smooth Nav */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight flex items-baseline gap-2.5">
                      <span className="font-semibold">
                        {isJalali ? JALALI_MONTH_NAMES[viewMonth - 1] : GREGORIAN_MONTH_NAMES[viewMonth - 1]}
                      </span>
                      <span className="font-mono text-cyan-400 text-xl font-normal">
                        {isJalali ? toPersianDigits(viewYear) : viewYear}
                      </span>
                      <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                        {currentZodiac.zodiacSign} {currentZodiac.symbol}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {secondaryMonthRangeStr}
                    </p>
                  </div>

                  {/* Clean Nav Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="ماه قبل"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="ماه بعد"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-2 my-4 text-center">
                  {weekdayHeaders.map((dayLabel, idx) => {
                    const isWe = isJalali ? idx === 6 : idx === 5 || idx === 6;
                    return (
                      <span
                        key={idx}
                        className={`text-xs font-semibold py-1 select-none ${
                          isWe ? 'text-rose-400/90' : 'text-slate-400'
                        }`}
                      >
                        {dayLabel}
                      </span>
                    );
                  })}
                </div>

                {/* 42-day Month Grid with Minimalist Design & Visual Badges */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {monthGridDays.map((cell) => {
                    return (
                      <button
                        key={cell.jdn}
                        type="button"
                        onClick={() => handleSelectDay(cell.jdn)}
                        className={`group relative flex flex-col items-center justify-between p-2 min-h-[68px] sm:min-h-[76px] rounded-2xl transition-all duration-200 cursor-pointer text-center select-none ${
                          cell.isSelected
                            ? 'bg-cyan-500/20 ring-1.5 ring-cyan-400 text-white shadow-[0_0_20px_-3px_rgba(6,182,212,0.5)] z-10 scale-[1.02]'
                            : cell.isCurrentMonth
                            ? 'bg-slate-800/25 hover:bg-slate-800/70 border border-slate-800/60 hover:border-slate-700'
                            : 'bg-transparent border border-transparent opacity-25 hover:opacity-50'
                        }`}
                      >
                        {/* Status Dots and Mood Sticker at Top */}
                        <div className="w-full flex items-center justify-between px-1 h-3.5">
                          {cell.sticker ? (
                            <span
                              title={cell.sticker.title}
                              className="text-xs leading-none drop-shadow-xs"
                            >
                              {cell.sticker.emoji}
                            </span>
                          ) : cell.hasHoliday ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                            />
                          ) : cell.events.length > 0 ? (
                            <span
                              title={cell.events.map((e) => e.fa).join(' | ')}
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400/70"
                            />
                          ) : (
                            <span />
                          )}

                          {cell.hasNotes && (
                            <span
                              title="دارای یادداشت یا وظیفه"
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
                            />
                          )}
                        </div>

                        {/* Primary Date Number */}
                        <div className="relative my-auto">
                          <span
                            className={`text-base sm:text-lg tabular-nums transition-all ${
                              cell.isToday
                                ? 'font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                                : cell.hasHoliday
                                ? 'text-amber-300 font-semibold'
                                : cell.isWeekend
                                ? 'text-rose-300/90 font-medium'
                                : 'text-slate-100 font-light'
                            }`}
                          >
                            {isJalali ? toPersianDigits(cell.primaryNum) : cell.primaryNum}
                          </span>
                          {cell.isToday && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                        </div>

                        {/* Secondary Date */}
                        <div className="text-[10px] font-mono leading-none text-slate-400 mt-0.5">
                          {cell.secondaryMonthName ? (
                            <span className="text-cyan-400/80 font-medium">
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

                {/* Minimal Legend */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-5 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>امروز</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>مناسبت و تعطیلات</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-300" />
                      <span>یادداشت‌ها</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                    کلید <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">T</kbd> امروز · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">C</kbd> تغییر تقویم
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: MINIMAL WEEK VIEW */}
            {viewMode === 'week' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative flex flex-col gap-5">
                {/* Week Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-2xl font-light text-white tracking-tight flex items-baseline gap-2">
                      <span className="font-semibold">نمای هفتگی</span>
                      <span className="text-sm font-mono text-cyan-400">
                        ({weekDays[0].primaryNum} تا {weekDays[6].primaryNum} {weekDays[0].monthName})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      بررسی سریع روزهای هفته جاری و وظایف پیش رو
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      title="هفته قبل"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-3 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-semibold hover:bg-cyan-500/25 transition-all"
                    >
                      این هفته
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      title="هفته بعد"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* 7 Weekday Columns */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {weekDays.map((day) => (
                    <div
                      key={day.jdn}
                      onClick={() => handleSelectDay(day.jdn)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] ${
                        day.isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/80 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]'
                          : day.isToday
                          ? 'bg-slate-800/40 border-cyan-400/40'
                          : 'bg-slate-900/30 hover:bg-slate-800/30 border-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Day & Date Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <span
                            className={`text-xs font-semibold ${
                              day.isWeekend ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            {isJalali ? day.weekdayNameFa : day.weekdayNameEn}
                          </span>
                          <div className="flex items-center gap-1">
                            {day.sticker && (
                              <span className="text-sm" title={day.sticker.title}>
                                {day.sticker.emoji}
                              </span>
                            )}
                            {day.isToday && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold">
                                امروز
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="my-2.5 flex items-baseline gap-2">
                          <span
                            className={`text-2xl font-semibold tabular-nums ${
                              day.isToday
                                ? 'text-cyan-300'
                                : day.hasHoliday
                                ? 'text-amber-300'
                                : 'text-white'
                            }`}
                          >
                            {isJalali ? toPersianDigits(day.primaryNum) : day.primaryNum}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {isJalali ? day.secondaryNum : toPersianDigits(day.secondaryNum)}
                          </span>
                        </div>

                        {/* Holiday or Event Tag */}
                        {day.events.length > 0 && (
                          <div className="mb-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md line-clamp-1 block ${
                                day.hasHoliday
                                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                              title={day.events.map((e) => e.fa).join(' | ')}
                            >
                              ★ {day.events[0].fa}
                            </span>
                          </div>
                        )}

                        {/* Tasks Count */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          {day.notes.length > 0 ? (
                            <span className="text-cyan-300 font-medium">
                              {toPersianDigits(day.notes.filter((n) => n.done).length)} / {toPersianDigits(day.notes.length)} وظیفه
                            </span>
                          ) : (
                            <span className="text-slate-400">بدون وظیفه</span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Direct Planner Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSelectedDateInPlanner(day.jdn);
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-600/40 border border-slate-700/60 hover:border-cyan-400/50 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                      >
                        پلنر روز ←
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW MODE 3: MINIMAL YEAR VIEW */}
            {viewMode === 'year' && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative flex flex-col gap-6">
                {/* Year Header & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight flex items-baseline gap-2.5">
                      <span className="font-semibold">سال {isJalali ? toPersianDigits(viewYear) : viewYear}</span>
                      {yearStats.isLeap && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                          کبیسه
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      روز {isJalali ? toPersianDigits(yearStats.dayOfYear) : yearStats.dayOfYear} از {isJalali ? toPersianDigits(yearStats.totalDays) : yearStats.totalDays} ({isJalali ? toPersianDigits(yearStats.pct) : yearStats.pct}٪ تکمیل سال)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      title="سال قبل"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>

                    <button
                      type="button"
                      onClick={handleWarpToToday}
                      className="px-3 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-semibold hover:bg-cyan-500/25 transition-all"
                    >
                      امسال
                    </button>

                    <button
                      type="button"
                      onClick={handleNextYear}
                      title="سال بعد"
                      className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={18} className={isJalali ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </div>

                {/* Minimal Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${yearStats.pct}%` }}
                  />
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {annualMonthsData.map((mObj) => (
                    <div
                      key={mObj.monthIndex}
                      onClick={() => handleJumpToMonth(mObj.monthIndex)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:border-cyan-400/50 ${
                        mObj.isCurrentMonthThisYear
                          ? 'bg-slate-800/40 border-cyan-400/50 shadow-md'
                          : 'bg-slate-900/20 hover:bg-slate-800/30 border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {isJalali ? mObj.nameFa : mObj.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isJalali ? toPersianDigits(mObj.daysLength) : mObj.daysLength} روز
                        </span>
                      </div>

                      {/* Mini Month Matrix */}
                      <div className="grid grid-cols-7 gap-1 text-center my-2.5">
                        {weekdayHeaders.map((dh, i) => (
                          <span key={i} className="text-[8px] text-slate-400 font-semibold">
                            {dh}
                          </span>
                        ))}
                        {mObj.days.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className={`text-[9px] py-0.5 rounded transition-colors ${
                              !d.inMonth
                                ? 'opacity-10'
                                : d.isToday
                                ? 'bg-cyan-400 font-bold text-slate-950'
                                : d.isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                                : d.isHol
                                ? 'text-amber-300 font-medium'
                                : 'text-slate-300'
                            }`}
                          >
                            {d.inMonth ? (isJalali ? toPersianDigits(d.dayNum) : d.dayNum) : ''}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <span>{mObj.holidayCount > 0 ? `★ ${mObj.holidayCount} رویداد` : 'عادی'}</span>
                        <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                          انتخاب ماه ←
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* =========================================================
              3. VISUAL DAY DIGEST & CELESTIAL WIDGETS (SIDEBAR)
             ========================================================= */}
          <aside className="lg:col-span-4 flex flex-col gap-5 sticky top-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative flex flex-col gap-4">
              {/* Day Header Card */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-400">
                      {FA_WEEKDAY_NAMES[selectedWeekday]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                      {relativeDateText}
                    </span>
                  </div>

                  <h3 className="text-4xl sm:text-5xl font-extralight text-white tracking-tight mt-1 flex items-baseline gap-2">
                    <span>{isJalali ? toPersianDigits(selectedJalali.d) : selectedGregorian.d}</span>
                    <span className="text-lg font-light text-slate-400">
                      {isJalali ? JALALI_MONTH_NAMES[selectedJalali.m - 1] : GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]}
                    </span>
                  </h3>
                </div>

                {/* Moon Phase Minimal Chip */}
                <div
                  className="flex flex-col items-center p-2 rounded-2xl bg-slate-950/60 border border-slate-800"
                  title={`فاز ماه: ${selectedMoon.nameFa} (${Math.round(selectedMoon.illumination * 100)}% روشنایی)`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: getMoonSvg(selectedMoon.phase) }}
                    className="w-7 h-7"
                  />
                  <span className="text-[9px] font-mono text-amber-200 mt-1">
                    {toPersianDigits(Math.round(selectedMoon.illumination * 100))}٪
                  </span>
                </div>
              </div>

              {/* Gregorian Equivalent date */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
                <span>معادل میلادی:</span>
                <span className="text-slate-200 font-medium">
                  {selectedGregorian.d} {GREGORIAN_MONTH_NAMES[selectedGregorian.m - 1]} {selectedGregorian.y}
                </span>
              </div>

              {/* VISUAL ELEMENT 1: ZODIAC CONSTELLATION CARD */}
              <ZodiacConstellationCard monthIndex={isJalali ? selectedJalali.m : (selectedGregorian.m + 9) % 12 || 12} />

              {/* VISUAL ELEMENT 2: SOLAR DAY HORIZON ARC WIDGET */}
              <SolarDayArcWidget />

              {/* VISUAL ELEMENT 3: DAY MOOD / STICKER PICKER */}
              <DayMoodStickerPicker
                selectedJdn={selectedJdn}
                activeStickerId={dayStickers[selectedJdn]}
                onSelectSticker={handleSelectSticker}
              />

              {/* Day Events & Holidays */}
              {selectedEvents.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>مناسبت‌ها و رویدادهای این روز</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvents.map((ev, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                          ev.isHoliday
                            ? 'bg-amber-500/10 border-amber-400/30 text-amber-200'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <span className="text-amber-400 text-sm leading-none mt-0.5">★</span>
                        <div className="flex-1">
                          <p className="font-medium leading-relaxed">{ev.fa}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ev.en}</p>
                        </div>
                        {ev.isHoliday && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                            تعطیل
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks / Notes for the Selected Day */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>یادداشت‌ها و مأموریت‌ها</span>
                    {dayNotes.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
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
                    placeholder="ثبت کار یا یادداشت سریع..."
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="submit"
                    title="افزودن"
                    className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={15} />
                  </button>
                </form>

                {/* Task Checklist */}
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {dayNotes.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2.5 border border-dashed border-slate-800/80 rounded-xl">
                      هنوز یادداشتی برای این روز ثبت نشده است.
                    </p>
                  ) : (
                    dayNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`group flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                          note.done
                            ? 'bg-slate-950/30 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-800/30 border-slate-700/60 text-slate-200'
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer mr-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Primary Action Button: Open or Create Day in Planner */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenSelectedDateInPlanner()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all duration-200 active:scale-98 cursor-pointer"
                >
                  <BookOpen size={15} />
                  <span>باز کردن برگه در پلنر</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
