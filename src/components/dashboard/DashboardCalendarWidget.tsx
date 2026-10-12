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
    <section className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-6 text-stone-900 dark:text-stone-100 shadow-2xs relative overflow-hidden transition-colors">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800/70 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0">
            <Orbit size={20} className="animate-[spin_24s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                گاه‌شمار و تقویم هوشمند مدار
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                خورشیدی · {toPersianDigits(todayJalali.y)}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
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
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95 group shrink-0"
        >
          <span>مشاهده تقویم کامل (ماهانه و سالانه)</span>
          <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* 7-Day Week Strip */}
      <div className="mt-4 pt-1 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>روزهای هفته جاری (انتخاب روز و ورود به پلنر)</span>
          </span>
          {todayEvents.length > 0 && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate max-w-[280px]">
              ★ {todayEvents[0].fa}
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {currentWeekDays.map((day) => (
            <button
              key={day.jdn}
              type="button"
              onClick={() => handleSelectDay(day.jdn)}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col items-center justify-between text-center select-none active:scale-95 ${
                day.isSelected
                  ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold border-stone-900 dark:border-stone-100 shadow-2xs z-10 scale-[1.02]'
                  : day.isToday
                  ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-400 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-bold'
                  : 'bg-stone-50/60 dark:bg-stone-900/40 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 border-stone-200/70 dark:border-stone-800/70 text-stone-800 dark:text-stone-200'
              }`}
            >
              <span
                className={`text-[10px] font-semibold truncate ${
                  day.isSelected
                    ? 'text-stone-300 dark:text-stone-700'
                    : day.isWeekend
                    ? 'text-rose-600/80 dark:text-rose-400/80'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {day.dayName.split(' ')[0]}
              </span>

              <div className="my-1 flex flex-col items-center">
                <span
                  className={`text-base sm:text-xl font-bold tabular-nums leading-tight ${
                    day.isSelected
                      ? 'text-stone-50 dark:text-stone-900'
                      : day.isToday
                      ? 'text-stone-900 dark:text-stone-100'
                      : day.hasHoliday
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {toPersianDigits(day.dayNum)}
                </span>
                <span
                  className={`text-[9px] font-mono ${
                    day.isSelected ? 'text-stone-400 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
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
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                ) : day.isToday ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-amber-400' : 'bg-[#c2593f]'}`} />
                ) : null}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Day Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/70 text-xs text-stone-500 dark:text-stone-400">
          <span>
            روز انتخاب‌شده:{' '}
            <strong className="text-stone-900 dark:text-stone-100 font-mono">
              {toPersianDigits(d2j(selectedJdn).d)} {JALALI_MONTH_NAMES[d2j(selectedJdn).m - 1]}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleOpenSelected}
            className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white font-semibold cursor-pointer transition-colors"
          >
            <BookOpen size={14} />
            <span>باز کردن این روز در پلنر روزانه ←</span>
          </button>
        </div>
      </div>
    </section>
  );
};
