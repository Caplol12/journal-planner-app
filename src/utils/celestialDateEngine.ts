/**
 * Celestial Date Engine for Orbit Dual Calendar (مدار · تقویم دوگانه)
 * Integer-based Julian Day Number (JDN) conversions for Jalali <-> Gregorian
 * Astronomical Moon Phase computation, leap years, official Iranian holidays and cosmic events.
 */

export interface CalendarDateParts {
  y: number;
  m: number;
  d: number;
}

export interface DayEvent {
  fa: string;
  en: string;
  isHoliday: boolean; // official public holiday
}

export interface MoonPhaseInfo {
  phase: number; // 0 to 1
  illumination: number; // 0 to 1
  index: number; // 0 to 7
  nameFa: string;
  nameEn: string;
}

export interface CalendarTaskNote {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const div = (a: number, b: number) => Math.trunc(a / b);
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b;

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];

/** Leap info + March day of Farvardin 1 for Jalali year jy */
export function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jm: number;
  let jump = 0;
  for (let i = 1; i < BREAKS.length; i++) {
    jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

/** Gregorian -> JDN */
export function g2d(gy: number, gm: number, gd: number): number {
  const d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
}

/** JDN -> Gregorian */
export function d2g(jdn: number): CalendarDateParts {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { y: gy, m: gm, d: gd };
}

/** Jalali -> JDN */
export function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** JDN -> Jalali */
export function d2j(jdn: number): CalendarDateParts {
  const gy = d2g(jdn).y;
  let jy = gy - 621;
  const r = jalCal(jy);
  let k = jdn - g2d(gy, 3, r.march);
  if (k >= 0) {
    if (k <= 185) return { y: jy, m: 1 + div(k, 31), d: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { y: jy, m: 7 + div(k, 30), d: mod(k, 30) + 1 };
}

export const isJalaliLeap = (jy: number) => jalCal(jy).leap === 0;
export const isGregorianLeap = (gy: number) =>
  (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;

export const jalaliMonthLength = (y: number, m: number) =>
  m <= 6 ? 31 : m <= 11 ? 30 : isJalaliLeap(y) ? 30 : 29;

export const gregorianMonthLength = (y: number, m: number) =>
  [31, isGregorianLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

/** 0 = Sunday, 1 = Monday ... 6 = Saturday */
export const getWeekday = (jdn: number) => ((jdn + 1) % 7 + 7) % 7;

export const getTodayJdn = (d = new Date()) =>
  g2d(d.getFullYear(), d.getMonth() + 1, d.getDate());

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const GREGORIAN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const FA_WEEKDAY_NAMES = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

export const EN_WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const FA_WEEKDAY_HEADERS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const EN_WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const toPersianDigits = (v: number | string) =>
  String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

// Events: Solar Hijri + Gregorian fixed events (culture, national, space milestones)
const JALALI_EVENTS: Record<string, DayEvent> = {
  '1-1': { fa: 'جشن نوروز، آغاز سال نو', en: 'Nowruz, Persian New Year', isHoliday: true },
  '1-2': { fa: 'تعطیلات نوروز', en: 'Nowruz holiday', isHoliday: true },
  '1-3': { fa: 'تعطیلات نوروز', en: 'Nowruz holiday', isHoliday: true },
  '1-4': { fa: 'تعطیلات نوروز', en: 'Nowruz holiday', isHoliday: true },
  '1-12': { fa: 'روز جمهوری اسلامی', en: 'Islamic Republic Day', isHoliday: true },
  '1-13': { fa: 'روز طبیعت، سیزده‌بدر', en: 'Nature Day (Sizdah Bedar)', isHoliday: true },
  '2-25': { fa: 'روز بزرگداشت حکیم ابوالقاسم فردوسی', en: 'Ferdowsi Day', isHoliday: false },
  '2-28': { fa: 'روز بزرگداشت حکیم عمر خیام', en: 'Omar Khayyam Day', isHoliday: false },
  '3-14': { fa: 'رحلت امام خمینی', en: 'Anniversary of Khomeini’s death', isHoliday: true },
  '3-15': { fa: 'قیام ۱۵ خرداد', en: '15 Khordad Uprising', isHoliday: true },
  '5-8': { fa: 'روز بزرگداشت شیخ فضل‌الله نوری / سهروردی', en: 'Sohrevardi Commemoration', isHoliday: false },
  '6-1': { fa: 'روز پزشک، بزرگداشت ابوعلی سینا', en: 'Doctor’s Day (Avicenna)', isHoliday: false },
  '7-8': { fa: 'روز بزرگداشت مولانا جلال‌الدین بلخی', en: 'Rumi Day', isHoliday: false },
  '7-20': { fa: 'روز بزرگداشت حافظ شیرازی', en: 'Hafez Day', isHoliday: false },
  '8-24': { fa: 'روز کتاب و کتاب‌خوانی', en: 'Book & Reading Day', isHoliday: false },
  '9-30': { fa: 'شب چله (یلدا)، کهن‌ترین جشن روشنایی', en: 'Yalda Night (Winter Solstice)', isHoliday: false },
  '11-22': { fa: 'پیروزی انقلاب اسلامی', en: 'Revolution Day', isHoliday: true },
  '12-29': { fa: 'روز ملی شدن صنعت نفت ایران', en: 'Oil Nationalization Day', isHoliday: true },
};

const GREGORIAN_EVENTS: Record<string, DayEvent> = {
  '1-1': { fa: 'آغاز سال نو میلادی', en: 'New Year’s Day', isHoliday: false },
  '2-14': { fa: 'روز ولنتاین (روز عشق)', en: 'Valentine’s Day', isHoliday: false },
  '3-8': { fa: 'روز جهانی زن', en: 'International Women’s Day', isHoliday: false },
  '3-20': { fa: 'اعتدال بهاری (نوروز جهانی)', en: 'Spring Equinox', isHoliday: false },
  '4-12': { fa: 'روز جهانی پرواز انسان به فضا (یوری گاگارین)', en: 'International Day of Human Space Flight', isHoliday: false },
  '4-22': { fa: 'روز جهانی زمین پاک', en: 'Earth Day', isHoliday: false },
  '6-21': { fa: 'انقلاب تابستانی', en: 'Summer Solstice', isHoliday: false },
  '7-20': { fa: 'سالروز نخستین فرود انسان بر سطح کره ماه (آپولو ۱۱)', en: 'Apollo 11 Moon Landing Day', isHoliday: false },
  '10-4': { fa: 'آغاز هفته جهانی فضا (پرتاب اسپوتنیک ۱)', en: 'World Space Week begins', isHoliday: false },
  '12-25': { fa: 'جشن کریسمس', en: 'Christmas Day', isHoliday: false },
};

export function getEventsForJdn(jdn: number): DayEvent[] {
  const j = d2j(jdn);
  const g = d2g(jdn);
  const events: DayEvent[] = [];

  const jKey = `${j.m}-${j.d}`;
  if (JALALI_EVENTS[jKey]) {
    events.push(JALALI_EVENTS[jKey]);
  }

  const gKey = `${g.m}-${g.d}`;
  if (GREGORIAN_EVENTS[gKey]) {
    events.push(GREGORIAN_EVENTS[gKey]);
  }

  return events;
}

const MOON_SYNODIC_MONTH = 29.530588853;
const MOON_PHASE_NAMES_FA = [
  'ماه نو (New Moon)',
  'هلال افزاینده (Waxing Crescent)',
  'تربیع اول (First Quarter)',
  'کوژ افزاینده (Waxing Gibbous)',
  'ماه کامل / بدر (Full Moon)',
  'کوژ کاهنده (Waning Gibbous)',
  'تربیع دوم (Last Quarter)',
  'هلال کاهنده (Waning Crescent)',
];

const MOON_PHASE_NAMES_EN = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

export function getMoonPhase(jdn: number): MoonPhaseInfo {
  const age = (((jdn - 2451550.26) % MOON_SYNODIC_MONTH) + MOON_SYNODIC_MONTH) % MOON_SYNODIC_MONTH;
  const phase = age / MOON_SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const index = Math.floor(phase * 8 + 0.5) % 8;

  return {
    phase,
    illumination,
    index,
    nameFa: MOON_PHASE_NAMES_FA[index],
    nameEn: MOON_PHASE_NAMES_EN[index],
  };
}

/** Render astronomical moon vector SVG representation */
export function getMoonSvg(phase: number): string {
  const r = 11;
  const c = 13;
  const rx = Math.max(0.1, r * Math.abs(Math.cos(2 * Math.PI * phase))).toFixed(2);
  const waxing = phase < 0.5;
  const limb = waxing ? 1 : 0;
  const term = waxing ? (phase < 0.25 ? 0 : 1) : phase > 0.75 ? 1 : 0;
  const d = `M${c} ${c - r}A${r} ${r} 0 0 ${limb} ${c} ${c + r}A${rx} ${r} 0 0 ${term} ${c} ${c - r}Z`;

  return `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" class="shrink-0 drop-shadow-md">
    <circle cx="${c}" cy="${c}" r="${r}" fill="#1e2238" stroke="rgba(148,163,184,0.3)" stroke-width="1"/>
    <path d="${d}" fill="#fde047" />
  </svg>`;
}

// Local Storage for Day Notes & Tasks keyed by JDN
const STORAGE_NOTES_KEY = 'orbit_calendar_notes_v1';

export function loadCalendarNotes(jdn: number): CalendarTaskNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all[jdn] || [];
  } catch (e) {
    console.warn('Could not load calendar notes:', e);
    return [];
  }
}

export function saveCalendarNote(jdn: number, text: string): CalendarTaskNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const list: CalendarTaskNote[] = all[jdn] || [];
    const newNote: CalendarTaskNote = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
    };
    const next = [...list, newNote];
    all[jdn] = next;
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(all));
    return next;
  } catch (e) {
    console.warn('Could not save calendar note:', e);
    return [];
  }
}

export function toggleCalendarNote(jdn: number, id: string): CalendarTaskNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const list: CalendarTaskNote[] = all[jdn] || [];
    const next = list.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
    all[jdn] = next;
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(all));
    return next;
  } catch (e) {
    console.warn('Could not toggle calendar note:', e);
    return [];
  }
}

export function deleteCalendarNote(jdn: number, id: string): CalendarTaskNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const list: CalendarTaskNote[] = all[jdn] || [];
    const next = list.filter((item) => item.id !== id);
    if (next.length === 0) {
      delete all[jdn];
    } else {
      all[jdn] = next;
    }
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(all));
    return next;
  } catch (e) {
    console.warn('Could not delete calendar note:', e);
    return [];
  }
}

export function getAllDatesWithNotes(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    if (!raw) return new Set();
    const all = JSON.parse(raw);
    const keys = Object.keys(all).filter((k) => all[k] && all[k].length > 0);
    return new Set(keys.map(Number));
  } catch {
    return new Set();
  }
}

/** Formats a JDN into standard Jalali DateKey (e.g. "1405-01-16") */
export function jdnToJalaliDateKey(jdn: number): string {
  const { y, m, d } = d2j(jdn);
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}
