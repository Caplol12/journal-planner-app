import { Language } from '../types';
import { toPersianDigits } from './jalali';

export interface Translations {
  // Brand & Navigation
  brandTitle: string;
  brandSubtitle: string;
  newJournal: string;
  allJournals: string;
  templates: string;
  favorites: string;
  orbitCalendar: string;
  usersAndMembers: string;
  settings: string;
  serverAndCloud: string;
  soundFeedback: string;
  backupAndRestore: string;
  enabled: string;
  disabled: string;
  solar: string;
  cloud: string;
  closeMenu: string;

  // Dashboard & Catalog
  myJournals: string;
  templatesTabTitle: string;
  favoritesGalleryTitle: string;
  myJournalsSubtitle: (count: number) => string;
  templatesTabSubtitle: string;
  favoritesSubtitle: string;
  searchJournalPlaceholder: string;
  searchTemplatePlaceholder: string;
  uploadHtmlTemplate: string;
  templateCountLabel: (count: number) => string;
  liveTest: string;
  addToJournal: string;
  deleteTemplateConfirm: string;
  noJournalsFound: string;
  createNewJournalPrompt: string;
  useTemplateModalTitle: (templateTitle: string) => string;
  chooseNotebookPrompt: string;
  createNewNotebookWithTemplate: string;
  pageCountLabel: (count: number) => string;
  addSheetPrompt: string;

  // Settings View
  settingsHeaderTitle: string;
  settingsHeaderSubtitle: string;
  backToDashboard: string;
  saveChanges: string;

  // Section 1: Language
  languageSectionTitle: string;
  languageSectionDesc: string;
  persianOption: string;
  persianOptionDesc: string;
  englishOption: string;
  englishOptionDesc: string;

  // Section 2: Appearance & Theme
  appearanceSectionTitle: string;
  appearanceSectionDesc: string;
  lightMode: string;
  darkMode: string;
  systemMode: string;
  journalPresetsTitle: string;
  themeSage: string;
  themeLatte: string;
  themeMidnight: string;
  themePlum: string;
  themeOled: string;
  themeRose: string;

  // Section 3: Animations & Flip
  animationSectionTitle: string;
  animationSectionDesc: string;
  flipAnim: string;
  flipAnimDesc: string;
  slideAnim: string;
  slideAnimDesc: string;
  fadeAnim: string;
  fadeAnimDesc: string;
  noneAnim: string;
  noneAnimDesc: string;

  // Section 4: Audio & Feedback
  audioSectionTitle: string;
  audioSectionDesc: string;
  soundToggleLabel: string;
  soundToggleDesc: string;
  volumeSliderLabel: string;
  testAudioEffects: string;
  testFlip: string;
  testTick: string;
  testAdd: string;
  testSwoosh: string;

  // Section 5: Task Management
  tasksSectionTitle: string;
  tasksSectionDesc: string;
  autoRolloverLabel: string;
  autoRolloverDesc: string;

  // Section 6: Backup & Storage
  backupSectionTitle: string;
  backupSectionDesc: string;
  exportJsonBackup: string;
  importJsonBackup: string;
  resetAllData: string;
  resetConfirmWarning: string;
  storageUsageTitle: string;
  totalJournalsStat: string;
  totalPagesStat: string;
  storageEstimateStat: string;

  // Section 7: App Details
  aboutSectionTitle: string;
  aboutSectionDesc: string;
  appVersionLabel: string;
  buildStatusLabel: string;
}

const FA_TRANSLATIONS: Translations = {
  // Brand & Navigation
  brandTitle: 'استراتژی',
  brandSubtitle: 'دفترچه و پلنر روزانه',
  newJournal: 'ژورنال جدید',
  allJournals: 'همه ژورنال‌ها',
  templates: 'قالب‌ها',
  favorites: 'علاقه‌مندی‌ها',
  orbitCalendar: 'تقویم مدار',
  usersAndMembers: 'کاربران و اعضا',
  settings: 'تنظیمات برنامه',
  serverAndCloud: 'تنظیمات و سرور',
  soundFeedback: 'بازخورد صوتی',
  backupAndRestore: 'پشتیبان‌گیری و بازیابی',
  enabled: 'فعال',
  disabled: 'خاموش',
  solar: 'شمسی',
  cloud: 'کلود',
  closeMenu: 'بستن منو',

  // Dashboard & Catalog
  myJournals: 'ژورنال‌های من',
  templatesTabTitle: 'قالب‌های برگه پلنر روزانه',
  favoritesGalleryTitle: 'گالری قالب‌های برگزیده',
  myJournalsSubtitle: (count) => `شامل ${toPersianDigits(count)} ژورنال شخصی`,
  templatesTabSubtitle: 'الگوهای استاندارد برگه پلنر با ساختار یکپارچه کرونودکس ۲۴ ساعته، زمان‌بندی خطی و عادات',
  favoritesSubtitle: 'مرور سریع تمام برگه‌های برگزیده در سراسر دفترچه‌ها',
  searchJournalPlaceholder: 'جستجوی عنوان ژورنال...',
  searchTemplatePlaceholder: 'جستجوی عنوان قالب...',
  uploadHtmlTemplate: 'بارگذاری قالب (.html)',
  templateCountLabel: (count) => `${toPersianDigits(count)} قالب`,
  liveTest: 'تست زنده',
  addToJournal: 'استفاده از برگه',
  deleteTemplateConfirm: 'آیا از حذف این قالب سفارشی اطمینان دارید؟',
  noJournalsFound: 'ژورنالی مطابق با جستجو یافت نشد.',
  createNewJournalPrompt: '+ ساخت ژورنال جدید',
  useTemplateModalTitle: (title) => `استفاده از ${title}`,
  chooseNotebookPrompt: 'این برگه را به کدام‌یک از دفترچه‌های خود اضافه می‌کنید؟',
  createNewNotebookWithTemplate: 'ایجاد یک دفترچه جدید با این برگه',
  pageCountLabel: (count) => `${toPersianDigits(count)} برگه`,
  addSheetPrompt: 'افزودن برگه ↵',

  // Settings View
  settingsHeaderTitle: 'تنظیمات و سفارشی‌سازی برنامه',
  settingsHeaderSubtitle: 'مدیریت زبان، ظاهر، جلوه‌های صوتی، انیمیشن‌ها و پشتیبان‌گیری',
  backToDashboard: 'بازگشت به ژورنال‌ها',
  saveChanges: 'تنظیمات با موفقیت ذخیره شد',

  // Section 1: Language
  languageSectionTitle: 'زبان و بومی‌سازی (Language)',
  languageSectionDesc: 'انتخاب زبان محیط برنامه و جهت متن‌ها (راست‌به‌چپ یا چپ‌به‌راست)',
  persianOption: 'فارسی (Persian)',
  persianOptionDesc: 'چینش راست‌به‌چپ (RTL)، تقویم و ارقام فارسی',
  englishOption: 'English (انگلیسی)',
  englishOptionDesc: 'Left-to-Right layout, Western numbers & dates',

  // Section 2: Appearance & Theme
  appearanceSectionTitle: 'حالت رنگی و پوسته (Appearance)',
  appearanceSectionDesc: 'تنظیم پس‌زمینه روزانه، تم شب و پالت اختصاصی دفترچه‌ها',
  lightMode: 'تم روشن (Light)',
  darkMode: 'تم تاریک (Dark)',
  systemMode: 'هماهنگ با سیستم (Auto)',
  journalPresetsTitle: 'پوسته‌های پیش‌فرض دفترچه',
  themeSage: 'سبز مریم‌گلی (Sage)',
  themeLatte: 'لته خاکی (Latte)',
  themeMidnight: 'شب لاجوردی (Midnight)',
  themePlum: 'آلبالویی ملایم (Plum)',
  themeOled: 'مشکی زغالی مطلق (OLED)',
  themeRose: 'رز گچی (Rose)',

  // Section 3: Animations & Flip
  animationSectionTitle: 'انیمیشن و تعویض برگه‌ها (Page Transitions)',
  animationSectionDesc: 'نوع جلوه بصری هنگام ورق‌زدن روزهای پلنر و باز کردن دفترچه‌ها',
  flipAnim: 'ورق‌زدن سه‌بعدی کتابی (3D Flip)',
  flipAnimDesc: 'احساس ورق زدن دفترچه فیزیکی لوکس و کلاسیک',
  slideAnim: 'اسلاید نرم افقی (Smooth Slide)',
  slideAnimDesc: 'حرکت خطی و پیوسته برگه‌ها با رندر فوق‌سریع',
  fadeAnim: 'محو شدن نئوکلاسیک (Soft Fade)',
  fadeAnimDesc: 'ترنزیشن ملایم و آرامش‌بخش متمرکز بر محتوا',
  noneAnim: 'بدون انیمیشن (Instant)',
  noneAnimDesc: 'تعویض آنی صفحات بدون تاخیر فریم',

  // Section 4: Audio & Feedback
  audioSectionTitle: 'صدا و بازخورد صوتی (Audio & Haptics)',
  audioSectionDesc: 'صدای ملایم تیک زدن تسک‌ها، ورق خوردن برگه‌ها و عملکرد قلم',
  soundToggleLabel: 'پخش افکت‌های صوتی تعاملی',
  soundToggleDesc: 'شبیه‌سازی صدای ارگانیک کاغذ، قلم و تیک چک‌باکس',
  volumeSliderLabel: 'بلندی صدا',
  testAudioEffects: 'آزمایش صداها',
  testFlip: 'ورق زدن برگه',
  testTick: 'تیک تسک',
  testAdd: 'افزودن آیتم',
  testSwoosh: 'جابجایی نرم',

  // Section 5: Task Management
  tasksSectionTitle: 'مدیریت وظایف و بهره‌وری (Productivity)',
  tasksSectionDesc: 'رفتار خودکار برنامه برای تسک‌های روزانه و عادات پیگیری',
  autoRolloverLabel: 'انتقال خودکار تسک‌های ناتمام به روز بعد',
  autoRolloverDesc: 'کارهایی که در پایان روز تیک نخورده‌اند، به صبح فردا منتقل می‌شوند.',

  // Section 6: Backup & Storage
  backupSectionTitle: 'پشتیبان‌گیری و داده‌ها (Data Management)',
  backupSectionDesc: 'ذخیره کامل اطلاعات به صورت فایل آفلاین JSON یا بازیابی سریع اطلاعات',
  exportJsonBackup: 'دانلود نسخه پشتیبان (JSON)',
  importJsonBackup: 'بازیابی از فایل پشتیبان',
  resetAllData: 'ریست و پاک‌سازی داده‌های محلی',
  resetConfirmWarning: 'آیا اطمینان دارید؟ تمام ژورنال‌ها و تغییرات محلی حذف شده و برنامه به حالت پیش‌فرض بازمی‌گردد.',
  storageUsageTitle: 'وضعیت حافظه و داده‌های محلی',
  totalJournalsStat: 'تعداد کل ژورنال‌ها',
  totalPagesStat: 'تعداد کل صفحات ثبت‌شده',
  storageEstimateStat: 'حجم اشغال‌شده در مرورگر',

  // Section 7: App Details
  aboutSectionTitle: 'درباره برنامه استراتژی (About Strategy)',
  aboutSectionDesc: 'سیستم مینیمال یادداشت‌برداری، برنامه‌ریزی روزانه و تمرکز بر هدف',
  appVersionLabel: 'نسخه ۲.۰ — معماری مینیمال عملکردی (Functional Minimalism)',
  buildStatusLabel: 'محیط محلی و بدون ردیابی (Local-first & Privacy-first)',
};

const EN_TRANSLATIONS: Translations = {
  // Brand & Navigation
  brandTitle: 'Strategy',
  brandSubtitle: 'Daily Planner & Journal',
  newJournal: 'New Journal',
  allJournals: 'All Journals',
  templates: 'Templates',
  favorites: 'Favorites',
  orbitCalendar: 'Orbit Calendar',
  usersAndMembers: 'Users & Members',
  settings: 'App Settings',
  serverAndCloud: 'Server & Cloud',
  soundFeedback: 'Sound Feedback',
  backupAndRestore: 'Backup & Restore',
  enabled: 'Enabled',
  disabled: 'Disabled',
  solar: 'Solar',
  cloud: 'Cloud',
  closeMenu: 'Close Menu',

  // Dashboard & Catalog
  myJournals: 'My Journals',
  templatesTabTitle: 'Daily Planner Templates',
  favoritesGalleryTitle: 'Curated Favorites Gallery',
  myJournalsSubtitle: (count) => `Includes ${count} personal journals`,
  templatesTabSubtitle: 'Standard planner sheet templates with 24H Chronodex, linear time blocking, and habit tracker',
  favoritesSubtitle: 'Quickly browse all starred pages across all notebooks',
  searchJournalPlaceholder: 'Search journal title...',
  searchTemplatePlaceholder: 'Search template title...',
  uploadHtmlTemplate: 'Upload Template (.html)',
  templateCountLabel: (count) => `${count} Templates`,
  liveTest: 'Live Test',
  addToJournal: 'Use Sheet',
  deleteTemplateConfirm: 'Are you sure you want to delete this custom template?',
  noJournalsFound: 'No journals found matching your search.',
  createNewJournalPrompt: '+ Create New Journal',
  useTemplateModalTitle: (title) => `Use ${title}`,
  chooseNotebookPrompt: 'Which notebook would you like to add this sheet to?',
  createNewNotebookWithTemplate: 'Create a New Notebook with this Sheet',
  pageCountLabel: (count) => `${count} pages`,
  addSheetPrompt: 'Add Sheet ↵',

  // Settings View
  settingsHeaderTitle: 'Application Settings & Preferences',
  settingsHeaderSubtitle: 'Manage language, themes, sound effects, animations, and data backup',
  backToDashboard: 'Back to Journals',
  saveChanges: 'Settings saved successfully',

  // Section 1: Language
  languageSectionTitle: 'Language & Localization',
  languageSectionDesc: 'Select user interface language and layout direction (RTL or LTR)',
  persianOption: 'فارسی (Persian)',
  persianOptionDesc: 'راست‌به‌چپ (RTL), تقویم و ارقام فارسی',
  englishOption: 'English',
  englishOptionDesc: 'Left-to-Right layout, Western numbers & dates',

  // Section 2: Appearance & Theme
  appearanceSectionTitle: 'Appearance & Color Mode',
  appearanceSectionDesc: 'Set background tone, dark mode, and notebook accent palettes',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  systemMode: 'System Default',
  journalPresetsTitle: 'Default Journal Theme Presets',
  themeSage: 'Sage Green',
  themeLatte: 'Warm Latte',
  themeMidnight: 'Celestial Midnight',
  themePlum: 'Subtle Plum',
  themeOled: 'Pure Pitch Black (OLED)',
  themeRose: 'Chalky Rose',

  // Section 3: Animations & Flip
  animationSectionTitle: 'Page Transitions & Flip',
  animationSectionDesc: 'Visual motion when flipping days in the planner and navigating',
  flipAnim: '3D Page Flip',
  flipAnimDesc: 'Tactile feel of flipping a physical notebook page',
  slideAnim: 'Smooth Horizontal Slide',
  slideAnimDesc: 'Linear continuous page slide with instant rendering',
  fadeAnim: 'Soft Neoclassical Fade',
  fadeAnimDesc: 'Gentle, calm transition focused purely on content',
  noneAnim: 'Instant (No Animation)',
  noneAnimDesc: 'Immediate zero-delay view switching',

  // Section 4: Audio & Feedback
  audioSectionTitle: 'Audio & Tactile Feedback',
  audioSectionDesc: 'Organic sounds for checking tasks, turning pages, and pen interactions',
  soundToggleLabel: 'Play Sound Effects',
  soundToggleDesc: 'Simulate natural paper rustle, pen strokes, and checkmark clicks',
  volumeSliderLabel: 'Volume Level',
  testAudioEffects: 'Test Sound Effects',
  testFlip: 'Page Flip',
  testTick: 'Task Check',
  testAdd: 'Add Item',
  testSwoosh: 'Smooth Transition',

  // Section 5: Task Management
  tasksSectionTitle: 'Tasks & Productivity',
  tasksSectionDesc: 'Automated behavior for incomplete daily tasks and habit tracking',
  autoRolloverLabel: 'Automatically roll over uncompleted tasks to next day',
  autoRolloverDesc: 'Tasks left unchecked by midnight will automatically carry over to tomorrow morning.',

  // Section 6: Backup & Storage
  backupSectionTitle: 'Data Management & Storage',
  backupSectionDesc: 'Export full offline JSON backup of all notebooks and settings or restore instantly',
  exportJsonBackup: 'Export JSON Backup',
  importJsonBackup: 'Restore from Backup',
  resetAllData: 'Reset App Data & Cache',
  resetConfirmWarning: 'Are you sure? All local journals and changes will be wiped and restored to default initial state.',
  storageUsageTitle: 'Local Storage Health & Statistics',
  totalJournalsStat: 'Total Notebooks',
  totalPagesStat: 'Total Active Pages',
  storageEstimateStat: 'Browser Storage Used',

  // Section 7: App Details
  aboutSectionTitle: 'About Strategy Planner',
  aboutSectionDesc: 'A minimalist digital workspace for daily intention, reflection, and deep work',
  appVersionLabel: 'Version 2.0 — Functional Minimalism Architecture',
  buildStatusLabel: 'Local-first & Offline-capable with zero external tracking',
};

export function getTranslations(lang: Language = 'fa'): Translations {
  return lang === 'en' ? EN_TRANSLATIONS : FA_TRANSLATIONS;
}

export function formatNumberByLang(num: number | string, lang: Language = 'fa'): string {
  if (lang === 'fa') {
    return toPersianDigits(num);
  }
  return String(num);
}
