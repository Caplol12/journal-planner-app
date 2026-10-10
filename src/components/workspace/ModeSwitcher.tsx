import React from 'react';
import {
  List,
  LayoutGrid,
  Columns,
  Maximize2,
  BookOpen,
  Layers,
  Sparkles,
  Rows,
} from 'lucide-react';
import { ViewMode } from '../../types';
import { sound } from '../../utils/audio';

interface ModeSwitcherProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onSelectMode }) => {
  const modes: { id: ViewMode; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'feed', label: 'فید عمودی', icon: Rows },
    { id: 'grid', label: 'گرید بنتو', icon: LayoutGrid },
    { id: 'canvas', label: 'بوم بی‌نهایت', icon: Sparkles },
    { id: 'split', label: 'اسپلیت', icon: Columns },
    { id: 'tabs', label: 'تب‌ها', icon: List },
    { id: 'book', label: 'کتاب', icon: BookOpen },
    { id: 'floating', label: 'شناور', icon: Layers },
    { id: 'stack', label: 'پشته', icon: Maximize2 },
  ];

  return (
    <div
      dir="rtl"
      className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-850 rounded-xl border border-stone-200/70 dark:border-stone-800/70 shadow-2xs overflow-x-auto max-w-full"
    >
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              sound.playTick(true);
              onSelectMode(m.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs ring-1 ring-stone-900/10 dark:ring-white/10'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
            title={`تغییر حالت به: ${m.label}`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
