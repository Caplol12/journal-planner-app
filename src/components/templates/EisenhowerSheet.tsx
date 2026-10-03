import React from 'react';
import { Plus, Trash2, CheckSquare, Square, Star } from 'lucide-react';
import { DayPage } from '../../types';
import { sound } from '../../utils/audio';

interface EisenhowerSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
}

const EISENHOWER_HOURS = [
  '8:00',
  '9:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export const EisenhowerSheet: React.FC<EisenhowerSheetProps> = ({
  pageData,
  onUpdate,
}) => {
  const oneBigThing = pageData.oneBigThing || '';
  const matrix = pageData.eisenhowerMatrix || {
    urgentImportant: [''],
    notUrgentImportant: [''],
    urgentNotImportant: [''],
    notUrgentNotImportant: [''],
  };
  const brainDump = pageData.brainDump || '';

  const handleUpdateOneBigThing = (val: string) => {
    onUpdate((prev) => ({ ...prev, oneBigThing: val }));
  };

  const handleMatrixItemChange = (
    quadrant: keyof NonNullable<DayPage['eisenhowerMatrix']>,
    index: number,
    value: string
  ) => {
    onUpdate((prev) => {
      const curMatrix = { ...(prev.eisenhowerMatrix || matrix) };
      const list = [...(curMatrix[quadrant] || [''])];
      list[index] = value;
      curMatrix[quadrant] = list;
      return { ...prev, eisenhowerMatrix: curMatrix };
    });
  };

  const handleAddMatrixItem = (quadrant: keyof NonNullable<DayPage['eisenhowerMatrix']>) => {
    sound.playAdd();
    onUpdate((prev) => {
      const curMatrix = { ...(prev.eisenhowerMatrix || matrix) };
      const list = [...(curMatrix[quadrant] || []), ''];
      curMatrix[quadrant] = list;
      return { ...prev, eisenhowerMatrix: curMatrix };
    });
  };

  const handleDeleteMatrixItem = (
    quadrant: keyof NonNullable<DayPage['eisenhowerMatrix']>,
    index: number
  ) => {
    onUpdate((prev) => {
      const curMatrix = { ...(prev.eisenhowerMatrix || matrix) };
      const list = [...(curMatrix[quadrant] || [])];
      if (list.length <= 1) {
        list[0] = '';
      } else {
        list.splice(index, 1);
      }
      curMatrix[quadrant] = list;
      return { ...prev, eisenhowerMatrix: curMatrix };
    });
  };

  const handleUpdateSlot = (hour: number, text: string) => {
    onUpdate((prev) => {
      const slots = { ...prev.timeSlots };
      slots[hour] = { ...(slots[hour] || { color: '#86c5a5' }), text };
      return { ...prev, timeSlots: slots };
    });
  };

  const handleToggleSlotDone = (hour: number) => {
    sound.playTick(true);
    onUpdate((prev) => {
      const slots = { ...prev.timeSlots };
      const cur = slots[hour] || { text: '', color: '' };
      slots[hour] = { ...cur, cat: cur.cat === 'done' ? undefined : 'done' };
      return { ...prev, timeSlots: slots };
    });
  };

  return (
    <div className="w-full bg-[#fcfaf7] text-slate-900 rounded-[32px] p-6 md:p-10 shadow-2xl border-2 border-slate-900 flex flex-col gap-6 font-sans">
      {/* 1. Top Bold Banner: THE ONE BIG THING */}
      <div className="flex flex-col gap-2">
        <div className="bg-black text-white text-center py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-3">
          <Star size={20} className="fill-amber-400 text-amber-400 shrink-0" />
          <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase">
            THE ONE BIG THING
          </h2>
          <Star size={20} className="fill-amber-400 text-amber-400 shrink-0" />
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-2xl p-3 shadow-inner flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase shrink-0">
            مهم‌ترین هدف امروز:
          </span>
          <input
            type="text"
            value={oneBigThing}
            onChange={(e) => handleUpdateOneBigThing(e.target.value)}
            placeholder="تنها کار اساسی که اگر امروز انجام شود، روز به یک پیروزی کامل تبدیل می‌شود..."
            className="flex-1 bg-transparent text-sm md:text-base font-extrabold text-slate-900 outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* 2-Column Split: Time Blocking (Left) vs Eisenhower Matrix & Brain Dump (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: TIME BLOCKING (8 AM - 6 PM) */}
        <div className="flex flex-col gap-3">
          <div className="text-center border-b-2 border-slate-900 pb-1">
            <h3 className="text-sm font-black tracking-wider uppercase text-slate-900">
              TIME BLOCKING (8 AM - 6 PM)
            </h3>
          </div>

          <div className="border-2 border-slate-900 bg-white rounded-2xl overflow-hidden divide-y-2 divide-slate-900 shadow-sm">
            {EISENHOWER_HOURS.map((hourStr, idx) => {
              const hourNum = 8 + idx;
              const slot = pageData.timeSlots[hourNum] || { text: '', color: '' };
              const isDone = slot.cat === 'done';

              return (
                <div key={hourStr} className="flex items-center divide-x-2 divide-slate-900">
                  {/* Time label */}
                  <div className="w-18 py-2.5 px-3 text-center text-xs font-black font-mono text-slate-900 shrink-0 bg-slate-50 select-none">
                    {hourStr}
                  </div>

                  {/* Task text */}
                  <input
                    type="text"
                    value={slot.text || ''}
                    onChange={(e) => handleUpdateSlot(hourNum, e.target.value)}
                    placeholder="فعالیت این بازه زمانی..."
                    className={`flex-1 px-3 py-2 text-xs font-bold outline-none bg-transparent transition-colors ${
                      isDone ? 'line-through text-slate-400 bg-slate-50' : 'text-slate-800'
                    }`}
                  />

                  {/* Square checkbox at right */}
                  <button
                    type="button"
                    onClick={() => handleToggleSlotDone(hourNum)}
                    className="w-10 py-2.5 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="علامت تکمیل"
                  >
                    {isDone ? (
                      <CheckSquare size={17} className="text-emerald-700" />
                    ) : (
                      <Square size={17} className="text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EISENHOWER PRIORITY MATRIX + BRAIN DUMP */}
        <div className="flex flex-col gap-6">
          {/* Matrix Header */}
          <div className="flex flex-col gap-3">
            <div className="text-center border-b-2 border-slate-900 pb-1">
              <h3 className="text-sm font-black tracking-wider uppercase text-slate-900">
                EISENHOWER PRIORITY MATRIX
              </h3>
            </div>

            {/* 4 Quadrants 2x2 Grid */}
            <div className="border-2 border-slate-900 rounded-2xl bg-white overflow-hidden grid grid-cols-2 divide-x-2 divide-y-2 divide-slate-900 shadow-sm">
              {/* Quadrant 1: URGENT & IMPORTANT */}
              <div className="p-3 flex flex-col gap-2 min-h-[140px] bg-rose-50/40">
                <div className="flex items-center justify-between border-b border-rose-200 pb-1">
                  <span className="text-[10.5px] font-black tracking-tight text-rose-800 uppercase">
                    URGENT & IMPORTANT (فوری و مهم)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('urgentImportant')}
                    className="text-rose-700 hover:bg-rose-100 p-0.5 rounded cursor-pointer"
                    title="افزودن تسک"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  {(matrix.urgentImportant || ['']).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 group">
                      <span className="text-[10px] text-rose-500 font-bold">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleMatrixItemChange('urgentImportant', idx, e.target.value)
                        }
                        placeholder="کار بحرانی..."
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMatrixItem('urgentImportant', idx)}
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadrant 2: IMPORTANT, NOT URGENT */}
              <div className="p-3 flex flex-col gap-2 min-h-[140px] bg-emerald-50/40">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                  <span className="text-[10.5px] font-black tracking-tight text-emerald-800 uppercase">
                    IMPORTANT, NOT URGENT (مهم، غیرفوری)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('notUrgentImportant')}
                    className="text-emerald-700 hover:bg-emerald-100 p-0.5 rounded cursor-pointer"
                    title="افزودن تسک"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  {(matrix.notUrgentImportant || ['']).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 group">
                      <span className="text-[10px] text-emerald-500 font-bold">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleMatrixItemChange('notUrgentImportant', idx, e.target.value)
                        }
                        placeholder="برنامه‌ریزی، رشد..."
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMatrixItem('notUrgentImportant', idx)}
                        className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-emerald-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadrant 3: URGENT, NOT IMPORTANT */}
              <div className="p-3 flex flex-col gap-2 min-h-[140px] bg-amber-50/40">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                  <span className="text-[10.5px] font-black tracking-tight text-amber-800 uppercase">
                    URGENT, NOT IMPORTANT (فوری، غیرمهم)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('urgentNotImportant')}
                    className="text-amber-700 hover:bg-amber-100 p-0.5 rounded cursor-pointer"
                    title="افزودن تسک"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  {(matrix.urgentNotImportant || ['']).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 group">
                      <span className="text-[10px] text-amber-500 font-bold">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleMatrixItemChange('urgentNotImportant', idx, e.target.value)
                        }
                        placeholder="تفویض به دیگران..."
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMatrixItem('urgentNotImportant', idx)}
                        className="opacity-0 group-hover:opacity-100 text-amber-400 hover:text-amber-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadrant 4: NOT URGENT, NOT IMPORTANT */}
              <div className="p-3 flex flex-col gap-2 min-h-[140px] bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-[10.5px] font-black tracking-tight text-slate-700 uppercase">
                    NOT URGENT, NOT IMPORTANT (حذف شود)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('notUrgentNotImportant')}
                    className="text-slate-600 hover:bg-slate-200 p-0.5 rounded cursor-pointer"
                    title="افزودن تسک"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  {(matrix.notUrgentNotImportant || ['']).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 group">
                      <span className="text-[10px] text-slate-400 font-bold">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleMatrixItemChange('notUrgentNotImportant', idx, e.target.value)
                        }
                        placeholder="حواشی قابل حذف..."
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMatrixItem('notUrgentNotImportant', idx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BRAIN DUMP Dotted Lines Area */}
          <div className="flex flex-col gap-2">
            <div className="text-center">
              <span className="text-xs font-black tracking-widest uppercase text-slate-800">
                BRAIN DUMP (تخلیه ذهن و ایده‌های آزاد)
              </span>
            </div>

            <div className="border-2 border-slate-900 rounded-2xl p-4 bg-white shadow-inner">
              <textarea
                value={brainDump}
                onChange={(e) => onUpdate((prev) => ({ ...prev, brainDump: e.target.value }))}
                placeholder="تمام افکار پراکنده، ایده‌ها، تماس‌ها و مواردی که باید از ذهن خارج شوند را اینجا یادداشت کنید..."
                rows={7}
                className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 leading-7 resize-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 27px, #cbd5e1 27px, #cbd5e1 28px)',
                  lineHeight: '28px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
