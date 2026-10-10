export interface TimeSlot {
  text: string;
  color: string;
  cat?: string;
}

export interface HabitItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PriorityItem {
  text: string;
  done: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NonRoutineGroup {
  followUps: string[];
  admin: string[];
  docs: string[];
  team: string[];
  misc: string[];
}

export type TemplateType =
  | 'template-1-green'
  | 'template-2-one-big-thing'
  | 'template-3-writing-plans'
  | 'template-4-celestial-todo'
  | 'template-custom-html';

export interface CustomHtmlTemplate {
  id: string;
  title: string;
  badge: string;
  desc: string;
  htmlContent: string;
  createdAt: string;
}

export interface CelestialTaskItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CelestialDailyBasics {
  morning: CelestialTaskItem[];
  home: CelestialTaskItem[];
  meals: CelestialTaskItem[];
  night: CelestialTaskItem[];
}

export interface CelestialTemplateData {
  dailyBasics: CelestialDailyBasics;
  todayTasks: CelestialTaskItem[];
  customArtworkUrl?: string; // custom cropped background or landscape
  headerBannerUrl?: string; // custom banner image for top header
}

export interface TimeBlockSlot {
  text: string;
  done: boolean;
  color?: string;
  cat?: string;
}

export interface MatrixItem {
  id: string;
  text: string;
  done: boolean;
}

export interface EisenhowerMatrixData {
  urgentImportant: MatrixItem[];
  importantNotUrgent: MatrixItem[];
  urgentNotImportant: MatrixItem[];
  notUrgentNotImportant: MatrixItem[];
}

export interface WritingPlansData {
  currentProject: string;
  completedChapters: number[]; // 1..25
  wordCountGoal: number | string;
  currentWordCount: number | string;
  scenesStuckInHead: string[];
  characterThoughts: string;
  linesILike: string[];
  inspirationPlaylist: string[];
  coffeeCups: number; // 0..5
  dailyCheckIn: Record<string, number>; // questionId -> 1..5

  // Custom cropped artwork elements directly from user's original image
  girlImageUrl?: string;
  polaroidImageUrl?: string;
  typewriterImageUrl?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface PageTextFormat {
  fontFamily: string; // 'Vazirmatn' | 'Lalezar' | 'Sahel' | 'Shabnam' | 'Samim' | 'Amiri' | 'Marhey'
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'right' | 'center' | 'left';
  textColor: string;
}

export interface DayPage {
  templateType?: TemplateType;

  // Drawing & Inking Layer
  drawingStrokes?: DrawingStroke[];

  // Text formatting
  textFormat?: PageTextFormat;
  elementStyles?: Record<string, Partial<PageTextFormat>>;

  // Template 1 (برگه سبز رنگ)
  timeSlots: Record<number, TimeSlot>;
  dialSectors?: Record<number, { color: string; cat?: string }>;
  habits: HabitItem[];
  dailyNotes: string;
  nonRoutine: NonRoutineGroup;
  priorities: PriorityItem[];
  todos: TodoItem[];

  // Template 2 (قالب The One Big Thing & Eisenhower Matrix)
  oneBigThing?: string;
  halfHourSlots?: Record<string, TimeBlockSlot>; // e.g. "08:00", "08:30", ..., "18:30"
  eisenhowerMatrix?: EisenhowerMatrixData;
  brainDump?: string;

  // Template 3 (قالب Writing Plans - نویسندگی و خلاقیت)
  writingPlans?: WritingPlansData;

  // Template 4 (قالب Daily To-Do List کیهانی و کوهستان شبانه)
  celestialTodo?: CelestialTemplateData;

  // Custom HTML Template (قالب HTML سفارشی)
  customHtmlContent?: string;
}

export type JournalTheme = 'sage' | 'midnight' | 'latte' | 'plum' | 'oled' | 'rose';

export type ColorMode = 'light' | 'dark' | 'system';

export interface Journal {
  id: string;
  title: string;
  color: string;
  theme?: JournalTheme;
  coverImage?: string;
  starred: boolean;
  createdAt: string;
  pages: Record<string, DayPage>;
}

export type Language = 'fa' | 'en';

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  animationStyle: 'flip' | 'slide' | 'fade' | 'none';
  autoRolloverTasks: boolean;
  theme: JournalTheme;
  colorMode: ColorMode;
  language: Language;
}

export interface CategoryOption {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// ==========================================
// Multi-Page Workspace Data Model (فازهای ۱ تا ۶)
// ==========================================

export type ViewMode =
  | 'feed'      // اسکرول عمودی
  | 'canvas'    // بوم بینهایت
  | 'grid'      // گرید / بنتو
  | 'split'     // پنل‌های تقسیم‌شده
  | 'tabs'      // تب + کنار هم
  | 'book'      // ورق زدن افقی / کتاب دو صفحه‌ای
  | 'floating'  // پنجره‌های شناور
  | 'stack';    // پشته کارتی (موبایل)

export interface WorkspaceItemFeedLayout {
  order: number;
  collapsed: boolean;
  pinned: boolean;
}

export interface WorkspaceItemCanvasLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  groupId?: string;
}

export interface WorkspaceItemGridLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WorkspaceItemFloatingLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  opacity: number;
}

export interface WorkspaceItem {
  id: string;            // شناسه آیتم در workspace
  pageId: string;        // اشاره مستقیم به کلید برگه در journal.pages (تفکیک کامل چیدمان از دیتا)
  title?: string;        // عنوان اختیاری اختصاصی برای نمایش در هدر
  feed?: WorkspaceItemFeedLayout;
  canvas?: WorkspaceItemCanvasLayout;
  grid?: WorkspaceItemGridLayout;
  floating?: WorkspaceItemFloatingLayout;
}

export type SplitNode =
  | { type: 'leaf'; itemId: string }
  | { type: 'split'; dir: 'row' | 'col'; sizes: number[]; children: SplitNode[] };

export interface CanvasLink {
  id: string;
  fromItemId: string;
  toItemId: string;
  label?: string;
}

export interface CanvasGroup {
  id: string;
  title: string;
  color: string;
}

export interface CanvasNote {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  color: string;
}

export interface Workspace {
  id: string;
  journalId: string;
  title: string;                 // e.g. «فضای کار اصلی»، «صبح»، «برنامه‌ریزی هفتگی»
  mode: ViewMode;
  items: WorkspaceItem[];        // حداکثر توصیه شده ۴ تا ۵ برگه، حداکثر نرم ۸
  splitTree?: SplitNode;
  activeTabIds?: string[];
  activeItemId?: string;
  viewport: { x: number; y: number; zoom: number }; // برای canvas
  links: CanvasLink[];
  groups: CanvasGroup[];
  notes: CanvasNote[];
  focusDim: boolean;
  updatedAt: string;
}
