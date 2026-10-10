import React, { useState } from 'react';
import { LayoutGrid, Plus, Columns, Maximize2, SplitSquareVertical } from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { createEmptyDayPage } from '../../../utils/storage';
import { sound } from '../../../utils/audio';

type GridPreset = '2x2' | 'hero' | '3col' | '1col';

interface GridModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

export const GridMode: React.FC<GridModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  const [preset, setPreset] = useState<GridPreset>('2x2');

  const getGridClasses = () => {
    switch (preset) {
      case 'hero':
        // Hero layout: first item takes full width or 2 spans, others 1
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
      case '3col':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
      case '1col':
        return 'grid grid-cols-1 max-w-4xl mx-auto gap-6';
      case '2x2':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-5';
    }
  };

  const getItemSpanClass = (index: number) => {
    if (preset === 'hero' && index === 0) {
      return 'md:col-span-2 lg:col-span-2';
    }
    return 'col-span-1';
  };

  return (
    <div className="w-full flex flex-col gap-6 py-4 px-2 sm:px-6">
      {/* Grid Preset Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-stone-850 rounded-xl border border-stone-200/70 dark:border-stone-800/70 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-400 px-2">چیدمان گرید:</span>
          <button
            type="button"
            onClick={() => {
              sound.playTick(true);
              setPreset('2x2');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              preset === '2x2'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            ۲×۲ متوازن
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playTick(true);
              setPreset('hero');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              preset === 'hero'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            ۱ بزرگ + ۲ کوچک
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playTick(true);
              setPreset('3col');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              preset === '3col'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            ۳ ستون
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playTick(true);
              setPreset('1col');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              preset === '1col'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            تک ستون
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playAdd();
            onOpenAddDrawer();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={14} />
          <span>افزودن برگه</span>
        </button>
      </div>

      {/* Grid Container */}
      <div className={`w-full ${getGridClasses()}`}>
        {items.map((item, idx) => {
          const pageData = journal.pages[item.pageId] || createEmptyDayPage();
          const isActive = item.id === activeItemId;
          const spanClass = getItemSpanClass(idx);

          return (
            <div
              key={item.id}
              className={`${spanClass} max-h-[850px] overflow-y-auto rounded-3xl`}
            >
              <PageFrame
                item={item}
                pageData={pageData}
                isActive={isActive}
                isFocusDimmed={focusDim}
                onSelect={() => onSelectItem(item.id)}
                onRemove={() => onRemoveItem(item.id)}
              >
                <PageRenderer
                  pageId={item.pageId}
                  pageData={pageData}
                  journal={journal}
                  compact={preset !== '1col'}
                  onUpdate={(updater) => onUpdatePageData(item.pageId, updater)}
                />
              </PageFrame>
            </div>
          );
        })}
      </div>
    </div>
  );
};
