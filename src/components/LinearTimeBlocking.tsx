import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { DayPage, CategoryOption } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { sound } from '../utils/audio';

interface LinearTimeBlockingProps {
  pageData: DayPage;
  onUpdateSlotText: (hour: number, text: string) => void;
  onUpdateSlotColor: (hour: number, color: string, cat?: string) => void;
  categories: CategoryOption[];
  hoveredHour: number | null;
  onHoverHour: (hour: number | null) => void;
}

export const LINEAR_HOURS = [
  { h: 6, label: '6:00' },
  { h: 7, label: '7:00' },
  { h: 8, label: '8:00' },
  { h: 9, label: '9:00' },
  { h: 10, label: '10:00' },
  { h: 11, label: '11:00' },
  { h: 12, label: '12:00' },
  { h: 13, label: '13:00' },
  { h: 14, label: '14:00' },
  { h: 15, label: '15:00' },
  { h: 16, label: '16:00' },
  { h: 17, label: '17:00' },
  { h: 18, label: '18:00' },
  { h: 19, label: '19:00' },
  { h: 20, label: '20:00' },
  { h: 21, label: '21:00' },
  { h: 22, label: '22:00' },
];

export const LinearTimeBlocking: React.FC<LinearTimeBlockingProps> = ({
  pageData,
  onUpdateSlotText,
  onUpdateSlotColor,
  categories,
  hoveredHour,
  onHoverHour,
}) => {
  const [activePickerHour, setActivePickerHour] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Time Blocking Container */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 text-stone-900 dark:text-stone-100 flex flex-col gap-2 border border-stone-200/70 dark:border-stone-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-2.5 mb-1">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-stone-500" />
            <h3 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
              زمان‌بندی خطی روز
            </h3>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">ساعت ۶ تا ۲۲</span>
        </div>

        {LINEAR_HOURS.map(({ h, label }) => {
          const slot = pageData.timeSlots[h] || { text: '', color: '' };
          const isHovered = hoveredHour === h;
          const isPickerOpen = activePickerHour === h;

          return (
            <div
              key={h}
              onMouseEnter={() => onHoverHour(h)}
              onMouseLeave={() => onHoverHour(null)}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-1 transition-all duration-150 ${
                isHovered
                  ? 'bg-stone-200/50 dark:bg-stone-800/60 ring-1 ring-stone-300 dark:ring-stone-700'
                  : 'hover:bg-stone-100/60 dark:hover:bg-stone-800/30'
              }`}
            >
              {/* Hour Label */}
              <div className="w-12 font-mono text-xs font-medium text-stone-500 dark:text-stone-400 text-left shrink-0 select-none">
                {label}
              </div>

              {/* Input text container */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={slot.text || ''}
                  onChange={(e) => onUpdateSlotText(h, e.target.value)}
                  placeholder={`برنامه ساعت ${toPersianDigits(h)}...`}
                  className="w-full bg-stone-50 dark:bg-stone-800/40 focus:bg-white dark:focus:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 text-xs sm:text-sm font-normal rounded-xl px-3 py-1.5 pr-8 outline-none transition-colors border border-stone-200/60 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-600 shadow-2xs"
                />
                {slot.color && (
                  <span
                    className="absolute right-2.5 w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{ backgroundColor: slot.color }}
                  />
                )}

                {/* Color Button with Popover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playTick(true);
                    setActivePickerHour(isPickerOpen ? null : h);
                  }}
                  title="انتخاب رنگ و دسته‌بندی"
                  className="absolute left-2 w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-stone-600 shadow-2xs cursor-pointer transition-transform hover:scale-125 shrink-0"
                  style={{ backgroundColor: slot.color || 'transparent' }}
                />

                {/* Color Popover dropdown */}
                {isPickerOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-[#1c1c1b] rounded-xl p-2 shadow-xl border border-stone-200/80 dark:border-stone-800 flex flex-col gap-0.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="text-[10px] font-medium text-stone-400 px-2 py-1 border-b border-stone-100 dark:border-stone-800 mb-0.5">
                      دسته‌بندی ساعت {toPersianDigits(h)}:۰۰
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSlotColor(h, '');
                        setActivePickerHour(null);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-xs font-normal text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full border border-dashed border-stone-300 dark:border-stone-600" />
                      <span>بدون رنگ</span>
                    </button>

                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onUpdateSlotColor(h, c.color, c.id);
                          setActivePickerHour(null);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg text-xs font-normal text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-right cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
