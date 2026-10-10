import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  GripVertical,
  BookOpen,
  Sparkles,
  FileCode,
  PenTool,
  Clock,
  Layers,
} from 'lucide-react';
import { WorkspaceItem, DayPage } from '../../types';
import { sound } from '../../utils/audio';
import { formatJalaliDate, parseDateKey } from '../../utils/jalali';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('PageFrame ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-center flex flex-col items-center gap-2">
          <span className="font-bold text-sm">خطا در بارگذاری این برگه</span>
          <span className="text-xs text-rose-600/80">محتوای این برگه موقتاً در دسترس نیست. سایر برگه‌ها بدون مشکل در حال اجرا هستند.</span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-rose-200 dark:bg-rose-900/60 rounded-lg text-xs font-semibold cursor-pointer"
          >
            تلاش مجدد
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface PageFrameProps {
  item: WorkspaceItem;
  pageData: DayPage;
  isActive: boolean;
  isFocusDimmed?: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onTogglePin?: () => void;
  onToggleCollapse?: () => void;
  isPinned?: boolean;
  isCollapsed?: boolean;
  isDragHandle?: boolean;
  children: ReactNode;
}

export const PageFrame: React.FC<PageFrameProps> = ({
  item,
  pageData,
  isActive,
  isFocusDimmed = false,
  onSelect,
  onRemove,
  onTogglePin,
  onToggleCollapse,
  isPinned = false,
  isCollapsed = false,
  isDragHandle = true,
  children,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Template badge information
  const templateBadge = React.useMemo(() => {
    switch (pageData.templateType) {
      case 'template-2-one-big-thing':
        return { label: 'The One Big Thing & Eisenhower', color: 'bg-stone-800 text-stone-100', icon: Clock };
      case 'template-3-writing-plans':
        return { label: 'Writing Plans & Creativity', color: 'bg-[#3e5f44] text-white', icon: PenTool };
      case 'template-4-celestial-todo':
        return { label: 'Celestial Daily To-Do', color: 'bg-[#0f2444] text-cyan-200', icon: Sparkles };
      case 'template-custom-html':
        return { label: 'Custom HTML Sheet', color: 'bg-blue-800 text-blue-100', icon: FileCode };
      default:
        return { label: '۲۴H Chronodex & Sage', color: 'bg-emerald-800 text-emerald-100', icon: BookOpen };
    }
  }, [pageData.templateType]);

  // Formatted date or custom title
  const displayTitle = React.useMemo(() => {
    if (item.title) return item.title;
    try {
      const d = parseDateKey(item.pageId);
      if (!isNaN(d.getTime())) {
        return formatJalaliDate(d);
      }
    } catch {}
    return item.pageId;
  }, [item.title, item.pageId]);

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl sm:rounded-3xl transition-all duration-200 flex flex-col overflow-hidden ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-[#faf9f6] dark:bg-[#151514] shadow-2xl p-4 overflow-y-auto'
          : isActive
          ? 'ring-2 ring-stone-900/40 dark:ring-stone-100/40 shadow-md bg-[#faf9f6] dark:bg-[#181816]'
          : 'border border-stone-200/80 dark:border-stone-800/80 shadow-2xs hover:border-stone-400 dark:hover:border-stone-600 bg-white dark:bg-[#1a1a18]'
      } ${isFocusDimmed && !isActive ? 'opacity-40 hover:opacity-90' : 'opacity-100'}`}
    >
      {/* Frame Minimalist Header */}
      <div
        className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between border-b transition-colors select-none ${
          isActive
            ? 'bg-stone-100/90 dark:bg-stone-850 border-stone-200/90 dark:border-stone-700/80'
            : 'bg-stone-50/60 dark:bg-[#1c1c1a] border-stone-100 dark:border-stone-800/60'
        }`}
      >
        {/* Right (in RTL): Drag handle + Template Badge + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isDragHandle && (
            <span
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title="دسته جابه‌جایی برگه"
            >
              <GripVertical size={15} />
            </span>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${templateBadge.color}`}
            >
              <templateBadge.icon size={11} />
              <span className="hidden sm:inline">{templateBadge.label}</span>
            </span>

            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
              {displayTitle}
            </span>

            {isPinned && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-medium shrink-0">
                پین شده
              </span>
            )}
          </div>
        </div>

        {/* Left (in RTL): Action Controls */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onTogglePin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isPinned
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
              }`}
              title={isPinned ? 'برداشتن پین' : 'پین کردن برگه در بالای فید'}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'گسترش برگه' : 'جمع کردن برگه'}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playTick(true);
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه این برگه'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="حذف از فضای کار"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Frame Content Body */}
      {!isCollapsed && (
        <div className="w-full p-2 sm:p-4 md:p-6 transition-all duration-200">
          <PageErrorBoundary fallbackTitle={displayTitle}>
            {children}
          </PageErrorBoundary>
        </div>
      )}
    </div>
  );
};
