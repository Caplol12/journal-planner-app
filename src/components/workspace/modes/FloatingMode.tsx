import React, { useState } from 'react';
import {
  Layers,
  Minimize2,
  Maximize2,
  X,
  Plus,
  Move,
  LayoutGrid,
  Copy,
} from 'lucide-react';
import { WorkspaceItem, DayPage, Journal, WorkspaceItemFloatingLayout } from '../../../types';
import { PageFrame } from '../PageFrame';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';

interface FloatingModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

interface WindowState {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export const FloatingMode: React.FC<FloatingModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  onSelectItem,
  onRemoveItem,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  // Window states keyed by item.id
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>(() => {
    const initial: Record<string, WindowState> = {};
    items.forEach((item, idx) => {
      initial[item.id] = {
        x: 40 + (idx % 4) * 60,
        y: 40 + (idx % 4) * 50,
        w: 520,
        h: 620,
        z: idx + 10,
        minimized: false,
        maximized: false,
      };
    });
    return initial;
  });

  const [topZ, setTopZ] = useState(items.length + 20);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const bringToFront = (id: string) => {
    onSelectItem(id);
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindowStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { x: 50, y: 50, w: 520, h: 620, minimized: false, maximized: false }),
        z: nextZ,
        minimized: false,
      },
    }));
  };

  const toggleMinimize = (id: string) => {
    sound.playTick(true);
    setWindowStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { x: 50, y: 50, w: 520, h: 620, z: 10, maximized: false }),
        minimized: !prev[id]?.minimized,
      },
    }));
  };

  const toggleMaximize = (id: string) => {
    sound.playTick(true);
    setWindowStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { x: 50, y: 50, w: 520, h: 620, z: 10, minimized: false }),
        maximized: !prev[id]?.maximized,
      },
    }));
  };

  const cascadeWindows = () => {
    sound.playSwoosh();
    setWindowStates((prev) => {
      const updated = { ...prev };
      items.forEach((item, idx) => {
        updated[item.id] = {
          x: 30 + idx * 45,
          y: 30 + idx * 45,
          w: 520,
          h: 620,
          z: idx + 10,
          minimized: false,
          maximized: false,
        };
      });
      return updated;
    });
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    bringToFront(id);
    const win = windowStates[id] || { x: 50, y: 50 };
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const newX = Math.max(10, e.clientX - dragOffset.x);
    const newY = Math.max(10, e.clientY - dragOffset.y);
    setWindowStates((prev) => ({
      ...prev,
      [draggingId]: {
        ...(prev[draggingId] || { w: 520, h: 620, z: 10, minimized: false, maximized: false }),
        x: newX,
        y: newY,
      },
    }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-[#f3f1eb] dark:bg-[#121211] select-none flex flex-col justify-between"
    >
      {/* Floating Desktop Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {items.map((item, idx) => {
          const win = windowStates[item.id] || {
            x: 40 + (idx % 4) * 60,
            y: 40 + (idx % 4) * 50,
            w: 520,
            h: 620,
            z: idx + 10,
            minimized: false,
            maximized: false,
          };

          if (win.minimized) return null;

          const pageData = journal.pages[item.pageId];
          const isMax = win.maximized;

          return (
            <div
              key={item.id}
              onClick={() => bringToFront(item.id)}
              className="absolute shadow-2xl rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#181816] flex flex-col transition-all duration-75"
              style={{
                left: isMax ? '10px' : `${win.x}px`,
                top: isMax ? '10px' : `${win.y}px`,
                width: isMax ? 'calc(100% - 20px)' : `${win.w}px`,
                height: isMax ? 'calc(100% - 20px)' : `${win.h}px`,
                zIndex: win.z,
              }}
            >
              {/* Window Title Bar */}
              <div
                onMouseDown={(e) => !isMax && handleDragStart(e, item.id)}
                className="px-4 py-2.5 bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between cursor-move"
              >
                <div className="flex items-center gap-2">
                  <Move size={13} className="text-stone-400" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {item.title || item.pageId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleMinimize(item.id)}
                    className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                    title="کمینه‌سازی (Minimize)"
                  >
                    <Minimize2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMaximize(item.id)}
                    className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                    title={isMax ? 'اندازه معمولی' : 'بیشینه‌سازی (Maximize)'}
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                    title="بستن پنجره"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="flex-1 overflow-y-auto p-3">
                {pageData ? (
                  <PageRenderer
                    pageId={item.pageId}
                    pageData={pageData}
                    journal={journal}
                    onUpdate={(updater) => onUpdatePageData(item.pageId, updater)}
                    compact
                  />
                ) : (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    داده‌های این برگه یافت نشد.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Desktop Taskbar / Dock */}
      <footer className="w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 px-4 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={cascadeWindows}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer"
            title="آبشاری کردن پنجره‌ها (Cascade)"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">آبشاری</span>
          </button>

          <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

          {/* Window items in dock */}
          {items.map((item) => {
            const win = windowStates[item.id];
            const isMin = win?.minimized;
            const isFront = activeItemId === item.id && !isMin;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => bringToFront(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isFront
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500 shadow-2xs'
                    : isMin
                    ? 'bg-stone-200/60 dark:bg-stone-800/60 text-stone-400 opacity-70'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="truncate max-w-[120px]">{item.title || item.pageId}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddDrawer}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-bold cursor-pointer"
        >
          <Plus size={13} />
          <span>+ پنجره جدید</span>
        </button>
      </footer>
    </div>
  );
};
