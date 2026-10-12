import React, { useMemo } from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain,
  CheckCircle2,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/celestialDateEngine';

// =========================================================================
// 1. ZODIAC CONSTELLATIONS DATA & VECTOR MAPS FOR 12 JALALI MONTHS
// =========================================================================
export interface ZodiacData {
  monthIndex: number; // 1 to 12
  persianName: string;
  zodiacSign: string;
  symbol: string;
  element: 'آتش' | 'خاک' | 'هوا' | 'آب';
  elementEn: 'fire' | 'earth' | 'air' | 'water';
  latinName: string;
  starCount: number;
  seasonName: string;
  gradient: string;
  glowColor: string;
  stars: Array<{ x: number; y: number; r: number; main?: boolean }>;
  lines: Array<[number, number]>;
}

export const ZODIAC_MAP: Record<number, ZodiacData> = {
  1: {
    monthIndex: 1,
    persianName: 'فروردین',
    zodiacSign: 'بَره (حَمَل)',
    symbol: '♈',
    element: 'آتش',
    elementEn: 'fire',
    latinName: 'Aries',
    starCount: 4,
    seasonName: 'بهار',
    gradient: 'from-rose-500/20 via-orange-500/10 to-transparent',
    glowColor: '#f43f5e',
    stars: [
      { x: 30, y: 70, r: 2.2 },
      { x: 55, y: 48, r: 2.8, main: true },
      { x: 75, y: 35, r: 3.5, main: true },
      { x: 88, y: 38, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  2: {
    monthIndex: 2,
    persianName: 'اردیبهشت',
    zodiacSign: 'گاو (ثَور)',
    symbol: '♉',
    element: 'خاک',
    elementEn: 'earth',
    latinName: 'Taurus',
    starCount: 6,
    seasonName: 'بهار',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    glowColor: '#10b981',
    stars: [
      { x: 25, y: 35, r: 2.5 },
      { x: 45, y: 55, r: 3.8, main: true }, // Aldebaran
      { x: 62, y: 48, r: 2.2 },
      { x: 78, y: 38, r: 2.6 },
      { x: 65, y: 72, r: 2.4 },
      { x: 35, y: 75, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 5],
      [5, 4],
      [4, 2],
    ],
  },
  3: {
    monthIndex: 3,
    persianName: 'خرداد',
    zodiacSign: 'دوپیکر (جَوزا)',
    symbol: '♊',
    element: 'هوا',
    elementEn: 'air',
    latinName: 'Gemini',
    starCount: 6,
    seasonName: 'بهار',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    glowColor: '#f59e0b',
    stars: [
      { x: 35, y: 25, r: 3.5, main: true }, // Castor
      { x: 65, y: 28, r: 3.5, main: true }, // Pollux
      { x: 38, y: 58, r: 2.2 },
      { x: 68, y: 60, r: 2.2 },
      { x: 42, y: 82, r: 2.0 },
      { x: 72, y: 84, r: 2.0 },
    ],
    lines: [
      [0, 2],
      [2, 4],
      [1, 3],
      [3, 5],
      [0, 1],
      [2, 3],
    ],
  },
  4: {
    monthIndex: 4,
    persianName: 'تیر',
    zodiacSign: 'خرچنگ (سَرَطان)',
    symbol: '♋',
    element: 'آب',
    elementEn: 'water',
    latinName: 'Cancer',
    starCount: 5,
    seasonName: 'تابستان',
    gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    glowColor: '#06b6d4',
    stars: [
      { x: 50, y: 50, r: 3.6, main: true },
      { x: 30, y: 35, r: 2.2 },
      { x: 70, y: 32, r: 2.4 },
      { x: 45, y: 78, r: 2.5 },
      { x: 72, y: 74, r: 2.0 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 4],
    ],
  },
  5: {
    monthIndex: 5,
    persianName: 'مرداد',
    zodiacSign: 'شیر (اَسَد)',
    symbol: '♌',
    element: 'آتش',
    elementEn: 'fire',
    latinName: 'Leo',
    starCount: 7,
    seasonName: 'تابستان',
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    glowColor: '#f97316',
    stars: [
      { x: 30, y: 32, r: 2.5 },
      { x: 48, y: 26, r: 2.6 },
      { x: 60, y: 40, r: 2.8 },
      { x: 52, y: 55, r: 3.8, main: true }, // Regulus
      { x: 75, y: 65, r: 2.6 },
      { x: 86, y: 50, r: 3.0, main: true }, // Denebola
      { x: 36, y: 68, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 6],
      [3, 4],
      [4, 5],
      [2, 5],
    ],
  },
  6: {
    monthIndex: 6,
    persianName: 'شهریور',
    zodiacSign: 'دوشیزه (سُنبُله)',
    symbol: '♍',
    element: 'خاک',
    elementEn: 'earth',
    latinName: 'Virgo',
    starCount: 6,
    seasonName: 'تابستان',
    gradient: 'from-lime-500/20 via-emerald-500/10 to-transparent',
    glowColor: '#84cc16',
    stars: [
      { x: 45, y: 25, r: 2.4 },
      { x: 32, y: 48, r: 2.6 },
      { x: 65, y: 45, r: 2.2 },
      { x: 50, y: 68, r: 3.8, main: true }, // Spica
      { x: 72, y: 72, r: 2.4 },
      { x: 80, y: 55, r: 2.0 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  7: {
    monthIndex: 7,
    persianName: 'مهر',
    zodiacSign: 'ترازو (میزان)',
    symbol: '♎',
    element: 'هوا',
    elementEn: 'air',
    latinName: 'Libra',
    starCount: 4,
    seasonName: 'پاییز',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    glowColor: '#d97706',
    stars: [
      { x: 40, y: 35, r: 3.2, main: true }, // Zubeneschamali
      { x: 68, y: 38, r: 3.2, main: true }, // Zubenelgenubi
      { x: 32, y: 72, r: 2.4 },
      { x: 75, y: 68, r: 2.5 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
  },
  8: {
    monthIndex: 8,
    persianName: 'آبان',
    zodiacSign: 'کژدم (عَقرب)',
    symbol: '♏',
    element: 'آب',
    elementEn: 'water',
    latinName: 'Scorpius',
    starCount: 7,
    seasonName: 'پاییز',
    gradient: 'from-red-500/20 via-purple-500/10 to-transparent',
    glowColor: '#ef4444',
    stars: [
      { x: 30, y: 30, r: 2.4 },
      { x: 42, y: 40, r: 4.0, main: true }, // Antares
      { x: 55, y: 52, r: 2.5 },
      { x: 62, y: 68, r: 2.6 },
      { x: 75, y: 78, r: 2.8 },
      { x: 82, y: 65, r: 2.4 },
      { x: 78, y: 52, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  9: {
    monthIndex: 9,
    persianName: 'آذر',
    zodiacSign: 'کماندار (قَوس)',
    symbol: '♐',
    element: 'آتش',
    elementEn: 'fire',
    latinName: 'Sagittarius',
    starCount: 6,
    seasonName: 'پاییز',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    glowColor: '#8b5cf6',
    stars: [
      { x: 35, y: 42, r: 2.6 },
      { x: 55, y: 30, r: 3.2, main: true },
      { x: 75, y: 45, r: 2.8 },
      { x: 68, y: 68, r: 3.4, main: true },
      { x: 45, y: 65, r: 2.5 },
      { x: 25, y: 78, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [4, 5],
    ],
  },
  10: {
    monthIndex: 10,
    persianName: 'دی',
    zodiacSign: 'بزغاله (جَدْی)',
    symbol: '♑',
    element: 'خاک',
    elementEn: 'earth',
    latinName: 'Capricorn',
    starCount: 5,
    seasonName: 'زمستان',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    glowColor: '#3b82f6',
    stars: [
      { x: 30, y: 35, r: 3.0, main: true },
      { x: 55, y: 32, r: 2.6 },
      { x: 78, y: 45, r: 3.2, main: true },
      { x: 62, y: 75, r: 2.5 },
      { x: 40, y: 70, r: 2.4 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  11: {
    monthIndex: 11,
    persianName: 'بهمن',
    zodiacSign: 'آبریز (دَلْو)',
    symbol: '♒',
    element: 'هوا',
    elementEn: 'air',
    latinName: 'Aquarius',
    starCount: 6,
    seasonName: 'زمستان',
    gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    glowColor: '#14b8a6',
    stars: [
      { x: 35, y: 28, r: 3.0, main: true },
      { x: 52, y: 38, r: 2.6 },
      { x: 70, y: 32, r: 2.8 },
      { x: 42, y: 65, r: 2.4 },
      { x: 60, y: 72, r: 2.6 },
      { x: 78, y: 65, r: 2.2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [4, 5],
    ],
  },
  12: {
    monthIndex: 12,
    persianName: 'اسفند',
    zodiacSign: 'دوماهی (حوت)',
    symbol: '♓',
    element: 'آب',
    elementEn: 'water',
    latinName: 'Pisces',
    starCount: 6,
    seasonName: 'زمستان',
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    glowColor: '#0ea5e9',
    stars: [
      { x: 30, y: 35, r: 2.6 },
      { x: 45, y: 55, r: 2.4 },
      { x: 55, y: 75, r: 3.5, main: true }, // Alrescha
      { x: 70, y: 62, r: 2.4 },
      { x: 82, y: 45, r: 2.6 },
      { x: 80, y: 28, r: 2.4 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
};

// =========================================================================
// 2. DAY STICKERS / MOOD PRESETS
// =========================================================================
export interface DaySticker {
  id: string;
  emoji: string;
  title: string;
  color: string;
  bgClass: string;
}

export const MOOD_STICKERS: DaySticker[] = [
  { id: 'focus', emoji: '🎯', title: 'تمرکز عمیق', color: '#06b6d4', bgClass: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'mission', emoji: '🚀', title: 'مأموریت بزرگ', color: '#8b5cf6', bgClass: 'bg-violet-500/20 text-violet-300' },
  { id: 'zen', emoji: '🌿', title: 'آرامش و ذن', color: '#10b981', bgClass: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'idea', emoji: '💡', title: 'ایده و خلاقیت', color: '#f59e0b', bgClass: 'bg-amber-500/20 text-amber-300' },
  { id: 'energy', emoji: '⚡', title: 'پرانرژی', color: '#eab308', bgClass: 'bg-yellow-500/20 text-yellow-300' },
  { id: 'study', emoji: '📚', title: 'یادگیری و مطالعه', color: '#3b82f6', bgClass: 'bg-blue-500/20 text-blue-300' },
  { id: 'celebrate', emoji: '🎉', title: 'جشن و رویداد', color: '#ec4899', bgClass: 'bg-pink-500/20 text-pink-300' },
  { id: 'rest', emoji: '🌙', title: 'استراحت و تجدید قوا', color: '#a855f7', bgClass: 'bg-purple-500/20 text-purple-300' },
];

export const loadStickersStorage = (): Record<number, string> => {
  try {
    const raw = localStorage.getItem('orbit_day_stickers_v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStickerStorage = (jdn: number, stickerId: string | null): Record<number, string> => {
  const current = loadStickersStorage();
  if (stickerId) {
    current[jdn] = stickerId;
  } else {
    delete current[jdn];
  }
  try {
    localStorage.setItem('orbit_day_stickers_v1', JSON.stringify(current));
  } catch {}
  return current;
};

// =========================================================================
// 3. SOLAR DAY HORIZON ARC WIDGET (مسیر حرکت خورشید و گرگ‌ومیش)
// =========================================================================
export const SolarDayArcWidget: React.FC = () => {
  // Compute approximate daylight metrics based on current local time
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Typical daylight interval (6:00 to 18:30)
    const sunriseMins = 6 * 60; // 06:00
    const sunsetMins = 18 * 60 + 30; // 18:30
    const totalDaylightMins = sunsetMins - sunriseMins;

    const isDay = currentMins >= sunriseMins && currentMins <= sunsetMins;
    let progress = 0;
    if (isDay) {
      progress = Math.min(1, Math.max(0, (currentMins - sunriseMins) / totalDaylightMins));
    } else if (currentMins > sunsetMins) {
      progress = 1;
    } else {
      progress = 0;
    }

    // Arc geometry: Angle from 180° to 0°
    const angleRad = Math.PI - progress * Math.PI;
    const cx = 100;
    const cy = 70;
    const r = 55;
    const sunX = cx + r * Math.cos(angleRad);
    const sunY = cy - r * Math.sin(angleRad);

    return {
      nowStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      isDay,
      progressPct: Math.round(progress * 100),
      sunX,
      sunY,
    };
  }, []);

  return (
    <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 flex flex-col gap-2 transition-colors">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <Sun size={13} className="text-amber-500" />
          <span>افق خورشیدی و روشنایی روز</span>
        </span>
        <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
          {toPersianDigits(metrics.progressPct)}٪ روز سپری شده
        </span>
      </div>

      {/* Visual Solar Arc Canvas SVG */}
      <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 80" className="w-full h-full max-w-[240px]">
          <defs>
            <linearGradient id="solarArcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b47820" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#c2593f" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#b47820" stopOpacity="0.5" />
            </linearGradient>
            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizon Base Line */}
          <line x1="25" y1="70" x2="175" y2="70" stroke="currentColor" className="text-stone-300 dark:text-stone-700" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* Dotted Orbit Path Arc */}
          <path
            d="M 45 70 A 55 55 0 0 1 155 70"
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth="2.5"
          />

          {/* Active Colored Arc */}
          <path
            d="M 45 70 A 55 55 0 0 1 155 70"
            fill="none"
            stroke="url(#solarArcGrad)"
            strokeWidth="2.5"
            strokeDasharray="172"
            strokeDashoffset={172 - (172 * metrics.progressPct) / 100}
            strokeLinecap="round"
          />

          {/* Sunrise indicator */}
          <circle cx="45" cy="70" r="3" fill="#b47820" />
          <text x="45" y="79" fontSize="6" fill="currentColor" className="text-stone-500 dark:text-stone-400" textAnchor="middle" fontFamily="sans-serif">
            ۰۶:۰۰
          </text>

          {/* Sunset indicator */}
          <circle cx="155" cy="70" r="3" fill="#c2593f" />
          <text x="155" y="79" fontSize="6" fill="currentColor" className="text-stone-500 dark:text-stone-400" textAnchor="middle" fontFamily="sans-serif">
            ۱۸:۳۰
          </text>

          {/* Moving Sun Orb */}
          {metrics.isDay ? (
            <g transform={`translate(${metrics.sunX}, ${metrics.sunY})`}>
              <circle r="6" fill="#f59e0b" filter="url(#sunGlow)" opacity="0.95" />
              <circle r="3" fill="#ffffff" />
            </g>
          ) : (
            <g transform="translate(100, 70)">
              <circle r="3.5" fill="#78716c" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono px-1">
        <span className="flex items-center gap-1">
          <Sunrise size={11} className="text-amber-500" />
          <span>طلوع آفتاب</span>
        </span>
        <span className="text-stone-700 dark:text-stone-300 font-semibold">{metrics.nowStr} اکنون</span>
        <span className="flex items-center gap-1">
          <Sunset size={11} className="text-rose-500" />
          <span>غروب آفتاب</span>
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// 4. ZODIAC CONSTELLATION CARD (صورت فلکی و نماد ماه)
// =========================================================================
interface ZodiacConstellationCardProps {
  monthIndex: number; // 1 to 12
}

export const ZodiacConstellationCard: React.FC<ZodiacConstellationCardProps> = ({
  monthIndex,
}) => {
  const zodiac = ZODIAC_MAP[monthIndex] || ZODIAC_MAP[1];

  const ElementIcon = useMemo(() => {
    switch (zodiac.elementEn) {
      case 'fire':
        return Flame;
      case 'water':
        return Droplets;
      case 'air':
        return Wind;
      case 'earth':
      default:
        return Mountain;
    }
  }, [zodiac.elementEn]);

  return (
    <div
      className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 relative overflow-hidden transition-all duration-300"
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{zodiac.symbol}</span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wide">
              صورت فلکی {zodiac.zodiacSign}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
              {zodiac.latinName} · فصل {zodiac.seasonName}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700">
              <ElementIcon size={10} className="text-stone-600 dark:text-stone-400" />
              <span>عنصر {zodiac.element}</span>
            </span>
          </div>
        </div>

        {/* Vector Constellation Canvas */}
        <div className="w-16 h-16 relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Star connect lines */}
            {zodiac.lines.map(([i1, i2], idx) => {
              const s1 = zodiac.stars[i1];
              const s2 = zodiac.stars[i2];
              if (!s1 || !s2) return null;
              return (
                <line
                  key={idx}
                  x1={s1.x}
                  y1={s1.y}
                  x2={s2.x}
                  y2={s2.y}
                  stroke="currentColor"
                  className="text-stone-400 dark:text-stone-600"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                  strokeDasharray="2 1"
                />
              );
            })}

            {/* Constellation Stars */}
            {zodiac.stars.map((s, idx) => (
              <g key={idx}>
                {s.main && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={s.r * 1.8}
                    fill="#c2593f"
                    opacity="0.3"
                  />
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill={s.main ? '#c2593f' : 'currentColor'}
                  className={s.main ? '' : 'text-stone-800 dark:text-stone-200'}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. DAY MOOD & STICKER PICKER (وایب و استیکر بصری روز)
// =========================================================================
interface DayMoodStickerPickerProps {
  selectedJdn: number;
  activeStickerId?: string;
  onSelectSticker: (stickerId: string | null) => void;
}

export const DayMoodStickerPicker: React.FC<DayMoodStickerPickerProps> = ({
  selectedJdn,
  activeStickerId,
  onSelectSticker,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>استیکر و حال‌وهوای این روز</span>
        </span>
        {activeStickerId && (
          <button
            type="button"
            onClick={() => onSelectSticker(null)}
            className="text-[10px] text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 cursor-pointer transition-colors"
          >
            حذف برچسب
          </button>
        )}
      </div>

      {/* Grid of Minimal Stickers */}
      <div className="grid grid-cols-4 gap-1.5">
        {MOOD_STICKERS.map((stk) => {
          const isSelected = activeStickerId === stk.id;
          return (
            <button
              key={stk.id}
              type="button"
              onClick={() => onSelectSticker(isSelected ? null : stk.id)}
              title={stk.title}
              className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                isSelected
                  ? 'bg-stone-200 dark:bg-stone-800 border-stone-800 dark:border-stone-200 ring-1 ring-stone-800 dark:ring-stone-200 shadow-2xs'
                  : 'bg-white dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-800/60 border-stone-200/60 dark:border-stone-800'
              }`}
            >
              <span className="text-base leading-none">{stk.emoji}</span>
              <span className="text-[9px] text-stone-700 dark:text-stone-300 truncate w-full text-center">
                {stk.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
