import React, { useState } from 'react';
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
  { h: 6, label: '6 AM' },
  { h: 7, label: '7 AM' },
  { h: 8, label: '8 AM' },
  { h: 9, label: '9 AM' },
  { h: 10, label: '10 AM' },
  { h: 11, label: '11 AM' },
  { h: 12, label: '12 PM' },
  { h: 13, label: '1 PM' },
  { h: 14, label: '2 PM' },
  { h: 15, label: '3 PM' },
  { h: 16, label: '4 PM' },
  { h: 17, label: '5 PM' },
  { h: 18, label: '6 PM' },
  { h: 19, label: '7 PM' },
  { h: 20, label: '8 PM' },
  { h: 21, label: '9 PM' },
  { h: 22, label: '10 PM' },
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
    <div className="flex flex-col gap-2">
      <div className="text-center mb-1">
        <div className="inline-block bg-white/95 text-emerald-950 px-4 py-1 rounded-full text-xs font-black shadow-xs mb-1.5">
          Linear Time Blocking
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">زمان‌بندی روزانه</h3>
      </div>

      <div className="bg-[#cde6d8] rounded-3xl p-4 md:p-5 shadow-lg flex flex-col gap-1.5 border border-emerald-900/10">
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
                isHovered ? 'bg-[#3b634d]/20 ring-1 ring-[#3b634d]/40' : 'hover:bg-emerald-800/10'
              }`}
            >
              {/* Hour Tag (LTR styled for classic planner aesthetic) */}
              <div className="w-16 font-mono font-extrabold text-xs text-slate-800 text-left shrink-0 select-none">
                {label}
              </div>

              {/* Input text container */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={slot.text || ''}
                  onChange={(e) => onUpdateSlotText(h, e.target.value)}
                  placeholder={`برنامه ساعت ${toPersianDigits(h)}...`}
                  className="w-full bg-[#739884] focus:bg-[#5f8772] text-white placeholder-emerald-100/60 text-xs font-semibold rounded-xl px-3 py-2 pr-9 outline-none transition-colors border border-emerald-800/20 focus:border-white shadow-2xs"
                  style={slot.color ? { borderRight: `6px solid ${slot.color}` } : undefined}
                />

                {/* Color Button with Popover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playTick(true);
                    setActivePickerHour(isPickerOpen ? null : h);
                  }}
                  title="انتخاب رنگ / دسته‌بندی"
                  className="absolute left-2 w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-125 shrink-0"
                  style={{ backgroundColor: slot.color || '#739884' }}
                />

                {/* Color Popover dropdown */}
                {isPickerOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-200 flex flex-col gap-1 z-40 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="text-[11px] font-extrabold text-slate-600 px-2 py-1 border-b border-slate-100 mb-1">
                      دسته‌بندی ساعت {toPersianDigits(h)}:۰۰
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSlotColor(h, '');
                        setActivePickerHour(null);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 text-right cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-300" />
                      <span>خالی / پیش‌فرض</span>
                    </button>

                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onUpdateSlotColor(h, c.color, c.id);
                          setActivePickerHour(null);
                        }}
                        className="flex items-center justify-between p-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 text-right cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </div>
                        <span className="text-sm">{c.icon}</span>
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
