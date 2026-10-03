import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { DayPage, CategoryOption } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { sound } from '../utils/audio';

interface ChronodexDialProps {
  pageData: DayPage;
  onUpdateHourColor: (hour: number, color: string, cat?: string) => void;
  categories: CategoryOption[];
  activeCategoryFilter: string | null;
  onSelectCategoryFilter: (catId: string | null) => void;
  hoveredHour: number | null;
  onHoverHour: (hour: number | null) => void;
}

export type DialMode = 'day' | 'night' | '24h';

const CX = 160;
const CY = 160;

const HOURS_24 = [24, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
// Day mode: 12 hours from 06:00 AM to 18:00 PM
const HOURS_DAY = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
// Night mode: 12 hours from 18:00 PM to 06:00 AM
const HOURS_NIGHT = [18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(cx, cy, rOut, startAngle);
  const p2 = polarToCartesian(cx, cy, rOut, endAngle);
  const p3 = polarToCartesian(cx, cy, rIn, endAngle);
  const p4 = polarToCartesian(cx, cy, rIn, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    'M',
    p1.x.toFixed(2),
    p1.y.toFixed(2),
    'A',
    rOut,
    rOut,
    0,
    largeArc,
    1,
    p2.x.toFixed(2),
    p2.y.toFixed(2),
    'L',
    p3.x.toFixed(2),
    p3.y.toFixed(2),
    'A',
    rIn,
    rIn,
    0,
    largeArc,
    0,
    p4.x.toFixed(2),
    p4.y.toFixed(2),
    'Z',
  ].join(' ');
}

export const ChronodexDial: React.FC<ChronodexDialProps> = ({
  pageData,
  onUpdateHourColor,
  categories,
  activeCategoryFilter,
  onSelectCategoryFilter,
  hoveredHour,
  onHoverHour,
}) => {
  // Dual-mode state: 'day' (صبح و روز) vs 'night' (شب و استراحت) vs '24h'
  const [dialMode, setDialMode] = useState<DialMode>('day');
  const [needleAngle, setNeedleAngle] = useState(0);
  const [currentTimeText, setCurrentTimeText] = useState('--:--');
  const [popoverState, setPopoverState] = useState<{
    hour: number;
    x: number;
    y: number;
  } | null>(null);

  // Live Needle angle update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      setCurrentTimeText(
        `${toPersianDigits(String(hours).padStart(2, '0'))}:${toPersianDigits(
          String(minutes).padStart(2, '0')
        )}`
      );

      let angle = 0;
      if (dialMode === '24h') {
        angle = (hours % 24) * 15 + minutes * 0.25;
      } else if (dialMode === 'day') {
        // 6:00 AM at top = 0°, 18:00 = 360° (12h = 360° => 30° per hour)
        const dayHoursPassed = (hours - 6 + 24) % 24;
        const normalizedHours = dayHoursPassed % 12;
        angle = normalizedHours * 30 + minutes * 0.5;
      } else {
        // night mode: 18:00 (6 PM) at top = 0°, 6:00 AM = 360°
        const nightHoursPassed = (hours - 18 + 24) % 24;
        const normalizedHours = nightHoursPassed % 12;
        angle = normalizedHours * 30 + minutes * 0.5;
      }

      setNeedleAngle(angle);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 15);
    return () => clearInterval(interval);
  }, [dialMode]);

  const handleSectorClick = (e: React.MouseEvent, hour: number) => {
    e.stopPropagation();
    sound.playAdd();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverState({
      hour,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  // Determine active hours and sector angles based on mode
  const currentHours =
    dialMode === 'day' ? HOURS_DAY : dialMode === 'night' ? HOURS_NIGHT : HOURS_24;
  const sectorAngleWidth = dialMode === '24h' ? 15 : 30;

  return (
    <div className="flex flex-col items-center relative select-none">
      {/* Dual Mode Switcher Tabs (صبح و روز / شب و استراحت / ۲۴H) */}
      <div className="flex items-center gap-1.5 p-1 bg-black/30 backdrop-blur-md rounded-full border border-white/20 shadow-md mb-3">
        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            setDialMode('day');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            dialMode === 'day'
              ? 'bg-[#f4c430] text-slate-900 shadow-md scale-105 ring-1 ring-amber-300'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="حالت صبح و روز (ساعات ۶:۰۰ تا ۱۸:۰۰)"
        >
          <Sun size={14} className={dialMode === 'day' ? 'text-amber-900' : 'text-amber-300'} />
          <span>حالت صبح و روز</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            setDialMode('night');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            dialMode === 'night'
              ? 'bg-[#3b4b68] text-white shadow-md scale-105 ring-1 ring-indigo-300'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="حالت شب و استراحت (ساعات ۱۸:۰۰ تا ۰۶:۰۰)"
        >
          <Moon size={14} className={dialMode === 'night' ? 'text-cyan-300' : 'text-cyan-200'} />
          <span>حالت شب و استراحت</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            setDialMode('24h');
          }}
          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            dialMode === '24h'
              ? 'bg-white text-slate-900 shadow-md scale-105'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="نمایش ۲۴ ساعته کامل"
        >
          <span>۲۴H</span>
        </button>
      </div>

      {/* SVG Clock Dial Container */}
      <div className="relative w-76 h-76 md:w-84 md:h-84 transition-all duration-300">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full overflow-visible drop-shadow-2xl transition-all duration-300"
        >
          {/* Defs for Gradients and Glows */}
          <defs>
            <radialGradient id="dayDialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#cde6d8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2b4336" stopOpacity="0.1" />
            </radialGradient>

            <radialGradient id="nightDialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22334d" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#141e2e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0b111a" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Base Dial Circle with dynamic mode styling */}
          <circle
            cx={CX}
            cy={CY}
            r={148}
            fill={
              dialMode === 'night'
                ? 'url(#nightDialGlow)'
                : dialMode === 'day'
                ? 'url(#dayDialGlow)'
                : 'rgba(197, 226, 210, 0.22)'
            }
            stroke={
              dialMode === 'night'
                ? 'rgba(125, 178, 255, 0.4)'
                : dialMode === 'day'
                ? 'rgba(244, 196, 48, 0.45)'
                : 'rgba(255, 255, 255, 0.35)'
            }
            strokeWidth={1.5}
          />

          {/* MODE-SPECIFIC GRAPHICS */}
          {dialMode === 'day' ? (
            /* Day Mode: Morning/Day Sun Art at Top */
            <g transform="translate(142, 16) scale(0.85)">
              <circle cx="21" cy="21" r="10" fill="#f4c430" filter="drop-shadow(0 0 6px rgba(244, 196, 48, 0.8))" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                <line
                  key={i}
                  x1="21"
                  y1="6"
                  x2="21"
                  y2="2"
                  stroke="#f4c430"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${ang} 21 21)`}
                />
              ))}
            </g>
          ) : dialMode === 'night' ? (
            /* Night Mode: Crescent Moon & Sparkle Stars */
            <g transform="translate(144, 16) scale(0.9)">
              <path
                d="M21 7 A14 14 0 1 0 35 21 A11 11 0 0 1 21 7 Z"
                fill="#fde047"
                filter="drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))"
              />
              <circle cx="10" cy="12" r="1.5" fill="#ffffff" />
              <circle cx="36" cy="30" r="1.2" fill="#ffffff" />
              <circle cx="8" cy="28" r="1" fill="#7dd3fc" />
            </g>
          ) : (
            /* 24h Mode: Sunrise on right, Sunset on left */
            <>
              <g transform="translate(254, 70) scale(0.7)">
                <circle cx="12" cy="12" r="5" fill="#f4c430" />
                <line x1="12" y1="2" x2="12" y2="5" stroke="#f4c430" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22" stroke="#f4c430" strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="12" x2="5" y2="12" stroke="#f4c430" strokeWidth="2" strokeLinecap="round" />
                <line x1="19" y1="12" x2="22" y2="12" stroke="#f4c430" strokeWidth="2" strokeLinecap="round" />
              </g>
              <g transform="translate(38, 238) scale(0.7)">
                <path d="M4 14 A8 8 0 0 1 20 14 Z" fill="#f4a261" />
                <line x1="2" y1="15" x2="22" y2="15" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="3" x2="12" y2="6" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" />
              </g>
            </>
          )}

          {/* INNER PERIODS RINGS */}
          {dialMode === 'day' ? (
            /* Day 4 Periods: سحر و بامداد (6-9) / صبح و کار (9-12) / نیمروز و ظهر (12-15) / عصر (15-18) */
            <>
              <path d={describeArc(CX, CY, 52, 78, 0, 90)} fill="#fde68a" stroke="#d97706" strokeWidth="0.8" opacity={0.85} />
              <path d={describeArc(CX, CY, 52, 78, 90, 180)} fill="#a7f3d0" stroke="#059669" strokeWidth="0.8" opacity={0.85} />
              <path d={describeArc(CX, CY, 52, 78, 180, 270)} fill="#fcd34d" stroke="#d97706" strokeWidth="0.8" opacity={0.85} />
              <path d={describeArc(CX, CY, 52, 78, 270, 360)} fill="#fdba74" stroke="#ea580c" strokeWidth="0.8" opacity={0.85} />

              <text x={polarToCartesian(CX, CY, 65, 45).x} y={polarToCartesian(CX, CY, 65, 45).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#78350f]">
                بامداد
              </text>
              <text x={polarToCartesian(CX, CY, 65, 135).x} y={polarToCartesian(CX, CY, 65, 135).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#065f46]">
                صبحگاهی
              </text>
              <text x={polarToCartesian(CX, CY, 65, 225).x} y={polarToCartesian(CX, CY, 65, 225).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#78350f]">
                نیمروز
              </text>
              <text x={polarToCartesian(CX, CY, 65, 315).x} y={polarToCartesian(CX, CY, 65, 315).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#7c2d12]">
                عصرگاه
              </text>
            </>
          ) : dialMode === 'night' ? (
            /* Night 4 Periods: غروب و شب (18-21) / آرامش شبانه (21-24) / خواب عمیق (24-03) / سحرگاه (03-06) */
            <>
              <path d={describeArc(CX, CY, 52, 78, 0, 90)} fill="#818cf8" stroke="#3730a3" strokeWidth="0.8" opacity={0.8} />
              <path d={describeArc(CX, CY, 52, 78, 90, 180)} fill="#4f46e5" stroke="#312e81" strokeWidth="0.8" opacity={0.8} />
              <path d={describeArc(CX, CY, 52, 78, 180, 270)} fill="#1e1b4b" stroke="#312e81" strokeWidth="0.8" opacity={0.9} />
              <path d={describeArc(CX, CY, 52, 78, 270, 360)} fill="#312e81" stroke="#4338ca" strokeWidth="0.8" opacity={0.85} />

              <text x={polarToCartesian(CX, CY, 65, 45).x} y={polarToCartesian(CX, CY, 65, 45).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#e0e7ff]">
                غروب
              </text>
              <text x={polarToCartesian(CX, CY, 65, 135).x} y={polarToCartesian(CX, CY, 65, 135).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#e0e7ff]">
                آرامش شب
              </text>
              <text x={polarToCartesian(CX, CY, 65, 225).x} y={polarToCartesian(CX, CY, 65, 225).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#c7d2fe]">
                خواب عمیق
              </text>
              <text x={polarToCartesian(CX, CY, 65, 315).x} y={polarToCartesian(CX, CY, 65, 315).y} textAnchor="middle" dominantBaseline="central" className="text-[9.5px] font-bold fill-[#c7d2fe]">
                سحر
              </text>
            </>
          ) : (
            /* 24h Default Periods */
            <>
              <path d={describeArc(CX, CY, 52, 78, 60, 165)} fill="#b9dbc9" stroke="#2e4738" strokeWidth="0.8" opacity={0.9} />
              <path d={describeArc(CX, CY, 52, 78, 165, 225)} fill="#a5ceb9" stroke="#2e4738" strokeWidth="0.8" opacity={0.9} />
              <path d={describeArc(CX, CY, 52, 78, 225, 300)} fill="#93bfa8" stroke="#2e4738" strokeWidth="0.8" opacity={0.9} />
              <path d={describeArc(CX, CY, 52, 78, 300, 420)} fill="#7fae97" stroke="#2e4738" strokeWidth="0.8" opacity={0.9} />

              <text x={polarToCartesian(CX, CY, 65, 112.5).x} y={polarToCartesian(CX, CY, 65, 112.5).y} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold fill-[#1e3226]">
                صبحگاهی
              </text>
              <text x={polarToCartesian(CX, CY, 65, 195).x} y={polarToCartesian(CX, CY, 65, 195).y} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold fill-[#1e3226]">
                نیمروز
              </text>
              <text x={polarToCartesian(CX, CY, 65, 262.5).x} y={polarToCartesian(CX, CY, 65, 262.5).y} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold fill-[#1e3226]">
                عصر
              </text>
              <text x={polarToCartesian(CX, CY, 65, 360).x} y={polarToCartesian(CX, CY, 65, 360).y} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold fill-[#1e3226]">
                استراحت
              </text>
            </>
          )}

          {/* DYNAMIC HOUR SECTORS */}
          {currentHours.map((hour, idx) => {
            const startAngle = idx * sectorAngleWidth - sectorAngleWidth / 2;
            const endAngle = idx * sectorAngleWidth + sectorAngleWidth / 2;
            const d = describeArc(CX, CY, 80, 134, startAngle, endAngle);

            const slot = pageData.timeSlots[hour];
            const defaultSectorColor =
              dialMode === 'night'
                ? 'rgba(30, 45, 68, 0.7)'
                : 'rgba(197, 226, 210, 0.45)';
            const sectorColor = slot?.color || defaultSectorColor;
            const isHovered = hoveredHour === hour;
            const isDimmed = activeCategoryFilter && slot?.cat !== activeCategoryFilter;

            return (
              <path
                key={`${dialMode}_${hour}`}
                d={d}
                fill={sectorColor}
                stroke={
                  isHovered
                    ? '#ffffff'
                    : dialMode === 'night'
                    ? 'rgba(99, 102, 241, 0.5)'
                    : 'rgba(46, 71, 56, 0.65)'
                }
                strokeWidth={isHovered ? 2.2 : 0.8}
                opacity={isDimmed ? 0.25 : 1}
                className="cursor-pointer transition-all duration-200 hover:brightness-110"
                onClick={(e) => handleSectorClick(e, hour)}
                onMouseEnter={() => onHoverHour(hour)}
                onMouseLeave={() => onHoverHour(null)}
              >
                <title>{`ساعت ${hour}: ${slot?.text || 'خالی'}`}</title>
              </path>
            );
          })}

          {/* Hour Labels on Dial Circumference */}
          {currentHours.map((hour, idx) => {
            const pos = polarToCartesian(CX, CY, 143, idx * sectorAngleWidth);
            const labelColor =
              dialMode === 'night' ? 'fill-indigo-200' : 'fill-emerald-100';

            return (
              <text
                key={`lbl_${dialMode}_${hour}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] font-bold ${labelColor} pointer-events-none select-none font-mono drop-shadow-xs`}
              >
                {toPersianDigits(hour)}
              </text>
            );
          })}

          {/* Center Hub with Mode Title and Live Clock */}
          <circle
            cx={CX}
            cy={CY}
            r={42}
            fill={dialMode === 'night' ? '#141e2e' : '#284032'}
            stroke={
              dialMode === 'night'
                ? 'rgba(147, 197, 253, 0.5)'
                : 'rgba(255, 255, 255, 0.4)'
            }
            strokeWidth={1.8}
          />
          <circle
            cx={CX}
            cy={CY}
            r={28}
            fill={dialMode === 'night' ? '#0c121c' : '#1e3226'}
            stroke={dialMode === 'night' ? '#60a5fa' : '#cde6d8'}
            strokeWidth={1}
          />

          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-black fill-white select-none"
          >
            {dialMode === 'day' ? '☀️ روز' : dialMode === 'night' ? '🌙 شب' : '۲۴H'}
          </text>
          <text
            x={CX}
            y={CY + 9}
            textAnchor="middle"
            dominantBaseline="central"
            className={`text-[9px] font-bold font-mono ${
              dialMode === 'night' ? 'fill-cyan-300' : 'fill-emerald-300'
            }`}
          >
            {currentTimeText}
          </text>

          {/* Live Needle pointer */}
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={42}
            stroke={dialMode === 'night' ? '#67e8f9' : '#f4c430'}
            strokeWidth={2.4}
            strokeLinecap="round"
            className="drop-shadow-md pointer-events-none transition-transform duration-500 ease-out"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${needleAngle}deg)`,
            }}
          />
          <circle
            cx={CX}
            cy={CY}
            r={3.5}
            fill={dialMode === 'night' ? '#67e8f9' : '#f4c430'}
          />
        </svg>
      </div>

      {/* Activity Legend Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full max-w-sm">
        <button
          onClick={() => {
            sound.playTick(true);
            onSelectCategoryFilter(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
            activeCategoryFilter === null
              ? 'bg-white text-slate-900 border-white shadow-xs'
              : 'bg-black/20 text-white/80 border-white/10 hover:bg-black/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>همه</span>
        </button>

        {categories.map((cat) => {
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTick(true);
                onSelectCategoryFilter(isActive ? null : cat.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                isActive
                  ? 'bg-white text-slate-900 border-white shadow-xs scale-105'
                  : 'bg-black/20 text-white/80 border-white/10 hover:bg-black/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Popover Color/Category Picker */}
      {popoverState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs"
          onClick={() => setPopoverState(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 w-72 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800">
                تخصیص دسته‌بندی ساعت {toPersianDigits(popoverState.hour)}:۰۰
              </span>
              <button
                onClick={() => setPopoverState(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  onUpdateHourColor(popoverState.hour, '');
                  setPopoverState(null);
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 text-right cursor-pointer"
              >
                <span className="w-4 h-4 rounded-full bg-slate-300 border border-slate-200" />
                <span>پاک کردن رنگ (خالی)</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onUpdateHourColor(popoverState.hour, cat.color, cat.id);
                    setPopoverState(null);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 text-right cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full shadow-2xs" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-base">{cat.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
