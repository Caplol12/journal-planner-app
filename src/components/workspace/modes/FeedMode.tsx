import React, { useRef } from 'react';
import { Plus, ArrowUp, ArrowDown, BookOpen } from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { createEmptyDayPage } from '../../../utils/storage';
import { sound } from '../../../utils/audio';

interface FeedModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

export const FeedMode: React.FC<FeedModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onTogglePin,
  onToggleCollapse,
  onReorder,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sort items: pinned first, then by feed.order
  const sortedItems = [...items].sort((a, b) => {
    const aPinned = Boolean(a.feed?.pinned);
    const bPinned = Boolean(b.feed?.pinned);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return (a.feed?.order ?? 0) - (b.feed?.order ?? 0);
  });

  const scrollToItem = (id: string) => {
    sound.playTick(true);
    const el = itemRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSelectItem(id);
    }
  };

  return (
    <div className="w-full relative flex justify-center py-6 px-2 sm:px-4">
      {/* Floating Outline Quick Navigation (RTL aligned to left or right margin on wide screens) */}
      {sortedItems.length > 1 && (
        <aside
          dir="rtl"
          className="hidden xl:flex fixed start-8 top-32 z-30 flex-col gap-1.5 p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-sm text-xs max-w-[200px]"
        >
          <span className="text-[10px] font-bold text-stone-400 px-2 py-1">فهرست برگه‌ها:</span>
          {sortedItems.map((it, idx) => {
            const page = journal.pages[it.pageId];
            const title = it.title || it.pageId;
            const isAct = it.id === activeItemId;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => scrollToItem(it.id)}
                className={`w-full text-right px-2.5 py-1.5 rounded-xl truncate transition-colors cursor-pointer ${
                  isAct
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={title}
              >
                {idx + 1}. {title}
              </button>
            );
          })}
        </aside>
      )}

      {/* Main Feed Container */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {sortedItems.map((item, idx) => {
          const pageData = journal.pages[item.pageId] || createEmptyDayPage();
          const isActive = item.id === activeItemId;
          const isPinned = Boolean(item.feed?.pinned);
          const isCollapsed = Boolean(item.feed?.collapsed);

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[item.id] = el;
              }}
              className="flex flex-col gap-2 relative group"
            >
              {/* Between-sheet Add Button (Hover Reveal) */}
              {idx > 0 && (
                <div className="w-full flex items-center justify-center -my-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playAdd();
                      onOpenAddDrawer();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-xs text-stone-700 dark:text-stone-300 shadow-xs hover:border-stone-500 cursor-pointer active:scale-95"
                  >
                    <Plus size={12} />
                    <span>افزودن برگه در اینجا</span>
                  </button>
                </div>
              )}

              {/* Feed Page Frame */}
              <div className="relative">
                {/* Reorder Buttons (Floating on corner) */}
                <div className="absolute start-[-32px] top-3 hidden md:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onReorder(idx, idx - 1)}
                      className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shadow-2xs"
                      title="انتقال به بالا"
                    >
                      <ArrowUp size={13} />
                    </button>
                  )}
                  {idx < sortedItems.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onReorder(idx, idx + 1)}
                      className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shadow-2xs"
                      title="انتقال به پایین"
                    >
                      <ArrowDown size={13} />
                    </button>
                  )}
                </div>

                <PageFrame
                  item={item}
                  pageData={pageData}
                  isActive={isActive}
                  isFocusDimmed={focusDim}
                  onSelect={() => onSelectItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onTogglePin={() => onTogglePin(item.id)}
                  onToggleCollapse={() => onToggleCollapse(item.id)}
                  isPinned={isPinned}
                  isCollapsed={isCollapsed}
                >
                  <PageRenderer
                    pageId={item.pageId}
                    pageData={pageData}
                    journal={journal}
                    onUpdate={(updater) => onUpdatePageData(item.pageId, updater)}
                  />
                </PageFrame>
              </div>
            </div>
          );
        })}

        {/* Bottom Add Sheet Button */}
        <div className="w-full pt-4 pb-12 flex justify-center">
          <button
            type="button"
            onClick={() => {
              sound.playAdd();
              onOpenAddDrawer();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>افزودن برگه جدید به فضای کار</span>
          </button>
        </div>
      </div>
    </div>
  );
};
