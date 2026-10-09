import React from 'react';
import { DayPage } from '../types';
import { Check, Trash2 } from 'lucide-react';

interface MiniTemplate2SheetProps {
  page: DayPage;
  dateKey?: string;
  onOpen: () => void;
  onDelete?: () => void;
  hideDelete?: boolean;
}

export const MiniTemplate2Sheet: React.FC<MiniTemplate2SheetProps> = ({
  page,
  dateKey,
  onOpen,
  onDelete,
  hideDelete = false,
}) => {
  const halfHourSlots = page.halfHourSlots || {};
  const filledSlots = Object.values(halfHourSlots).filter((s) => s.text && s.text.trim()).length;
  const completedSlots = Object.values(halfHourSlots).filter((s) => s.done).length;

  const matrix = page.eisenhowerMatrix;
  const matrixTotal =
    (matrix?.urgentImportant?.length || 0) +
    (matrix?.importantNotUrgent?.length || 0) +
    (matrix?.urgentNotImportant?.length || 0) +
    (matrix?.notUrgentNotImportant?.length || 0);

  return (
    <div
      onClick={onOpen}
      dir="ltr"
      className="w-full bg-[#fdfbf7] border-2 border-neutral-300 hover:border-black rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden select-none"
      style={{ minHeight: '340px' }}
    >
      {/* Delete button on hover if not hidden */}
      {!hideDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/90 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 hover:text-rose-700 dark:text-stone-400 dark:hover:text-rose-300 border border-stone-200 dark:border-stone-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
          title="حذف این برگه"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Top Section: THE ONE BIG THING Black Banner */}
      <div className="w-full mb-3">
        <div className="bg-black text-white py-1 px-2 text-center shadow-xs">
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase font-mono block truncate">
            THE ONE BIG THING
          </span>
        </div>
        <div className="mt-1.5 bg-white border border-neutral-300 rounded-xs px-2 py-1 text-[11px] font-bold text-neutral-800 truncate">
          {page.oneBigThing ? page.oneBigThing : <span className="text-neutral-300 font-normal italic">No goal set yet</span>}
        </div>
      </div>

      {/* Two Column Miniature View */}
      <div className="grid grid-cols-2 gap-2 flex-1 items-start">
        {/* Left: Time Blocking preview */}
        <div className="border border-black bg-white flex flex-col divide-y divide-neutral-200 text-[9px]">
          <div className="bg-neutral-100 text-center font-bold font-mono py-0.5 border-b border-black text-[8px] tracking-wider">
            TIME BLOCKING
          </div>
          {[8, 10, 12, 14, 16, 18].map((h) => {
            const hStr = `${h.toString().padStart(2, '0')}:00`;
            const slot = halfHourSlots[hStr];
            return (
              <div key={h} className="flex items-center justify-between px-1 py-0.5">
                <span className="font-mono text-neutral-500">{h}:00</span>
                <span className="truncate max-w-[55px] font-medium text-neutral-800">
                  {slot?.text ? slot.text : '—'}
                </span>
                <span
                  className={`w-2.5 h-2.5 border border-black/60 rounded-xs flex items-center justify-center ${
                    slot?.done ? 'bg-black text-white' : ''
                  }`}
                >
                  {slot?.done && <Check size={7} strokeWidth={3} />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Eisenhower Matrix preview & Brain dump */}
        <div className="flex flex-col gap-2">
          {/* Matrix 2x2 miniature */}
          <div className="border border-black bg-white grid grid-cols-2 divide-x divide-y divide-black text-[8px] font-mono">
            <div className="p-1 min-h-[38px] flex flex-col justify-between">
              <span className="font-bold text-[7px] text-neutral-700 leading-tight">URGENT</span>
              <span className="text-neutral-500 font-sans text-[8px]">
                {page.eisenhowerMatrix?.urgentImportant?.length || 0} مورد
              </span>
            </div>
            <div className="p-1 min-h-[38px] flex flex-col justify-between">
              <span className="font-bold text-[7px] text-neutral-700 leading-tight">IMPORTANT</span>
              <span className="text-neutral-500 font-sans text-[8px]">
                {page.eisenhowerMatrix?.importantNotUrgent?.length || 0} مورد
              </span>
            </div>
            <div className="p-1 min-h-[38px] flex flex-col justify-between">
              <span className="font-bold text-[7px] text-neutral-700 leading-tight">DELEGATE</span>
              <span className="text-neutral-500 font-sans text-[8px]">
                {page.eisenhowerMatrix?.urgentNotImportant?.length || 0} مورد
              </span>
            </div>
            <div className="p-1 min-h-[38px] flex flex-col justify-between">
              <span className="font-bold text-[7px] text-neutral-700 leading-tight">ELIMINATE</span>
              <span className="text-neutral-500 font-sans text-[8px]">
                {page.eisenhowerMatrix?.notUrgentNotImportant?.length || 0} مورد
              </span>
            </div>
          </div>

          {/* Dotted Lines Brain Dump Preview */}
          <div className="border border-neutral-300 bg-white/60 p-1.5 flex flex-col gap-1">
            <span className="text-[8px] font-mono font-bold text-neutral-600 block text-center border-b border-neutral-200 pb-0.5">
              BRAIN DUMP
            </span>
            <div className="flex flex-col gap-1">
              <div className="border-b border-dotted border-neutral-400 h-2" />
              <div className="border-b border-dotted border-neutral-400 h-2" />
              <div className="border-b border-dotted border-neutral-400 h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[10px] text-neutral-500 font-medium">
        <span className="font-bold text-neutral-800">قالب شماره ۲ (One Big Thing)</span>
        <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono text-[9px]">
          {filledSlots} بازه زمانی
        </span>
      </div>
    </div>
  );
};
