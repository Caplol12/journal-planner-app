import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Plus,
  BookMarked,
  Maximize2,
} from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';
import { formatJalaliDate, parseDateKey } from '../../../utils/jalali';

interface BookModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

export const BookMode: React.FC<BookModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  // Current spread index (0 means items 0 and 1, 1 means items 2 and 3, etc.)
  const [spreadIndex, setSpreadIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center">
        <BookOpen size={36} className="text-stone-400 mb-3" />
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-2">
          کتاب خالی است
        </h3>
        <button
          type="button"
          onClick={onOpenAddDrawer}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-bold"
        >
          <Plus size={14} />
          <span>افزودن برگه</span>
        </button>
      </div>
    );
  }

  const maxSpreads = Math.ceil(items.length / 2);
  const currentSpread = Math.min(spreadIndex, maxSpreads - 1);

  // In RTL book reading:
  // Right page is items[currentSpread * 2] (first page of spread)
  // Left page is items[currentSpread * 2 + 1] (second page of spread)
  const rightItem = items[currentSpread * 2];
  const leftItem = items[currentSpread * 2 + 1];

  const handlePrevSpread = () => {
    if (currentSpread > 0) {
      sound.playTurnPage();
      setSpreadIndex(currentSpread - 1);
    }
  };

  const handleNextSpread = () => {
    if (currentSpread < maxSpreads - 1) {
      sound.playTurnPage();
      setSpreadIndex(currentSpread + 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 py-5 px-2 sm:px-6">
      {/* Book Spread Navigation Header */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-3 px-3 py-2 bg-white/70 dark:bg-stone-850/70 backdrop-blur-xs rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xs">
        {/* Next page (to the left in RTL) */}
        <button
          type="button"
          onClick={handleNextSpread}
          disabled={currentSpread >= maxSpreads - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer transition-colors"
          title="ورق زدن به جلو (صفحات بعد)"
        >
          <ChevronRight size={15} />
          <span>صفحات بعد</span>
        </button>

        {/* Center spread info */}
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
          <BookMarked size={14} className="text-amber-600" />
          <span>
            گشودگی {currentSpread + 1} از {maxSpreads}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            (برگه‌های {currentSpread * 2 + 1} {leftItem ? `و ${currentSpread * 2 + 2}` : ''})
          </span>
        </div>

        {/* Previous page (to the right in RTL) */}
        <button
          type="button"
          onClick={handlePrevSpread}
          disabled={currentSpread <= 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer transition-colors"
          title="ورق زدن به عقب (صفحات قبل)"
        >
          <span>صفحات قبل</span>
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Realistic Book Open Spread */}
      <div className="w-full max-w-6xl relative bg-[#fdfbf7] dark:bg-[#1a1917] rounded-3xl p-3 sm:p-6 shadow-2xl border border-stone-300/80 dark:border-stone-800 transition-all">
        {/* Central Book Spine Shadow in the middle of spread */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 bg-gradient-to-r from-stone-900/10 via-stone-900/25 to-stone-900/10 dark:from-black/30 dark:via-black/60 dark:to-black/30 shadow-inner" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Right Page (Right side in RTL) */}
          {rightItem && (
            <div className="w-full relative lg:pe-4">
              <PageFrame
                item={rightItem}
                pageData={journal.pages[rightItem.pageId]}
                isActive={activeItemId === rightItem.id}
                onSelect={() => onSelectItem(rightItem.id)}
                onRemove={() => onRemoveItem(rightItem.id)}
              >
                {journal.pages[rightItem.pageId] ? (
                  <PageRenderer
                    pageId={rightItem.pageId}
                    pageData={journal.pages[rightItem.pageId]}
                    journal={journal}
                    onUpdate={(updater) => onUpdatePageData(rightItem.pageId, updater)}
                    compact
                  />
                ) : (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    داده‌های این برگه یافت نشد.
                  </div>
                )}
              </PageFrame>
            </div>
          )}

          {/* Left Page (Left side in RTL) */}
          {leftItem ? (
            <div className="w-full relative lg:ps-4">
              <PageFrame
                item={leftItem}
                pageData={journal.pages[leftItem.pageId]}
                isActive={activeItemId === leftItem.id}
                onSelect={() => onSelectItem(leftItem.id)}
                onRemove={() => onRemoveItem(leftItem.id)}
              >
                {journal.pages[leftItem.pageId] ? (
                  <PageRenderer
                    pageId={leftItem.pageId}
                    pageData={journal.pages[leftItem.pageId]}
                    journal={journal}
                    onUpdate={(updater) => onUpdatePageData(leftItem.pageId, updater)}
                    compact
                  />
                ) : (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    داده‌های این برگه یافت نشد.
                  </div>
                )}
              </PageFrame>
            </div>
          ) : (
            /* Blank right-facing page with add prompt if uneven */
            <div className="w-full relative lg:ps-4 flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-center bg-stone-50/50 dark:bg-stone-900/30">
              <span className="text-xs text-stone-400 mb-3">برگه مقابل خالی است</span>
              <button
                type="button"
                onClick={onOpenAddDrawer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-bold shadow-2xs"
              >
                <Plus size={14} />
                <span>+ افزودن برگه به این گشودگی</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 max-w-full">
        {items.map((it, idx) => {
          const itemSpread = Math.floor(idx / 2);
          const isCurrent = itemSpread === currentSpread;

          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                sound.playTurnPage();
                setSpreadIndex(itemSpread);
                onSelectItem(it.id);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isCurrent
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                  : 'bg-white dark:bg-stone-850 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border border-stone-200/70 dark:border-stone-800'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[90px]">{it.title || it.pageId}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
