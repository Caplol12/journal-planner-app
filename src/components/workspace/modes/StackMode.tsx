import React, { useState } from 'react';
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  RotateCw,
} from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';

interface StackModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

export const StackMode: React.FC<StackModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const found = items.findIndex((i) => i.id === activeItemId);
    return found >= 0 ? found : 0;
  });

  if (items.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Layers size={36} className="text-stone-400 mb-3" />
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-2">
          پشته خالی است
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

  const activeIdx = Math.min(currentIndex, items.length - 1);
  const activeItem = items[activeIdx];

  const handleNext = () => {
    if (activeIdx < items.length - 1) {
      sound.playTurnPage();
      setCurrentIndex(activeIdx + 1);
      onSelectItem(items[activeIdx + 1].id);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      sound.playTurnPage();
      setCurrentIndex(activeIdx - 1);
      onSelectItem(items[activeIdx - 1].id);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4 px-2 sm:px-6">
      {/* Top Stack Navigation Controller */}
      <div className="flex items-center justify-between gap-4 w-full max-w-2xl px-4 py-2 bg-white/70 dark:bg-stone-850/70 backdrop-blur-xs rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xs">
        <button
          type="button"
          onClick={handleNext}
          disabled={activeIdx >= items.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold cursor-pointer transition-colors"
          title="کارت بعدی"
        >
          <ChevronRight size={15} />
          <span>کارت بعدی</span>
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-1.5">
          {items.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                sound.playTick(true);
                setCurrentIndex(idx);
                onSelectItem(it.id);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === activeIdx
                  ? 'w-6 bg-amber-500'
                  : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
              }`}
              title={`برگه ${idx + 1}`}
            />
          ))}
          <span className="text-[11px] font-mono text-stone-500 font-bold ms-2">
            {activeIdx + 1} / {items.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrev}
          disabled={activeIdx <= 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold cursor-pointer transition-colors"
          title="کارت قبلی"
        >
          <span>کارت قبلی</span>
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Layered 3D Stack Container */}
      <div className="w-full max-w-3xl relative min-h-[700px] flex justify-center">
        {/* Underneath Peeking Layer 2 */}
        {activeIdx + 2 < items.length && (
          <div
            className="absolute top-8 w-[92%] h-full rounded-3xl bg-stone-200/60 dark:bg-stone-800/40 border border-stone-300/40 dark:border-stone-700/40 transform scale-95 shadow-sm transition-all duration-300 pointer-events-none"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Underneath Peeking Layer 1 */}
        {activeIdx + 1 < items.length && (
          <div
            onClick={handleNext}
            className="absolute top-4 w-[96%] h-full rounded-3xl bg-stone-100 dark:bg-stone-850/80 border border-stone-300/70 dark:border-stone-700/70 transform scale-98 shadow-md transition-all duration-300 cursor-pointer group"
            style={{ zIndex: 2 }}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-stone-400 group-hover:text-amber-600 transition-colors">
              + برای نمایش برگه بعدی کلیک کنید
            </div>
          </div>
        )}

        {/* Active Front Card */}
        {activeItem && (
          <div className="relative w-full z-10 transition-all duration-200">
            <PageFrame
              item={activeItem}
              pageData={journal.pages[activeItem.pageId]}
              isActive={true}
              onSelect={() => onSelectItem(activeItem.id)}
              onRemove={() => onRemoveItem(activeItem.id)}
            >
              {journal.pages[activeItem.pageId] ? (
                <PageRenderer
                  pageId={activeItem.pageId}
                  pageData={journal.pages[activeItem.pageId]}
                  journal={journal}
                  onUpdate={(updater) => onUpdatePageData(activeItem.pageId, updater)}
                />
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs">
                  داده‌های این برگه یافت نشد.
                </div>
              )}
            </PageFrame>
          </div>
        )}
      </div>
    </div>
  );
};
