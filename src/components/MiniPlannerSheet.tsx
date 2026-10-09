import React from 'react';
import { Star, Check, Trash2, ExternalLink, Coffee, Sun, Moon, Feather, Bookmark, Heart } from 'lucide-react';
import { DayPage, JournalTheme } from '../types';
import { formatJalaliDate, PERSIAN_DAYS, toPersianDigits, parseDateKey } from '../utils/jalali';
import { injectHtmlSyncScript } from '../utils/htmlTemplates';

interface MiniPlannerSheetProps {
  dateKey?: string;
  page: DayPage;
  theme?: JournalTheme;
  pageIndex?: number;
  titleOverride?: string;
  badgeOverride?: string;
  hideDelete?: boolean;
  hideHeader?: boolean;
  onOpen?: () => void;
  onDelete?: () => void;
}

const HOURS_ORDER = [24, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

import { polarToCartesian, describeArc } from '../utils/geometry';

export const MiniPlannerSheet: React.FC<MiniPlannerSheetProps> = ({
  dateKey = '2026-10-03',
  page,
  theme = 'sage',
  pageIndex = 0,
  titleOverride,
  badgeOverride,
  hideDelete = false,
  hideHeader = false,
  onOpen,
  onDelete,
}) => {
  const dateObj = parseDateKey(dateKey);
  const formattedDate = formatJalaliDate(dateObj);
  const dayName = PERSIAN_DAYS[dateObj.getDay()];

  const tplType = (page.templateType || 'template-1-green') as string;

  const isEisenhower = tplType === 'template-2-one-big-thing' || tplType === 'eisenhower';
  const isWriter = tplType === 'template-3-writing-plans' || tplType === 'writer';
  const isCelestial = tplType === 'template-4-celestial-todo' || tplType === 'celestial';
  const isCustomHtml = tplType === 'template-custom-html';

  const CX = 80;
  const CY = 80;

  return (
    <div
      onClick={onOpen}
      className="flex flex-col gap-2 group cursor-pointer select-none"
    >
      {/* Sheet Top Label */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6438] animate-pulse" />
            <span className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[180px]">
              {titleOverride || `برگه روز ${dayName}`}
            </span>
            {!titleOverride && (
              <span className="text-xs font-bold text-slate-500 font-mono">
                ({toPersianDigits(formattedDate.split(' ')[1])} {formattedDate.split(' ')[2]})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
              {badgeOverride || `برگه ${toPersianDigits(pageIndex + 1)}`}
            </span>
            {!hideDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-700 p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="حذف این برگه"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          RENDER SHEET MINIATURE BASED ON TEMPLATE TYPE
         ======================================================== */}
      {isCustomHtml ? (
        /* CUSTOM HTML MINIATURE */
        <div className="w-full aspect-[1/1.34] bg-slate-900 border-2 border-blue-500/40 rounded-[28px] p-3.5 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-1.5 h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[10px] font-mono font-bold text-blue-400">HTML TEMPLATE</span>
              <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-400/30">
                قالب سفارشی
              </span>
            </div>
            <div className="flex-1 w-full bg-white rounded-xl overflow-hidden pointer-events-none relative shadow-inner">
              <iframe
                srcDoc={injectHtmlSyncScript(page.customHtmlContent || '<h1>HTML</h1>')}
                title="Mini Custom HTML"
                scrolling="no"
                className="w-full h-full border-none pointer-events-none scale-75 origin-top-left"
                style={{ width: '133%', height: '133%' }}
                sandbox=""
              />
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[8px] font-bold text-slate-300">
            <span>قالب کاربری HTML</span>
            <span className="flex items-center gap-1 text-blue-400">
              <span>ورود</span>
              <ExternalLink size={9} />
            </span>
          </div>
        </div>
      ) : isEisenhower ? (
        /* 1. EISENHOWER MINIATURE (Image 1) */
        <div className="w-full aspect-[1/1.34] bg-[#fcfaf7] text-slate-900 border-2 border-slate-900 rounded-[28px] p-3.5 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col gap-2">
            {/* The One Big Thing banner */}
            <div className="bg-black text-white text-center py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider">
              THE ONE BIG THING
            </div>
            <div className="border border-slate-900 rounded-md p-1 text-[7.5px] font-bold truncate bg-white">
              {page.oneBigThing || 'مهم‌ترین هدف امروز...'}
            </div>

            {/* 2 Columns: Time Blocking & Matrix */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Left: Time Blocking rows */}
              <div className="border border-slate-900 rounded-md overflow-hidden bg-white flex flex-col divide-y divide-slate-200">
                <span className="text-[6.5px] font-black uppercase text-center bg-slate-100 py-0.5">
                  8 AM - 6 PM
                </span>
                {['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((h, i) => (
                  <div key={h} className="flex items-center justify-between px-1 py-0.5 text-[6.5px]">
                    <span className="font-mono text-slate-500">{h}</span>
                    <span className="w-2 h-2 border border-slate-400 rounded-xs inline-block" />
                  </div>
                ))}
              </div>

              {/* Right: Eisenhower 4 Quadrants & Brain Dump */}
              <div className="flex flex-col gap-1.5">
                <div className="border border-slate-900 rounded-md grid grid-cols-2 divide-x divide-y divide-slate-900 text-[6px] font-bold bg-white text-center">
                  <div className="p-1 bg-rose-50/60 truncate">URGENT & IMP</div>
                  <div className="p-1 bg-emerald-50/60 truncate">IMPORTANT</div>
                  <div className="p-1 bg-amber-50/60 truncate">URGENT</div>
                  <div className="p-1 bg-slate-50 truncate">NOT URGENT</div>
                </div>

                <div className="border border-slate-900 rounded-md p-1 bg-white text-[6.5px] flex flex-col gap-0.5">
                  <span className="font-black uppercase text-[6px]">BRAIN DUMP</span>
                  <div className="h-10 border-b border-dashed border-slate-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[8px] font-bold text-slate-600">
            <span>قالب آیزنهاور</span>
            <span className="flex items-center gap-1 text-[#ff6438]">
              <span>ورود</span>
              <ExternalLink size={9} />
            </span>
          </div>
        </div>
      ) : isWriter ? (
        /* 2. WRITER PLANS MINIATURE (Image 2) */
        <div className="w-full aspect-[1/1.34] bg-[#f9f5ec] text-slate-800 border-2 border-[#546a53]/40 rounded-[28px] p-3.5 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-dashed border-[#546a53]/30 pb-1">
              <span className="text-[10px] font-black text-emerald-950">writing plans ♡</span>
              <span className="text-[8px] text-amber-800 font-bold bg-amber-100/60 px-1 rounded">
                CURRENT PROJECT
              </span>
            </div>

            {/* Chapter Tracker Bubbles Mini */}
            <div className="bg-white border border-[#546a53]/20 rounded-xl p-1.5 flex flex-col gap-1">
              <span className="text-[6.5px] font-bold uppercase text-emerald-900">
                Chapter Tracker (۱ تا ۲۵)
              </span>
              <div className="grid grid-cols-5 gap-1 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ch) => (
                  <div
                    key={ch}
                    className={`w-3.5 h-3.5 rounded-full text-[6px] font-bold flex items-center justify-center ${
                      ch <= 4 ? 'bg-[#546a53] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>

            {/* Coffee Meter + Quote */}
            <div className="flex items-center justify-between bg-white/80 border border-[#d9ccba] rounded-xl p-1.5 text-[7px]">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <Coffee size={10} />
                <span>قهوه: ۳/۵</span>
              </span>
              <span className="text-emerald-800 italic">“first drafts just have to exist”</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#546a53]/20 flex items-center justify-between text-[8px] font-bold text-emerald-900">
            <span>استودیو نویسندگی</span>
            <span className="flex items-center gap-1 text-[#ff6438]">
              <span>ورود</span>
              <ExternalLink size={9} />
            </span>
          </div>
        </div>
      ) : isCelestial ? (
        /* 3. CELESTIAL MAGIC MINIATURE (Image 3) */
        <div className="w-full aspect-[1/1.34] bg-[#0b1320] text-[#dfca86] border-2 border-[#c5a65c]/60 rounded-[28px] p-3.5 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative font-serif">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-[#c5a65c]/40 pb-1">
              <span className="text-[10px] font-bold text-[#f4e2a8] flex items-center gap-1">
                <span>✦</span> Daily Planner
              </span>
              <div className="flex items-center gap-0.5 text-xs text-amber-300">
                <Sun size={10} />
                <Moon size={9} />
              </div>
            </div>

            {/* 2 Columns: Schedule + Priorities */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="border border-[#c5a65c]/30 rounded-lg p-1 bg-[#0f1929] flex flex-col gap-0.5 text-[6.5px]">
                <span className="font-bold text-[#f4e2a8] text-[6px]">TODAY'S SCHEDULE</span>
                {['6 AM', '9 AM', '1 PM', '6 PM'].map((t) => (
                  <div key={t} className="flex items-center gap-1 text-[#c5a65c]/80">
                    <span className="w-1.5 h-1.5 rounded-full border border-[#c5a65c]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="border border-[#c5a65c]/30 rounded-lg p-1 bg-[#0f1929] flex flex-col gap-0.5 text-[6.5px]">
                <span className="font-bold text-[#f4e2a8] text-[6px]">5 PRIORITIES</span>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-1 text-[#f4e2a8]">
                    <span>{n}.</span>
                    <span className="truncate">اولویت زرین</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Self-Care Bar */}
            <div className="border border-[#c5a65c]/40 rounded-lg p-1 bg-[#101b2d] flex items-center justify-around text-[7px]">
              <span>💧💧💧</span>
              <span>🪷🪷</span>
              <span>🌙🌙🌙</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#c5a65c]/30 flex items-center justify-between text-[8px] font-bold text-[#c5a65c]">
            <span>سلستیال جادویی</span>
            <span className="flex items-center gap-1 text-[#f4c430]">
              <span>ورود</span>
              <ExternalLink size={9} />
            </span>
          </div>
        </div>
      ) : (
        /* 4. CLASSIC GREEN CHRONODEX MINIATURE (Image green sheet) */
        <div className="w-full aspect-[1/1.34] bg-[#263e32] border border-emerald-700/40 rounded-[28px] p-3.5 sm:p-4 text-white shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
          {/* Binder Ring Holes on the right edge */}
          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none opacity-40">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-900 border border-white/40 shadow-inner"
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                {titleOverride ? 'قالب استاندارد برگه' : `روز ${dayName}`}
              </span>
              <span className="text-[9px] text-emerald-200 font-bold">۲۴h Chronodex</span>
            </div>
            <span className="text-[8px] text-white/60 font-mono font-bold mr-3">{dateKey}</span>
          </div>

          {/* 2-Column Main Template */}
          <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
            <div className="flex flex-col items-center justify-between gap-1.5">
              {/* Chronodex SVG */}
              <div className="w-22 h-22 sm:w-26 sm:h-26 relative shrink-0">
                <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
                  <circle cx={CX} cy={CY} r={72} fill="rgba(197, 226, 210, 0.2)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth={0.8} />
                  <path d={describeArc(CX, CY, 26, 39, 60, 165)} fill="#b9dbc9" opacity={0.85} />
                  <path d={describeArc(CX, CY, 26, 39, 165, 225)} fill="#a5ceb9" opacity={0.85} />
                  <path d={describeArc(CX, CY, 26, 39, 225, 300)} fill="#93bfa8" opacity={0.85} />
                  <path d={describeArc(CX, CY, 26, 39, 300, 420)} fill="#7fae97" opacity={0.85} />
                  {HOURS_ORDER.map((hour, idx) => {
                    const startAngle = idx * 15 - 7.5;
                    const endAngle = idx * 15 + 7.5;
                    const d = describeArc(CX, CY, 40, 68, startAngle, endAngle);
                    const slot = page.timeSlots[hour];
                    const sectorColor = slot?.color || 'rgba(197, 226, 210, 0.35)';
                    return <path key={hour} d={d} fill={sectorColor} stroke="rgba(46, 71, 56, 0.5)" strokeWidth={0.5} />;
                  })}
                  <circle cx={CX} cy={CY} r={20} fill="#284032" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                  <circle cx={CX} cy={CY} r={14} fill="#1e3226" />
                  <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" className="text-[7px] font-black fill-white">۲۴H</text>
                </svg>
              </div>

              {/* Linear Time Rows */}
              <div className="w-full bg-[#cde6d8]/90 rounded-xl p-1 flex flex-col gap-0.5 text-slate-800">
                {[8, 11, 14, 17].map((h) => (
                  <div key={h} className="h-1.5 rounded bg-white/70 overflow-hidden" />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 justify-between">
              {/* Habits */}
              <div className="bg-white rounded-xl p-1.5 text-slate-800 flex flex-col gap-0.5 shadow-xs">
                <span className="text-[7px] font-black text-emerald-950">عادات و روتین‌ها</span>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-1 text-[6.5px]">
                    <span className="w-2 h-2 rounded bg-emerald-700 text-white flex items-center justify-center">✓</span>
                    <span className="truncate">روتین روزانه</span>
                  </div>
                ))}
              </div>

              {/* Priorities */}
              <div className="bg-white rounded-xl p-1.5 text-slate-800 flex flex-col gap-0.5 shadow-xs">
                <span className="text-[7px] font-black text-slate-900">۳ اولویت اصلی</span>
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-1 text-[6.5px]">
                    <span className="text-amber-500">★</span>
                    <span className="truncate font-semibold">اولویت اصلی</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[9px] font-bold text-white/90">
            <span>پلنر سبز ۲۴H</span>
            <span className="flex items-center gap-1 text-white bg-white/20 group-hover:bg-[#ff6438] px-2 py-0.5 rounded-full transition-colors">
              <span>ورود</span>
              <ExternalLink size={10} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
