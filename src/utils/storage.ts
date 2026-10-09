import { Journal, DayPage, AppSettings, CategoryOption, TemplateType, TimeBlockSlot, CustomHtmlTemplate } from '../types';
import { formatJalaliShort, getDateKey, formatJalaliDate, toPersianDigits } from './jalali';

export const STORAGE_KEY_JOURNALS = 'planner_journals_v4';
export const STORAGE_KEY_SETTINGS = 'planner_settings_v4';
export const STORAGE_KEY_CUSTOM_TEMPLATES = 'planner_custom_html_templates_v2';

export function loadStoredCustomTemplates(): CustomHtmlTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATES) || localStorage.getItem('planner_custom_html_templates');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load custom templates:', e);
    return [];
  }
}

export function saveStoredCustomTemplates(templates: CustomHtmlTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(templates));
    localStorage.setItem('planner_custom_html_templates', JSON.stringify(templates));
  } catch (e) {
    console.warn('Failed to save custom templates:', e);
  }
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'work', name: 'کار و تمرکز', color: '#86c5a5', icon: '💼' },
  { id: 'study', name: 'مطالعه و یادگیری', color: '#85b8d9', icon: '📚' },
  { id: 'health', name: 'ورزش و تندرستی', color: '#f4a261', icon: '🏃' },
  { id: 'meal', name: 'تغذیه و غذا', color: '#e9c46a', icon: '🥗' },
  { id: 'sleep', name: 'استراحت و خواب', color: '#9d94b8', icon: '💤' },
  { id: 'meeting', name: 'جلسه و مکالمه', color: '#f28482', icon: '👥' },
  { id: 'personal', name: 'امور شخصی', color: '#84dcc6', icon: '🌱' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.75,
  animationStyle: 'flip',
  autoRolloverTasks: true,
  theme: 'sage',
  colorMode: 'light',
  language: 'fa',
};

export function createEmptyTemplate2Page(): DayPage {
  const halfHourSlots: Record<string, TimeBlockSlot> = {};
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  hours.forEach((h) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    halfHourSlots[`${pad(h)}:00`] = { text: '', done: false };
    halfHourSlots[`${pad(h)}:30`] = { text: '', done: false };
  });

  return {
    templateType: 'template-2-one-big-thing',
    timeSlots: {},
    dialSectors: {},
    habits: [],
    dailyNotes: '',
    nonRoutine: {
      followUps: [],
      admin: [],
      docs: [],
      team: [],
      misc: [],
    },
    priorities: [],
    todos: [],
    oneBigThing: '',
    halfHourSlots,
    eisenhowerMatrix: {
      urgentImportant: [],
      importantNotUrgent: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    },
    brainDump: '',
  };
}

export function createEmptyTemplate3Page(): DayPage {
  return {
    templateType: 'template-3-writing-plans',
    timeSlots: {},
    dialSectors: {},
    habits: [],
    dailyNotes: '',
    nonRoutine: {
      followUps: [],
      admin: [],
      docs: [],
      team: [],
      misc: [],
    },
    priorities: [],
    todos: [],
    writingPlans: {
      currentProject: 'Hollow Pines (book 1) ♡',
      completedChapters: [1, 2, 3],
      wordCountGoal: 2000,
      currentWordCount: 1450,
      scenesStuckInHead: [
        'The discovery of the old key under the pine roots',
        'Rainstorm argument by the wooden porch',
        'Whispering fog creeping into the cabin window',
        '',
        '',
      ],
      characterThoughts:
        'She wants to protect her brother, but keeping the secret is slowly breaking her trust with the village...',
      linesILike: [
        'The forest was quiet, the kind of quiet that felt held like a breath.',
        'Some truths do not want to be found, they want to be left in the dark.',
        'Her hands smelled of damp pine needles and old paper.',
        '',
        '',
        '',
      ],
      inspirationPlaylist: [
        'Rivers and Roads - The Head and the Heart',
        'Holocene - Bon Iver',
        'Like Real People Do - Hozier',
        'Mystery of Love - Sufjan Stevens',
      ],
      coffeeCups: 3,
      dailyCheckIn: {
        q1: 5,
        q2: 4,
        q3: 4,
        q4: 3,
        q5: 4,
        q6: 5,
      },
    },
  };
}

export function createEmptyTemplate4Page(): DayPage {
  return {
    templateType: 'template-4-celestial-todo',
    timeSlots: {},
    dialSectors: {},
    habits: [],
    dailyNotes: '',
    nonRoutine: {
      followUps: [],
      admin: [],
      docs: [],
      team: [],
      misc: [],
    },
    priorities: [],
    todos: [],
    celestialTodo: {
      dailyBasics: {
        morning: [
          { id: 'm1', text: 'Brush teeth', done: true },
          { id: 'm2', text: 'Face care', done: true },
          { id: 'm3', text: 'Body / shower', done: false },
          { id: 'm4', text: 'Get dressed', done: true },
        ],
        home: [
          { id: 'h1', text: 'Unload dishwasher', done: true },
          { id: 'h2', text: 'Load dishwasher', done: false },
          { id: 'h3', text: 'Clean dining table', done: true },
          { id: 'h4', text: 'Clean kitchen counter', done: false },
          { id: 'h5', text: 'Vacuum', done: false },
          { id: 'h6', text: 'Tidy living room', done: false },
          { id: 'h7', text: 'Make / tidy beds', done: true },
          { id: 'h8', text: 'Check / take out trash', done: false },
          { id: 'h9', text: 'Cook / prepare food', done: false },
          { id: 'h10', text: 'Pick up for the night', done: false },
        ],
        meals: [
          { id: 'ml1', text: 'Eat breakfast', done: true },
          { id: 'ml2', text: 'Eat lunch', done: false },
          { id: 'ml3', text: 'Eat dinner', done: false },
          { id: 'ml4', text: 'Snack', done: false },
          { id: 'ml5', text: 'Drink water', done: true },
        ],
        night: [
          { id: 'n1', text: 'Brush teeth', done: false },
          { id: 'n2', text: 'Face care', done: false },
          { id: 'n3', text: 'Tidy for tomorrow', done: false },
          { id: 'n4', text: 'Relax & recharge', done: false },
        ],
      },
      todayTasks: [
        { id: 'tt1', text: 'Review weekly priorities and plan calendar', done: true },
        { id: 'tt2', text: 'Send project update email to team', done: true },
        { id: 'tt3', text: 'Draft chapter overview and notes', done: false },
        { id: 'tt4', text: 'Call pharmacy and pick up prescription', done: false },
        { id: 'tt5', text: '30-minute evening walk in the park', done: false },
        { id: 'tt6', text: '', done: false },
        { id: 'tt7', text: '', done: false },
        { id: 'tt8', text: '', done: false },
        { id: 'tt9', text: '', done: false },
        { id: 'tt10', text: '', done: false },
        { id: 'tt11', text: '', done: false },
        { id: 'tt12', text: '', done: false },
        { id: 'tt13', text: '', done: false },
        { id: 'tt14', text: '', done: false },
        { id: 'tt15', text: '', done: false },
        { id: 'tt16', text: '', done: false },
        { id: 'tt17', text: '', done: false },
        { id: 'tt18', text: '', done: false },
        { id: 'tt19', text: '', done: false },
      ],
    },
  };
}

export function createEmptyDayPage(templateType: TemplateType = 'template-1-green', customHtmlContent?: string): DayPage {
  if (templateType === 'template-custom-html') {
    return {
      templateType: 'template-custom-html',
      customHtmlContent: customHtmlContent || '',
      timeSlots: {},
      dialSectors: {},
      habits: [],
      dailyNotes: '',
      nonRoutine: {
        followUps: [],
        admin: [],
        docs: [],
        team: [],
        misc: [],
      },
      priorities: [],
      todos: [],
    };
  }
  if (templateType === 'template-2-one-big-thing') {
    return createEmptyTemplate2Page();
  }
  if (templateType === 'template-3-writing-plans') {
    return createEmptyTemplate3Page();
  }
  if (templateType === 'template-4-celestial-todo') {
    return createEmptyTemplate4Page();
  }
  return {
    templateType: 'template-1-green',
    timeSlots: {},
    dialSectors: {},
    habits: [
      { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: false },
      { id: 'h2', text: 'ورزش یا پیاده‌روی صبحگاهی 🏃', done: false },
      { id: 'h3', text: '۲۰ دقیقه مطالعه کتاب تخصصی 📖', done: false },
      { id: 'h4', text: 'بررسی اولویت‌ها و اهداف روز 🎯', done: false },
    ],
    dailyNotes: '',
    nonRoutine: {
      followUps: [''],
      admin: [''],
      docs: [''],
      team: [''],
      misc: [''],
    },
    priorities: [
      { text: '', done: false },
      { text: '', done: false },
      { text: '', done: false },
    ],
    todos: [
      { id: 't1', text: '', done: false },
      { id: 't2', text: '', done: false },
      { id: 't3', text: '', done: false },
    ],
  };
}

export const INITIAL_JOURNALS: Journal[] = [
  {
    id: 'journal_1',
    title: 'پلنر تمرکز و عادات',
    color: '#5fa8e8',
    theme: 'sage',
    starred: true,
    createdAt: '۱۴۰۵/۰۶/۱۳',
    pages: {
      '2026-10-03': {
        timeSlots: {
          8: { text: 'بررسی پروژه‌های کاری و ایمیل‌ها', color: '#86c5a5', cat: 'work' },
          9: { text: 'تمرکز روی ماژول اصلی برنامه', color: '#86c5a5', cat: 'work' },
          10: { text: 'طراحی ساختار داده و معماری', color: '#86c5a5', cat: 'work' },
          13: { text: 'ناهار و پیاده‌روی کوتاه', color: '#e9c46a', cat: 'meal' },
          16: { text: 'جلسه هماهنگی هفتگی تیم', color: '#f28482', cat: 'meeting' },
          19: { text: 'ورزش عصرگاهی و کشش', color: '#f4a261', cat: 'health' },
          21: { text: 'مطالعه ۲۰ صفحه کتاب فنی', color: '#85b8d9', cat: 'study' },
        },
        habits: [
          { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: true },
          { id: 'h2', text: 'ورزش یا پیاده‌روی 🏃', done: true },
          { id: 'h3', text: '۲۰ دقیقه مطالعه کتاب 📖', done: false },
          { id: 'h4', text: 'بررسی اولویت‌ها و عادات 🎯', done: true },
        ],
        dailyNotes: 'روز بسیار پرانرژی و متمرکز. پیشرفت فوق‌العاده در پیاده‌سازی سیستم پلنر با انیمیشن‌های روان.',
        nonRoutine: {
          followUps: ['پیگیری ارسال گزارش به مدیر پروژه'],
          admin: ['تایید فاکتورهای ماهانه سرور'],
          docs: ['به‌روزرسانی مستندات معماری در مخزن'],
          team: ['بررسی پول‌ریکوئست‌های ارسالی اعضا'],
          misc: ['پشتیبان‌گیری از فایل‌های لوکال'],
        },
        priorities: [
          { text: 'اتمام توسعه کامل کامپوننت‌های پلنر', done: true },
          { text: 'تنظیم دقیق تقویم شمسی و کرونودکس ۲۴ ساعته', done: true },
          { text: 'بررسی هماهنگی افکت‌های صوتی و پوسته‌ها', done: false },
        ],
        todos: [
          { id: 't1', text: 'ارسال ایمیل خلاصه تسک‌ها', done: true },
          { id: 't2', text: 'تست عملکرد روی نمایشگر تبلت و موبایل', done: false },
          { id: 't3', text: 'آماده‌سازی راهنمای استفاده و خروجی .md', done: true },
        ],
      },
      '2026-10-04': {
        timeSlots: {
          7: { text: 'ورزش و دویدن صبحگاهی', color: '#f4a261', cat: 'health' },
          9: { text: 'طراحی رابط کاربری و انیمیشن‌ها', color: '#86c5a5', cat: 'work' },
          11: { text: 'کدنویسی ماژول‌های نمای کلی برگه‌ها', color: '#86c5a5', cat: 'work' },
          13: { text: 'استراحت و ناهار', color: '#e9c46a', cat: 'meal' },
          15: { text: 'مطالعه مستندات فنی و طراحی', color: '#85b8d9', cat: 'study' },
          18: { text: 'تماس تلفنی با منتور', color: '#f28482', cat: 'meeting' },
          22: { text: 'مرور اهداف فردا و خواب آرام', color: '#9d94b8', cat: 'sleep' },
        },
        habits: [
          { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: true },
          { id: 'h2', text: 'ورزش یا پیاده‌روی 🏃', done: true },
          { id: 'h3', text: '۲۰ دقیقه مطالعه کتاب 📖', done: true },
          { id: 'h4', text: 'بررسی اولویت‌ها و عادات 🎯', done: false },
        ],
        dailyNotes: 'روز یکشنبه بسیار پربازده؛ تکمیل قالب‌های نمای کلی و تست هماهنگی کرونودکس.',
        nonRoutine: {
          followUps: ['ارسال نسخه دمو به کارفرما'],
          admin: ['بررسی اشتراک سرویس‌ها'],
          docs: ['نوشتن راهنمای کاربری'],
          team: [],
          misc: [],
        },
        priorities: [
          { text: 'طراحی نمای مینیاتوری برگه روز یکشنبه', done: true },
          { text: 'بررسی عملکرد روان روی مرورگر موبایل', done: true },
          { text: 'آماده‌سازی خروجی اسناد روزانه', done: false },
        ],
        todos: [
          { id: 't1', text: 'ثبت تسک‌های هفتگی در دفترچه', done: true },
          { id: 't2', text: 'پشتیبان‌گیری از تغییرات', done: true },
        ],
      },
      '2026-10-05': {
        timeSlots: {
          8: { text: 'برنامه‌ریزی تسک‌های دوشنبه', color: '#86c5a5', cat: 'work' },
          10: { text: 'جلسه بازبینی اسپرینت با تیم', color: '#f28482', cat: 'meeting' },
          14: { text: 'توسعه فیچرهای جدید پلنر', color: '#86c5a5', cat: 'work' },
          17: { text: 'مطالعه کتاب زبان تخصصی', color: '#85b8d9', cat: 'study' },
          20: { text: 'باشگاه بدنسازی', color: '#f4a261', cat: 'health' },
        },
        habits: [
          { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: true },
          { id: 'h2', text: 'ورزش یا پیاده‌روی 🏃', done: false },
          { id: 'h3', text: '۲۰ دقیقه مطالعه کتاب 📖', done: true },
          { id: 'h4', text: 'بررسی اولویت‌ها و عادات 🎯', done: true },
        ],
        dailyNotes: 'آغاز پرانرژی هفته کاری با برنامه‌ریزی منسجم و تمرکز بر اولویت‌ها.',
        nonRoutine: {
          followUps: ['پیگیری تاییدیه نسخه نهایی'],
          admin: [],
          docs: ['ثبت تغییرات در لاگ'],
          team: ['برگزاری جلسه استندآپ'],
          misc: [],
        },
        priorities: [
          { text: 'جلسه هماهنگی هفتگی پروژه‌ها', done: true },
          { text: 'بررسی پول‌ریکوئست‌های ارسالی', done: true },
          { text: 'ارزیابی متریک‌های عملکردی', done: false },
        ],
        todos: [
          { id: 't1', text: 'بررسی گزارش‌های خودکار سرور', done: true },
        ],
      },
      '2026-10-02': {
        timeSlots: {
          9: { text: 'جلسه آغازین هفته', color: '#f28482', cat: 'meeting' },
          11: { text: 'طراحی اسکچ‌های اولیه دفترچه', color: '#85b8d9', cat: 'study' },
        },
        habits: [
          { id: 'h1', text: '۸ لیوان آب مصرف روزانه 💧', done: true },
          { id: 'h2', text: 'ورزش یا پیاده‌روی 🏃', done: false },
        ],
        dailyNotes: 'برنامه‌ریزی دقیق کارهای هفته و هدف‌گذاری منظم.',
        nonRoutine: {
          followUps: ['تماس با پشتیبانی زیرساخت'],
          admin: [],
          docs: [],
          team: [],
          misc: [],
        },
        priorities: [
          { text: 'جلسه بازبینی اسپرینت', done: true },
          { text: 'تایید پروتوتایپ اولیه', done: true },
          { text: 'تنظیم بک‌لاگ تسک‌ها', done: true },
        ],
        todos: [
          { id: 't1', text: 'مرتب‌سازی یادداشت‌ها', done: true },
        ],
      },
    },
  },
  {
    id: 'journal_2',
    title: 'Untitled 2',
    color: '#6bb371',
    theme: 'sage',
    starred: false,
    createdAt: '۱۴۰۵/۰۶/۱۳',
    pages: {
      '2026-10-03': createEmptyDayPage(),
      '2026-10-02': createEmptyDayPage(),
      '2026-10-01': createEmptyDayPage(),
    },
  },
  {
    id: 'journal_3',
    title: 'notebook 22',
    color: '#d46747',
    theme: 'latte',
    starred: true,
    createdAt: '۱۴۰۵/۰۶/۱۳',
    pages: {
      '2026-10-03': createEmptyDayPage(),
      '2026-10-02': createEmptyDayPage(),
      '2026-10-01': createEmptyDayPage(),
    },
  },
];

export function isValidJournal(item: any): item is Journal {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.pages === 'object' &&
    item.pages !== null
  );
}

export function loadStoredJournals(): Journal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOURNALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validJournals = parsed.filter(isValidJournal);
        if (validJournals.length > 0) {
          return validJournals;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored journals:', err);
  }
  return INITIAL_JOURNALS;
}

export function saveStoredJournals(journals: Journal[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(journals));
    return true;
  } catch (err) {
    console.warn('Failed to save journals to localStorage:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('planner_storage_error', {
          detail: { message: 'حافظه مرورگر پر شده است یا امکان ذخیره محلی وجود ندارد!' },
        })
      );
    }
    return false;
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export function exportJournalToMarkdown(journal: Journal, date: Date, page: DayPage): string {
  const dateFormatted = formatJalaliDate(date);
  const dateKey = getDateKey(date);

  let md = `# 📅 ${journal.title} — ${dateFormatted} (${dateKey})\n\n`;

  if (page.templateType === 'template-2-one-big-thing') {
    md += `## 🎯 THE ONE BIG THING\n`;
    md += `${page.oneBigThing ? `> **${page.oneBigThing}**` : '_هدف اصلی ثبت نشده است._'}\n\n`;

    md += `## 🕒 TIME BLOCKING (8 AM - 6 PM)\n`;
    const slots = page.halfHourSlots || {};
    const slotKeys = Object.keys(slots).sort();
    if (slotKeys.some((k) => slots[k]?.text?.trim())) {
      md += `| زمان | فعالیت | وضعیت |\n`;
      md += `| :--- | :--- | :---: |\n`;
      slotKeys.forEach((key) => {
        const item = slots[key];
        if (item && item.text?.trim()) {
          md += `| ${key} | ${item.text} | ${item.done ? '✅ تکمیل شده' : '⏳ در حال انجام'} |\n`;
        }
      });
    } else {
      md += `_بازه زمانی پر نشده است._\n`;
    }
    md += `\n`;

    md += `## 🧭 EISENHOWER PRIORITY MATRIX\n\n`;
    const matrix = page.eisenhowerMatrix;
    md += `### 🔴 URGENT & IMPORTANT (فوری و مهم)\n`;
    if (matrix?.urgentImportant && matrix.urgentImportant.length > 0) {
      matrix.urgentImportant.forEach((m) => {
        md += `- [${m.done ? 'x' : ' '}] ${m.text}\n`;
      });
    } else {
      md += `_موردی ثبت نشده است._\n`;
    }
    md += `\n`;

    md += `### 🔵 IMPORTANT, NOT URGENT (مهم، غیرفوری)\n`;
    if (matrix?.importantNotUrgent && matrix.importantNotUrgent.length > 0) {
      matrix.importantNotUrgent.forEach((m) => {
        md += `- [${m.done ? 'x' : ' '}] ${m.text}\n`;
      });
    } else {
      md += `_موردی ثبت نشده است._\n`;
    }
    md += `\n`;

    md += `### 🟡 URGENT, NOT IMPORTANT (فوری، غیرمهم)\n`;
    if (matrix?.urgentNotImportant && matrix.urgentNotImportant.length > 0) {
      matrix.urgentNotImportant.forEach((m) => {
        md += `- [${m.done ? 'x' : ' '}] ${m.text}\n`;
      });
    } else {
      md += `_موردی ثبت نشده است._\n`;
    }
    md += `\n`;

    md += `### ⚪ NOT URGENT, NOT IMPORTANT (غیرفوری، غیرمهم)\n`;
    if (matrix?.notUrgentNotImportant && matrix.notUrgentNotImportant.length > 0) {
      matrix.notUrgentNotImportant.forEach((m) => {
        md += `- [${m.done ? 'x' : ' '}] ${m.text}\n`;
      });
    } else {
      md += `_موردی ثبت نشده است._\n`;
    }
    md += `\n`;

    md += `## 🧠 BRAIN DUMP\n`;
    md += `${page.brainDump ? page.brainDump : '_یادداشتی ثبت نشده است._'}\n\n`;

    md += `---\n_تولید شده با سیستم دیجیتال پلنر و ژورنال روزانه (قالب شماره ۲: The One Big Thing)_\n`;
    return md;
  }

  if (page.templateType === 'template-3-writing-plans' && page.writingPlans) {
    const wp = page.writingPlans;
    md += `## 🌲 CURRENT PROJECT\n`;
    md += `> **${wp.currentProject || 'Untitled Project'}**\n\n`;

    md += `## 📖 CHAPTER TRACKER\n`;
    md += `فصل‌های تکمیل‌شده: ${
      wp.completedChapters.length > 0
        ? wp.completedChapters.sort((a, b) => a - b).join('، ')
        : 'هنوز فصلی ثبت نشده است'
    } (از ۲۵ فصل)\n\n`;

    md += `## ✍️ WORD COUNT\n`;
    md += `- **هدف کلمات:** ${wp.wordCountGoal}\n`;
    md += `- **کلمات نوشته شده:** ${wp.currentWordCount}\n\n`;

    md += `## 💭 SCENES STUCK IN MY HEAD\n`;
    (wp.scenesStuckInHead || []).filter(Boolean).forEach((s) => {
      md += `- ${s}\n`;
    });
    md += `\n`;

    md += `## 👤 CHARACTER THOUGHTS\n`;
    md += `> ${wp.characterThoughts || '_موردی ثبت نشده است._'}\n\n`;

    md += `## 💖 LINES I ACTUALLY LIKE\n`;
    (wp.linesILike || []).filter(Boolean).forEach((l) => {
      md += `- "${l}"\n`;
    });
    md += `\n`;

    md += `## 🎧 INSPIRATION PLAYLIST\n`;
    (wp.inspirationPlaylist || []).filter(Boolean).forEach((p) => {
      md += `- 🎵 ${p}\n`;
    });
    md += `\n`;

    md += `## ☕ LATE NIGHT WRITING METER\n`;
    md += `میزان مصرف قهوه: ${'☕'.repeat(wp.coffeeCups || 0)} (${wp.coffeeCups} از ۵ فنجان)\n\n`;

    md += `## ✨ DAILY WRITING CHECK-IN\n`;
    const checkInQuestions = [
      { id: 'q1', text: 'Did I show up today?' },
      { id: 'q2', text: 'Did I enjoy what I wrote?' },
      { id: 'q3', text: 'Did I learn something new?' },
      { id: 'q4', text: 'Did I get out of my head?' },
      { id: 'q5', text: 'Did I move the story forward?' },
      { id: 'q6', text: 'Am I proud of myself?' },
    ];
    const scoreLabels = ['', 'Not Really', 'A Little', 'Kind Of', 'Yes!', 'Heck Yes'];
    checkInQuestions.forEach((q) => {
      const score = wp.dailyCheckIn?.[q.id] || 0;
      md += `- **${q.text}:** ${scoreLabels[score] || 'ثبت نشده'}\n`;
    });
    md += `\n`;

    md += `---\n_تولید شده با سیستم دیجیتال پلنر و ژورنال روزانه (قالب شماره ۳: Writing Plans)_\n`;
    return md;
  }

  if (page.templateType === 'template-4-celestial-todo' && page.celestialTodo) {
    const ct = page.celestialTodo;
    md += `## ✦ DAILY BASICS\n\n`;

    md += `### ☀️ Morning\n`;
    ct.dailyBasics.morning.forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;

    md += `### 🏠 Home\n`;
    ct.dailyBasics.home.forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;

    md += `### 🍽️ Meals\n`;
    ct.dailyBasics.meals.forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;

    md += `### ☾ Night\n`;
    ct.dailyBasics.night.forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;

    md += `## 📋 TODAY'S TASKS\n`;
    ct.todayTasks.filter((t) => t.text.trim()).forEach((t) => {
      md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
    });
    md += `\n`;

    md += `---\n_تولید شده با سیستم دیجیتال پلنر و ژورنال روزانه (قالب شماره ۴: Daily To-Do List کیهانی)_\n`;
    return md;
  }

  md += `## ⭐ ۳ اولویت اصلی روز\n`;
  if (page.priorities && page.priorities.length > 0) {
    page.priorities.forEach((p, idx) => {
      md += `${toPersianDigits(idx + 1)}. [${p.done ? 'x' : ' '}] ${p.text || '_(بدون عنوان)_'}\n`;
    });
  } else {
    md += `_اولویت ثبت نشده است._\n`;
  }
  md += `\n`;

  md += `## 🕒 زمان‌بندی روزانه (Time Blocking & Chronodex)\n`;
  const timeEntries = Object.entries(page.timeSlots || {})
    .map(([h, slot]) => ({ h: parseInt(h, 10), slot }))
    .filter((e) => e.slot.text && e.slot.text.trim().length > 0)
    .sort((a, b) => a.h - b.h);

  if (timeEntries.length > 0) {
    md += `| ساعت | برنامه | دسته‌بندی |\n`;
    md += `| :--- | :--- | :--- |\n`;
    timeEntries.forEach(({ h, slot }) => {
      const hourStr = `${toPersianDigits(h)}:00`;
      md += `| ${hourStr} | ${slot.text} | ${slot.cat || 'عمومی'} |\n`;
    });
  } else {
    md += `_زمان‌بندی برای این روز ثبت نشده است._\n`;
  }
  md += `\n`;

  md += `## ✨ عادات و روتین‌های روزانه\n`;
  if (page.habits && page.habits.length > 0) {
    page.habits.forEach((h) => {
      md += `- [${h.done ? 'x' : ' '}] ${h.text}\n`;
    });
  } else {
    md += `_عادت فعالی تعریف نشده است._\n`;
  }
  md += `\n`;

  md += `## 📌 کارهای غیر روتین\n`;
  const nrMap: Record<string, string> = {
    followUps: 'پیگیری‌ها',
    admin: 'امور اداری و سازمانی',
    docs: 'مستندات و مکاتبات',
    team: 'تفویض وظایف تیم',
    misc: 'وظایف جانبی و متفرقه',
  };
  Object.entries(page.nonRoutine || {}).forEach(([k, list]) => {
    const stringList = (list as string[]) || [];
    const valid = stringList.filter((item: string) => item && item.trim().length > 0);
    if (valid.length > 0) {
      md += `### ${nrMap[k] || k}\n`;
      valid.forEach((t: string) => {
        md += `- ${t}\n`;
      });
    }
  });
  md += `\n`;

  md += `## 📋 لیست تسک‌ها و کارها\n`;
  if (page.todos && page.todos.length > 0) {
    page.todos.forEach((t) => {
      if (t.text && t.text.trim()) {
        md += `- [${t.done ? 'x' : ' '}] ${t.text}\n`;
      }
    });
  }
  md += `\n`;

  md += `## ✍️ یادداشت‌ها و بازتاب روز\n`;
  md += `> ${page.dailyNotes || '_(یادداشتی برای این روز ثبت نشده است)_'}\n\n`;

  md += `---\n_تولید شده با سیستم دیجیتال پلنر و ژورنال روزانه_\n`;
  return md;
}
