import React, { useState } from 'react';
import { Sparkles, Trash2, Plus, Check } from 'lucide-react';
import { HabitItem } from '../types';
import { sound } from '../utils/audio';
import { toPersianDigits } from '../utils/jalali';

interface HabitsAndNotesProps {
  habits: HabitItem[];
  dailyNotes: string;
  onUpdateHabit: (id: string, done: boolean) => void;
  onUpdateHabitText: (id: string, text: string) => void;
  onAddHabit: (text: string) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export const HabitsAndNotes: React.FC<HabitsAndNotesProps> = ({
  habits,
  dailyNotes,
  onUpdateHabit,
  onUpdateHabitText,
  onAddHabit,
  onDeleteHabit,
  onUpdateNotes,
}) => {
  const [newHabitText, setNewHabitText] = useState('');

  const completedCount = habits.filter((h) => h.done).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleAdd = () => {
    if (newHabitText.trim()) {
      sound.playAdd();
      onAddHabit(newHabitText.trim());
      setNewHabitText('');
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex justify-end">
        <div className="bg-white/95 text-emerald-950 px-4 py-1 rounded-full text-xs font-black shadow-xs mb-1">
          عادات و برنامه‌های روزانه
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl text-slate-800 flex flex-col gap-4 border border-emerald-900/10">
        {/* Habits Subtitle & Progress */}
        <div className="flex items-center justify-between border-b border-emerald-50 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
            <Sparkles size={15} className="text-emerald-600" />
            <span>چک‌لیست روتین‌های روزانه</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              {toPersianDigits(completedCount)} از {toPersianDigits(habits.length)}
            </span>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700">
              %{toPersianDigits(progressPercent)}
            </span>
          </div>
        </div>

        {/* Habits List */}
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 border ${
                habit.done
                  ? 'bg-emerald-50/60 border-emerald-200/60 text-slate-400'
                  : 'bg-[#f7faf8] border-emerald-100 hover:border-emerald-300 text-slate-800'
              } group`}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(!habit.done);
                  onUpdateHabit(habit.id, !habit.done);
                }}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  habit.done
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'bg-white border-emerald-600/60 hover:border-emerald-700'
                }`}
              >
                {habit.done && <Check size={12} strokeWidth={3} />}
              </button>

              <input
                type="text"
                value={habit.text}
                onChange={(e) => onUpdateHabitText(habit.id, e.target.value)}
                className={`flex-1 bg-transparent text-xs font-semibold outline-none transition-colors ${
                  habit.done ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  sound.playTick(false);
                  onDeleteHabit(habit.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 transition-opacity cursor-pointer"
                title="حذف عادت"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {/* Add Habit Input */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newHabitText}
              onChange={(e) => setNewHabitText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="عادت یا روتین جدید..."
              className="flex-1 border border-dashed border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 bg-[#fbfdfc]"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus size={13} />
              <span>افزودن</span>
            </button>
          </div>
        </div>

        {/* Notes & Daily Reflection Section */}
        <div className="mt-2 pt-3 border-t-2 border-dashed border-emerald-100">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900 mb-2">
            <span>✍️</span>
            <span>یادداشت‌ها و بازتاب روز (Daily Reflection)</span>
          </div>

          <textarea
            value={dailyNotes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="افکار مهم، دستاوردهای روز، شکرگزاری و ایده‌های آزاد امروز را در این بخش بنویسید..."
            rows={4}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-700 leading-7 notebook-lines resize-none font-medium"
          />
        </div>
      </div>
    </section>
  );
};
