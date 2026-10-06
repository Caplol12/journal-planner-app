import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Orbit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  BookOpen,
  Sun,
  Layers,
} from 'lucide-react';
import {
  getTodayJdn,
  d2j,
  d2g,
  getWeekday,
  getEventsForJdn,
  toPersianDigits,
  JALALI_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES,
  FA_WEEKDAY_NAMES,
  jdnToJalaliDateKey,
} from '../../utils/celestialDateEngine';
import {
  SolarDayArcWidget,
  ZodiacConstellationCard,
  loadStickersStorage,
  MOOD_STICKERS,
} from '../calendar/CalendarVisualWidgets';
import { sound } from '../../utils/audio';

interface DashboardCalendarWidgetProps {
  onOpenFullCalendar: () => void;
  onOpenDateInPlanner?: (dateKey: string) => void;
}

export const DashboardCalendarWidget: React.FC<DashboardCalendarWidgetProps> = ({
  onOpenFullCalendar,
  onOpenDateInPlanner,
}) => {
  const todayJdn = useMemo(() => getTodayJdn(), []);
  const [selectedJdn, setSelectedJdn] = useState<number>(todayJdn);

  const todayJalali = useMemo(() => d2j(todayJdn), [todayJdn]);
  const todayGregorian = useMemo(() => d2g(todayJdn), [todayJdn]);
  const todayWeekday = useMemo(() => getWeekday(todayJdn), [todayJdn]);
  const todayEvents = useMemo(() => getEventsForJdn(todayJdn), [todayJdn]);

  const stickers = useMemo(() => loadStickersStorage(), []);

  // Compute 7 days of current week (Saturday to Friday)
  const currentWeekDays = useMemo(() => {
    const dow = getWeekday(todayJdn);
    // Saturday is 6, offset from Saturday: (dow - 6 + 7) % 7
    const offset = ((dow - 6 + 7) % 7);
    const startJdn = todayJdn - offset;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const jdn = startJdn + i;
      const jParts = d2j(jdn);
      const gParts = d2g(jdn);
      const dayDow = getWeekday(jdn);
      const isWeekend = dayDow === 5; // Friday
      const isToday = jdn === todayJdn;
      const isSelected = jdn === selectedJdn;
      const evs = getEventsForJdn(jdn);
      const hasHoliday = evs.some((e) => e.isHoliday);
      const stkId = stickers[jdn];
      const stickerObj = stkId ? MOOD_STICKERS.find((s) => s.id === stkId) : undefined;

      days.push({
        jdn,
        dayName: FA_WEEKDAY_NAMES[dayDow],
        dayNum: jParts.d,
        gregNum: gParts.d,
        monthName: JALALI_MONTH_NAMES[jParts.m - 1],
        isWeekend,
        isToday,
        isSelected,
        hasHoliday,
        events: evs,
        sticker: stickerObj,
      });
    }
    return days;
  }, [todayJdn, selectedJdn, stickers]);

  const handleSelectDay = (jdn: number) => {
    sound.playTick(true);
    setSelectedJdn(jdn);
  };

  const handleOpenSelected = () => {
    sound.playAdd();
    const dateKey = jdnToJalaliDateKey(selectedJdn);
    if (onOpenDateInPlanner) {
      onOpenDateInPlanner(dateKey);
    } else {
      onOpenFullCalendar();
    }
  };

  return (
    <section className="w-full rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0b1329]/95 to-slate-950/95 border border-slate-700/60 p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Subtle Background Cosmic Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
            <Orbit size={20} className="animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                تقویم هوشمند مدار
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                خورشیدی · {toPersianDigits(todayJalali.y)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              امروز: {FA_WEEKDAY_NAMES[todayWeekday]}، {toPersianDigits(todayJalali.d)} {JALALI_MONTH_NAMES[todayJalali.m - 1]} ({todayGregorian.d} {GREGORIAN_MONTH_NAMES[todayGregorian.m - 1]} {todayGregorian.y})
            </p>
          </div>
        </div>

        {/* Action Button: Open Full 12-Month & Week Calendar */}
        <button
          type="button"
          onClick={() => {
            sound.playSwoosh();
            onOpenFullCalendar();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95 group shrink-0"
        >
          <span>مشاهده تقویم کامل (ماهانه و سالانه)</span>
          <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Visual Elements Grid (Solar Arc + Zodiac Constellation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 relative z-10">
        {/* Visual Element 1: Zodiac Constellation */}
        <ZodiacConstellationCard monthIndex={todayJalali.m} />

        {/* Visual Element 2: Solar Day Horizon Arc */}
        <SolarDayArcWidget />
      </div>

      {/* 7-Day Week Strip */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-400" />
            <span>روزهای هفته جاری (انتخاب روز و ورود به پلنر)</span>
          </span>
          {todayEvents.length > 0 && (
            <span className="text-[11px] text-amber-300 font-medium truncate max-w-[250px]">
              ★ {todayEvents[0].fa}
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {currentWeekDays.map((day) => (
            <button
              key={day.jdn}
              type="button"
              onClick={() => handleSelectDay(day.jdn)}
              className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between text-center select-none active:scale-95 ${
                day.isSelected
                  ? 'bg-cyan-500/25 ring-2 ring-cyan-400 text-white shadow-[0_0_20px_-3px_rgba(6,182,212,0.6)] z-10 scale-[1.03]'
                  : day.isToday
                  ? 'bg-slate-800/80 border-cyan-400/50 shadow-md'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80'
              }`}
            >
              <span
                className={`text-[10px] font-semibold truncate ${
                  day.isWeekend ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {day.dayName.split(' ')[0]}
              </span>

              <div className="my-1 flex flex-col items-center">
                <span
                  className={`text-lg sm:text-xl font-bold tabular-nums leading-tight ${
                    day.isToday
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                      : day.hasHoliday
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}
                >
                  {toPersianDigits(day.dayNum)}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {day.gregNum}
                </span>
              </div>

              {/* Day Badge / Sticker or Holiday Dot */}
              <div className="h-4 flex items-center justify-center">
                {day.sticker ? (
                  <span className="text-xs leading-none" title={day.sticker.title}>
                    {day.sticker.emoji}
                  </span>
                ) : day.hasHoliday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                ) : day.isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                ) : null}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Day Action Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
          <span>
            روز انتخاب‌شده:{' '}
            <strong className="text-white font-mono">
              {toPersianDigits(d2j(selectedJdn).d)} {JALALI_MONTH_NAMES[d2j(selectedJdn).m - 1]}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleOpenSelected}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer transition-colors"
          >
            <BookOpen size={14} />
            <span>باز کردن این روز در پلنر روزانه ←</span>
          </button>
        </div>
      </div>
    </section>
  );
};
