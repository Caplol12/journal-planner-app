import React, { useState } from 'react';
import {
  Columns,
  Rows,
  Maximize2,
  Plus,
  X,
  ArrowRightLeft,
  ChevronsLeftRight,
} from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';

interface SplitModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

type SplitDirection = 'columns' | 'rows';
type RatioPreset = 'equal' | 'primary-right' | 'primary-left';

export const SplitMode: React.FC<SplitModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  const [direction, setDirection] = useState<SplitDirection>('columns');
  const [ratio, setRatio] = useState<RatioPreset>('equal');

  if (items.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-stone-400 mb-4">
          <Columns size={32} />
        </div>
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
          هیچ برگه‌ای در این فضا اضافه نشده است
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
          برای مقایسه و کار هم‌زمان روی چند برگه در حالت اسپلیت، حداقل یک برگه اضافه کنید.
        </p>
        <button
          type="button"
          onClick={onOpenAddDrawer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} />
          <span>افزودن برگه</span>
        </button>
      </div>
    );
  }

  // Calculate layout classes based on items count and ratio
  const getContainerClasses = () => {
    if (direction === 'rows') {
      return 'flex flex-col gap-4';
    }
    // Columns
    if (items.length === 1) return 'grid grid-cols-1 max-w-4xl mx-auto';
    if (items.length === 2) {
      if (ratio === 'primary-right') return 'grid grid-cols-1 lg:grid-cols-3 gap-4';
      if (ratio === 'primary-left') return 'grid grid-cols-1 lg:grid-cols-3 gap-4';
      return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
    }
    if (items.length === 3) return 'grid grid-cols-1 lg:grid-cols-3 gap-4';
    return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4';
  };

  const getPaneSpanClass = (idx: number) => {
    if (direction === 'columns' && items.length === 2) {
      // In RTL, index 0 is on the right side
      if (ratio === 'primary-right' && idx === 0) return 'lg:col-span-2';
      if (ratio === 'primary-left' && idx === 1) return 'lg:col-span-2';
    }
    return 'col-span-1';
  };

  return (
    <div className="w-full flex flex-col gap-4 py-4 px-2 sm:px-6">
      {/* Top Split Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 bg-white/70 dark:bg-stone-850/70 backdrop-blur-xs p-2 rounded-2xl border border-stone-200/70 dark:border-stone-800/70 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                sound.playTick(true);
                setDirection('columns');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                direction === 'columns'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="ستون‌های عمودی کنار هم"
            >
              <Columns size={13} />
              <span>ستون‌ها</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playTick(true);
                setDirection('rows');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                direction === 'rows'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="سطرهای افقی روی هم"
            >
              <Rows size={13} />
              <span>سطرها</span>
            </button>
          </div>

          {/* Ratio presets if 2 items */}
          {items.length === 2 && direction === 'columns' && (
            <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setRatio('equal');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                  ratio === 'equal'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                ۵۰/۵۰
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setRatio('primary-right');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                  ratio === 'primary-right'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                ۲/۳ راست
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTick(true);
                  setRatio('primary-left');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                  ratio === 'primary-left'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                ۲/۳ چپ
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">
            {items.length} پنل فعال
          </span>
          <button
            type="button"
            onClick={onOpenAddDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>+ پنل جدید</span>
          </button>
        </div>
      </div>

      {/* Split Panels Container */}
      <div className={`w-full ${getContainerClasses()}`}>
        {items.map((item, idx) => {
          const pageData = journal.pages[item.pageId];
          const isActive = activeItemId === item.id;
          const isDimmed = focusDim && activeItemId && !isActive;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`w-full ${getPaneSpanClass(idx)} transition-all duration-200 ${
                isDimmed ? 'opacity-40 hover:opacity-85' : 'opacity-100'
              }`}
            >
              <PageFrame
                item={item}
                pageData={pageData}
                isActive={isActive}
                onSelect={() => onSelectItem(item.id)}
                onRemove={() => onRemoveItem(item.id)}
              >
                {pageData ? (
                  <PageRenderer
                    pageId={item.pageId}
                    pageData={pageData}
                    journal={journal}
                    onUpdate={(updater) => onUpdatePageData(item.pageId, updater)}
                    compact={items.length > 2}
                  />
                ) : (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    داده‌های این برگه یافت نشد.
                  </div>
                )}
              </PageFrame>
            </div>
          );
        })}
      </div>
    </div>
  );
};
