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
      {/* 3 Top Priorities Section */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 text-stone-900 dark:text-stone-100 flex flex-col gap-3 border border-stone-200/70 dark:border-stone-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800 pb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
            ۳ اولویت اصلی روز
          </h3>
          <span className="text-[10px] text-stone-400 font-medium">اهداف کلیدی</span>
        </div>

        <div className="flex flex-col gap-2">
          {pList.map((priority, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60 pb-2 transition-colors hover:border-stone-300 dark:hover:border-stone-700"
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
                className="p-1 cursor-pointer transition-transform duration-150 hover:scale-110"
                title={priority.done ? 'تکمیل شده' : 'علامت به عنوان اولویت تکمیل شده'}
              >
                <Star
                  size={16}
                  strokeWidth={1.8}
                  className={priority.done ? 'fill-amber-400 text-amber-500' : 'text-stone-300 dark:text-stone-600 hover:text-amber-400'}
                />
              </button>

              <input
                type="text"
                value={priority.text}
                onChange={(e) => onUpdatePriority(idx, e.target.value, priority.done)}
                placeholder={`اولویت ${idx === 0 ? 'اول' : idx === 1 ? 'دوم' : 'سوم'}...`}
                className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm transition-colors ${
                  priority.done
                    ? 'line-through text-stone-400 dark:text-stone-500 font-normal'
                    : 'text-stone-800 dark:text-stone-200 font-medium'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* General Tasks List */}
      <div className="flex flex-col gap-2.5 px-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">سایر کارهای روزانه</span>
          <button
            type="button"
            onClick={() => {
              sound.playAdd();
              onAddTodo();
            }}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg py-1 px-2 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>کار جدید</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2.5 border-b border-stone-200/40 dark:border-stone-800/40 pb-2 group"
            >
              <button
                type="button"
                onClick={() => {
                  sound.playTick(!todo.done);
                  onToggleTodoDone(todo.id);
                }}
                className={`w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  todo.done
                    ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                    : 'border-stone-300 dark:border-stone-600 hover:border-stone-500 bg-transparent text-transparent'
                }`}
              >
                {todo.done && <Check size={11} strokeWidth={2.8} />}
              </button>

              <input
                type="text"
                value={todo.text}
                onChange={(e) => onUpdateTodoText(todo.id, e.target.value)}
                placeholder="تسک جدید..."
                className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-normal transition-colors ${
                  todo.done
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-800 dark:text-stone-200'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  sound.playTick(false);
                  onDeleteTodo(todo.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer"
                title="حذف کار"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {todos.length === 0 && (
            <button
              type="button"
              onClick={onAddTodo}
              className="py-3 text-center text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl cursor-pointer transition-colors"
            >
              + افزودن نخستین کار روزانه
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
