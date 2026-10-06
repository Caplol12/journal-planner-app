import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Orbit,
  X,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  g2d,
  d2g,
  d2j,
  j2d,
  getTodayJdn,
  jalaliMonthLength,
  getWeekday,
  getEventsForJdn,
  toPersianDigits,
  JALALI_MONTH_NAMES,
  FA_WEEKDAY_HEADERS,
} from '../../utils/celestialDateEngine';
import { ZODIAC_MAP, loadStickersStorage, MOOD_STICKERS } from './CalendarVisualWidgets';
import { sound } from '../../utils/audio';

interface PlannerMiniCalendarPopoverProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  onOpenFullCalendar?: () => void;
}

export const PlannerMiniCalendarPopover: React.FC<PlannerMiniCalendarPopoverProps> = ({
  currentDate,
  onSelectDate,
  onClose,
  onOpenFullCalendar,
}) => {
  const currentJdn = useMemo(() => {
    return g2d(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  }, [currentDate]);

  const currentJalaliParts = useMemo(() => d2j(currentJdn), [currentJdn]);

  const [viewYear, setViewYear] = useState<number>(currentJalaliParts.y);
  const [viewMonth, setViewMonth] = useState<number>(currentJalaliParts.m);

  const todayJdn = useMemo(() => getTodayJdn(), []);
  const stickers = useMemo(() => loadStickersStorage(), []);

  // 42-day Grid for viewYear & viewMonth
  const cells = useMemo(() => {
    const monthStartJdn = j2d(viewYear, viewMonth, 1);
    const firstDayDow = getWeekday(monthStartJdn);
    // Saturday is 6, leading offset: (firstDayDow - 6 + 7) % 7
    const leading = ((firstDayDow - 6 + 7) % 7);
    const firstCell = monthStartJdn - leading;

    const res = [];
    for (let i = 0; i < 42; i++) {
      const jdn = firstCell + i;
      const jParts = d2j(jdn);
      const isCurrentMonth = jParts.m === viewMonth;
      const dow = getWeekday(jdn);
      const isWeekend = dow === 5;
      const evs = getEventsForJdn(jdn);
      const hasHoliday = evs.some((e) => e.isHoliday);
      const isToday = jdn === todayJdn;
      const isSelected = jdn === currentJdn;
      const stkId = stickers[jdn];
      const stickerObj = stkId ? MOOD_STICKERS.find((s) => s.id === stkId) : undefined;

      res.push({
        jdn,
        dayNum: jParts.d,
        isCurrentMonth,
        isWeekend,
        hasHoliday,
        isToday,
        isSelected,
        events: evs,
        sticker: stickerObj,
      });
    }
    return res;
  }, [viewYear, viewMonth, todayJdn, currentJdn, stickers]);

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

  const handleCellClick = (jdn: number) => {
    sound.playTick(true);
    const gregParts = d2g(jdn);
    const targetDate = new Date(gregParts.y, gregParts.m - 1, gregParts.d);
    onSelectDate(targetDate);
    onClose();
  };

  const zodiac = ZODIAC_MAP[viewMonth] || ZODIAC_MAP[1];

  return (
    <div
      dir="rtl"
      className="absolute top-full mt-3 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-0 z-50 w-80 sm:w-88 rounded-3xl bg-slate-950/95 border border-slate-700/80 p-4 text-white shadow-2xl backdrop-blur-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-cyan-400" />
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{JALALI_MONTH_NAMES[viewMonth - 1]}</span>
            <span className="font-mono text-cyan-300 font-semibold">{toPersianDigits(viewYear)}</span>
            <span className="text-xs text-slate-400" title={`صورت فلکی ${zodiac.zodiacSign}`}>
              {zodiac.symbol}
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="ماه قبل"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="ماه بعد"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer mr-1"
            title="بستن"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {FA_WEEKDAY_HEADERS.map((h, i) => (
          <span
            key={i}
            className={`text-[10px] font-semibold py-0.5 ${i === 6 ? 'text-rose-400' : 'text-slate-400'}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* 42 Days Matrix */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => (
          <button
            key={c.jdn}
            type="button"
            onClick={() => handleCellClick(c.jdn)}
            className={`p-1 h-9 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between text-xs select-none active:scale-90 ${
              c.isSelected
                ? 'bg-cyan-500/30 ring-1.5 ring-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)] z-10'
                : c.isToday
                ? 'bg-slate-800 text-cyan-300 font-bold border-cyan-400/50'
                : c.isCurrentMonth
                ? 'bg-slate-900/40 hover:bg-slate-800 border-slate-800/80 text-slate-200'
                : 'bg-transparent border-transparent opacity-20 hover:opacity-50 text-slate-500'
            }`}
          >
            <span
              className={`text-[11px] tabular-nums leading-none mt-0.5 ${
                c.hasHoliday ? 'text-amber-300 font-semibold' : c.isWeekend ? 'text-rose-400' : ''
              }`}
            >
              {toPersianDigits(c.dayNum)}
            </span>

            {/* Dot indicator or sticker */}
            <div className="h-2 flex items-center justify-center">
              {c.sticker ? (
                <span className="text-[9px] leading-none">{c.sticker.emoji}</span>
              ) : c.hasHoliday ? (
                <span className="w-1 h-1 rounded-full bg-amber-400" />
              ) : c.isToday ? (
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => {
            sound.playSwoosh();
            onSelectDate(new Date());
            onClose();
          }}
          className="text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
        >
          پرش به امروز
        </button>

        {onOpenFullCalendar && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullCalendar();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors"
          >
            <Orbit size={13} />
            <span>تقویم کامل مدار ↗</span>
          </button>
        )}
      </div>
    </div>
  );
};
