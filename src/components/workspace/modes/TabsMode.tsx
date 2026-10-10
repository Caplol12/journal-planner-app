import React, { useState } from 'react';
import {
  Plus,
  X,
  Columns,
  Pin,
  Calendar,
  Sparkles,
  BookOpen,
  FileCode,
  Check,
} from 'lucide-react';
import { WorkspaceItem, DayPage, Journal } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';
import { formatJalaliDate, parseDateKey } from '../../../utils/jalali';

interface TabsModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

export const TabsMode: React.FC<TabsModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  // Optional secondary tab pinned side-by-side
  const [pinnedSecondaryId, setPinnedSecondaryId] = useState<string | null>(null);

  const activeItem = items.find((i) => i.id === activeItemId) || items[0];
  const secondaryItem = items.find((i) => i.id === pinnedSecondaryId && i.id !== activeItem?.id);

  if (items.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-2">
          تبی باز نیست
        </h3>
        <button
          type="button"
          onClick={onOpenAddDrawer}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-bold"
        >
          <Plus size={14} />
          <span>افزودن برگه جدید</span>
        </button>
      </div>
    );
  }

  const getTemplateIcon = (page?: DayPage) => {
    if (!page) return <Calendar size={13} />;
    switch (page.templateType) {
      case 'template-4-celestial-todo':
        return <span className="text-amber-500 text-xs">☾</span>;
      case 'template-3-writing-plans':
        return <span className="text-emerald-500 text-xs">🌲</span>;
      case 'template-2-one-big-thing':
        return <span className="text-indigo-500 text-xs">📋</span>;
      case 'template-custom-html':
        return <FileCode size={13} className="text-violet-500" />;
      default:
        return <span className="text-emerald-600 text-xs">🌿</span>;
    }
  };

  const getTabTitle = (item: WorkspaceItem) => {
    if (item.title) return item.title;
    try {
      return formatJalaliDate(parseDateKey(item.pageId));
    } catch {
      return item.pageId;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 py-3 px-2 sm:px-6">
      {/* Browser/IDE-style Tab Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {items.map((item) => {
            const isActive = item.id === activeItem?.id;
            const isSecondary = item.id === pinnedSecondaryId;
            const pageData = journal.pages[item.pageId];

            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playTick(true);
                  onSelectItem(item.id);
                }}
                className={`group flex items-center gap-2 px-3 py-2 rounded-t-xl text-xs font-semibold cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 border-amber-500 shadow-2xs'
                    : isSecondary
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-400'
                    : 'bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 border-transparent hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
              >
                {getTemplateIcon(pageData)}
                <span className="truncate max-w-[150px]">{getTabTitle(item)}</span>

                {/* Secondary pin button on hover */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playTick(true);
                      setPinnedSecondaryId(pinnedSecondaryId === item.id ? null : item.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-amber-600 transition-opacity ${
                      isSecondary ? '!opacity-100 text-amber-600 font-bold' : ''
                    }`}
                    title={isSecondary ? 'برداشتن پین کنار هم' : 'پین کردن در کنار تب فعال (Split)'}
                  >
                    <Columns size={12} />
                  </button>
                )}

                {/* Close tab */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinnedSecondaryId === item.id) setPinnedSecondaryId(null);
                    onRemoveItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-rose-600 transition-opacity cursor-pointer"
                  title="بستن این تب"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            type="button"
            onClick={onOpenAddDrawer}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            title="افزودن تب جدید"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Tab Actions */}
        {pinnedSecondaryId && (
          <button
            type="button"
            onClick={() => setPinnedSecondaryId(null)}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer whitespace-nowrap"
          >
            لغو نمایش دوطرفه
          </button>
        )}
      </div>

      {/* Tab Content Display */}
      <div className={`w-full ${secondaryItem ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'max-w-4xl mx-auto'}`}>
        {/* Primary Active Tab */}
        {activeItem && (
          <div className="w-full">
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

        {/* Pinned Secondary Tab (if active) */}
        {secondaryItem && (
          <div className="w-full">
            <PageFrame
              item={secondaryItem}
              pageData={journal.pages[secondaryItem.pageId]}
              isActive={false}
              onSelect={() => onSelectItem(secondaryItem.id)}
              onRemove={() => {
                setPinnedSecondaryId(null);
                onRemoveItem(secondaryItem.id);
              }}
            >
              {journal.pages[secondaryItem.pageId] ? (
                <PageRenderer
                  pageId={secondaryItem.pageId}
                  pageData={journal.pages[secondaryItem.pageId]}
                  journal={journal}
                  onUpdate={(updater) => onUpdatePageData(secondaryItem.pageId, updater)}
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
