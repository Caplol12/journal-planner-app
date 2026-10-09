import React, { useState } from 'react';
import { PenLine, Trash2, Plus, Check } from 'lucide-react';
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
    <section className="flex flex-col gap-4">
      {/* Habits & Routines Card */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 text-stone-900 dark:text-stone-100 flex flex-col gap-4 border border-stone-200/70 dark:border-stone-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Habits Header & Progress */}
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-2.5">
          <h3 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
            عادات و روتین‌های روزانه
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-mono">
              {toPersianDigits(completedCount)} از {toPersianDigits(habits.length)}
            </span>
            <div className="w-16 h-1.5 bg-stone-150 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
              %{toPersianDigits(progressPercent)}
            </span>
          </div>
        </div>

        {/* Habits List */}
        <div className="flex flex-col gap-1.5">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-stone-150/70 dark:border-stone-800/70 bg-stone-50/50 dark:bg-stone-800/30 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-150 group"
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(!habit.done);
                  onUpdateHabit(habit.id, !habit.done);
                }}
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  habit.done
                    ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                    : 'border-stone-300 dark:border-stone-600 hover:border-stone-500 bg-transparent text-transparent'
                }`}
              >
                {habit.done && <Check size={10} strokeWidth={2.8} />}
              </button>

              <input
                type="text"
                value={habit.text}
                onChange={(e) => onUpdateHabitText(habit.id, e.target.value)}
                className={`flex-1 bg-transparent text-xs sm:text-sm font-normal outline-none transition-colors ${
                  habit.done
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-800 dark:text-stone-200'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  sound.playTick(false);
                  onDeleteHabit(habit.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer"
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
              className="flex-1 border border-stone-200/80 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 outline-none focus:border-stone-400 dark:focus:border-stone-600 bg-transparent transition-colors"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus size={13} />
              <span>افزودن</span>
            </button>
          </div>
        </div>

        {/* Notes & Daily Reflection Section */}
        <div className="mt-2 pt-3 border-t border-stone-200/50 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200 mb-2">
            <PenLine size={14} className="text-stone-500" />
            <span>یادداشت‌ها و بازتاب روز</span>
          </div>

          <textarea
            value={dailyNotes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="افکار مهم، دستاوردهای روز، شکرگزاری و ایده‌های آزاد امروز را در این بخش بنویسید..."
            rows={5}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-[1.85] notebook-lines resize-none font-normal placeholder-stone-400"
          />
        </div>
      </div>
    </section>
  );
};
