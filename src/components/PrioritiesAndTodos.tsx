import React from 'react';
import { Star, Plus, Check, Trash2 } from 'lucide-react';
import { PriorityItem, TodoItem } from '../types';
import { sound } from '../utils/audio';

interface PrioritiesAndTodosProps {
  priorities: PriorityItem[];
  todos: TodoItem[];
  onUpdatePriority: (index: number, text: string, done: boolean) => void;
  onTogglePriorityDone: (index: number) => void;
  onUpdateTodoText: (id: string, text: string) => void;
  onToggleTodoDone: (id: string) => void;
  onAddTodo: () => void;
  onDeleteTodo: (id: string) => void;
}

export const PrioritiesAndTodos: React.FC<PrioritiesAndTodosProps> = ({
  priorities,
  todos,
  onUpdatePriority,
  onTogglePriorityDone,
  onUpdateTodoText,
  onToggleTodoDone,
  onAddTodo,
  onDeleteTodo,
}) => {
  // Ensure exactly 3 priorities
  const pList: PriorityItem[] = [
    priorities[0] || { text: '', done: false },
    priorities[1] || { text: '', done: false },
    priorities[2] || { text: '', done: false },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="bg-white/95 text-emerald-950 px-4 py-1 rounded-full text-xs font-black shadow-xs mb-0.5">
          لیست کارها و اولویت‌ها
        </div>
      </div>

      {/* 3 Top Priorities Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xl text-slate-800 flex flex-col gap-3 border border-emerald-900/10">
        <h3 className="text-center text-sm font-black text-slate-900 tracking-tight">۳ اولویت اصلی</h3>

        <div className="flex flex-col gap-2">
          {pList.map((priority, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 border-b border-emerald-100/70 pb-2 transition-colors hover:border-emerald-300"
            >
              <button
                type="button"
                onClick={() => {
                  if (!priority.done) {
                    sound.playStar();
                  } else {
                    sound.playTick(false);
                  }
                  onTogglePriorityDone(idx);
                }}
                className={`p-1 cursor-pointer transition-transform duration-200 hover:scale-125 ${
                  priority.done
                    ? 'text-amber-400 drop-shadow-md'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
                title={priority.done ? 'تکمیل شده' : 'علامت به عنوان اولویت تکمیل شده'}
              >
                <Star
                  size={20}
                  className={priority.done ? 'fill-amber-400 text-amber-500' : ''}
                />
              </button>

              <input
                type="text"
                value={priority.text}
                onChange={(e) => onUpdatePriority(idx, e.target.value, priority.done)}
                placeholder={`اولویت ${idx === 0 ? 'اول' : idx === 1 ? 'دوم' : 'سوم'}...`}
                className={`flex-1 bg-transparent border-none outline-none text-xs font-bold ${
                  priority.done ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* General Tasks Box */}
      <div className="flex flex-col gap-2.5 px-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              sound.playAdd();
              onAddTodo();
            }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-xl py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>افزودن کار جدید</span>
          </button>
          <span className="text-xs font-bold text-white/90">سایر کارهای روزانه</span>
        </div>

        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2.5 border-b border-white/35 pb-2 group"
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(!todo.done);
                  onToggleTodoDone(todo.id);
                }}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  todo.done
                    ? 'bg-[#cde6d8] border-[#cde6d8] text-slate-900'
                    : 'bg-white/10 border-white/60 hover:border-white text-transparent'
                }`}
              >
                {todo.done && <Check size={12} strokeWidth={3} className="text-[#22382c]" />}
              </button>

              <input
                type="text"
                value={todo.text}
                onChange={(e) => onUpdateTodoText(todo.id, e.target.value)}
                placeholder="کار جدید..."
                className={`flex-1 bg-transparent border-none outline-none text-xs font-medium text-white placeholder-white/40 ${
                  todo.done ? 'line-through text-white/50' : 'text-white'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  sound.playTick(false);
                  onDeleteTodo(todo.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-rose-300 p-0.5 transition-opacity cursor-pointer"
                title="حذف کار"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
