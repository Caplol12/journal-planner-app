import React from 'react';
import { DayPage } from '../types';
import { Trash2, Check, Sun, Home, Utensils, Moon } from 'lucide-react';
import {
  CelestialCrescentMoon,
  CelestialConstellations,
  MountainPineLandscape,
} from './CelestialArtwork';

interface MiniTemplate4SheetProps {
  page: DayPage;
  dateKey?: string;
  onOpen: () => void;
  onDelete?: () => void;
  hideDelete?: boolean;
}

export const MiniTemplate4Sheet: React.FC<MiniTemplate4SheetProps> = ({
  page,
  dateKey,
  onOpen,
  onDelete,
  hideDelete = false,
}) => {
  const data = page.celestialTodo || {
    dailyBasics: {
      morning: [
        { id: 'm1', text: 'Brush teeth', done: true },
        { id: 'm2', text: 'Face care', done: true },
        { id: 'm3', text: 'Body / shower', done: false },
        { id: 'm4', text: 'Get dressed', done: true },
      ],
      home: [
        { id: 'h1', text: 'Unload dishwasher', done: true },
        { id: 'h2', text: 'Load dishwasher', done: false },
        { id: 'h3', text: 'Clean dining table', done: true },
        { id: 'h4', text: 'Clean kitchen counter', done: false },
      ],
      meals: [
        { id: 'ml1', text: 'Eat breakfast', done: true },
        { id: 'ml2', text: 'Eat lunch', done: false },
        { id: 'ml3', text: 'Eat dinner', done: false },
      ],
      night: [
        { id: 'n1', text: 'Brush teeth', done: false },
        { id: 'n2', text: 'Face care', done: false },
      ],
    },
    todayTasks: [
      { id: 'tt1', text: 'Review weekly priorities', done: true },
      { id: 'tt2', text: 'Send project update email', done: true },
      { id: 'tt3', text: 'Draft chapter notes', done: false },
      { id: 'tt4', text: '30-min walk', done: false },
    ],
  };

  const allBasics = [
    ...data.dailyBasics.morning,
    ...data.dailyBasics.home,
    ...data.dailyBasics.meals,
    ...data.dailyBasics.night,
  ];

  const totalTasks = allBasics.length + data.todayTasks.length;
  const doneTasks =
    allBasics.filter((t) => t.done).length + data.todayTasks.filter((t) => t.done).length;

  return (
    <div
      onClick={onOpen}
      dir="ltr"
      className="w-full bg-[#071124] border-2 border-[#1a335a] hover:border-[#60a5fa] rounded-2xl p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden select-none font-serif text-[#1c2438]"
      style={{
        minHeight: '440px',
        backgroundImage:
          'radial-gradient(#1e3b66 0.8px, transparent 0.8px), radial-gradient(#14294a 0.8px, #071124 0.8px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      {/* Delete button on hover */}
      {!hideDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-white/95 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
          title="حذف این برگه"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* 1. Mini Top Banner */}
      <div className="w-full rounded-xl overflow-hidden border border-[#274677] shadow-xs mb-2 relative min-h-[46px]">
        {data.headerBannerUrl ? (
          <img
            src={data.headerBannerUrl}
            alt="Daily To-Do List"
            className="w-full h-12 object-cover"
          />
        ) : (
          <div className="w-full bg-[#061026] p-2 relative overflow-hidden flex items-center justify-between">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, #eff7fe 0%, #b8def6 25%, #4697bf 45%, #06132a 85%)',
              }}
            />
            <div className="relative z-10 w-full flex items-center justify-between gap-1">
              <CelestialCrescentMoon className="w-8 h-8 shrink-0 drop-shadow-2xs" />
              <div className="text-center flex-1">
                <span className="text-[6.5px] font-serif font-bold tracking-widest text-[#1c355e] uppercase block">
                  ✦ Pretty Functional ✦
                </span>
                <span className="text-xs font-black text-[#0c1f3d] font-serif leading-none block mt-0.5">
                  Daily To-Do List
                </span>
                <span className="text-[6px] font-serif tracking-widest text-[#183159] uppercase block mt-0.5 font-bold">
                  FOCUS • FOLLOW THROUGH • FEEL GOOD
                </span>
              </div>
              <CelestialConstellations className="w-9 h-7 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Mini Two-Column Layout */}
      <div className="bg-[#faf8f4] rounded-xl p-2 border border-[#d5c7b5] grid grid-cols-12 gap-2 flex-1 items-start relative overflow-hidden">
        {/* Left Column: Daily Basics (5 cols) */}
        <div className="col-span-5 flex flex-col gap-1.5 h-full">
          <div className="bg-[#0b1b36] text-white text-[7.5px] font-bold py-0.5 px-1 rounded text-center">
            Daily Basics ✦
          </div>

          {/* Morning */}
          <div className="bg-white border border-[#12284b] rounded p-1">
            <div className="flex items-center gap-1 text-[7px] font-bold text-[#0b1b36] border-b border-[#e2e8f0] pb-0.5 mb-1">
              <Sun size={8} className="text-amber-500" />
              <span>MORNING</span>
            </div>
            <div className="flex flex-col gap-0.5 text-[6.5px]">
              {data.dailyBasics.morning.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-xs border text-[5px] flex items-center justify-center ${t.done ? 'bg-[#0b1b36] text-white border-[#0b1b36]' : 'border-neutral-400'}`}>
                    {t.done ? '✓' : ''}
                  </span>
                  <span className={`truncate ${t.done ? 'line-through text-neutral-400' : 'text-[#1c2438]'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Home */}
          <div className="bg-white border border-[#12284b] rounded p-1">
            <div className="flex items-center gap-1 text-[7px] font-bold text-[#0b1b36] border-b border-[#e2e8f0] pb-0.5 mb-1">
              <Home size={8} className="text-blue-500" />
              <span>HOME</span>
            </div>
            <div className="flex flex-col gap-0.5 text-[6.5px]">
              {data.dailyBasics.home.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-xs border text-[5px] flex items-center justify-center ${t.done ? 'bg-[#0b1b36] text-white border-[#0b1b36]' : 'border-neutral-400'}`}>
                    {t.done ? '✓' : ''}
                  </span>
                  <span className={`truncate ${t.done ? 'line-through text-neutral-400' : 'text-[#1c2438]'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meals & Night */}
          <div className="bg-white border border-[#12284b] rounded p-1">
            <div className="flex items-center justify-between text-[7px] font-bold text-[#0b1b36] border-b border-[#e2e8f0] pb-0.5 mb-1">
              <span className="flex items-center gap-1">
                <Utensils size={7} className="text-emerald-500" />
                <span>MEALS</span>
              </span>
              <span className="flex items-center gap-1">
                <Moon size={7} className="text-indigo-500" />
                <span>NIGHT</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[6.5px] text-neutral-500">
              <span>{data.dailyBasics.meals.filter((t) => t.done).length}/{data.dailyBasics.meals.length} وعده</span>
              <span>{data.dailyBasics.night.filter((t) => t.done).length}/{data.dailyBasics.night.length} شب</span>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Tasks (7 cols) */}
        <div className="col-span-7 bg-white border border-[#12284b] rounded-lg p-1.5 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="bg-[#0b1b36] text-white text-[7.5px] font-bold py-0.5 px-1 rounded text-center mb-1">
            Today's Tasks ☾
          </div>

          <div className="flex flex-col gap-1 relative z-10 text-[7px]">
            {data.todayTasks.slice(0, 7).map((t, i) => (
              <div key={t.id} className="flex items-center gap-1 border-b border-dotted border-[#cbd5e1] pb-0.5">
                <span className={`w-2 h-2 rounded-xs border text-[5px] flex items-center justify-center ${t.done ? 'bg-[#0b1b36] text-white border-[#0b1b36]' : 'border-neutral-400'}`}>
                  {t.done ? '✓' : ''}
                </span>
                <span className={`truncate ${t.done ? 'line-through text-neutral-400' : 'text-[#15233c]'}`}>
                  {t.text || `تسک ${i + 1}`}
                </span>
              </div>
            ))}
          </div>

          {/* Misty Mountain Landscape at bottom */}
          <div className="w-full mt-1 opacity-50 pointer-events-none">
            <MountainPineLandscape className="w-full h-auto max-h-[45px]" />
          </div>
        </div>
      </div>

      {/* 3. Footer Strip */}
      <div className="mt-2 pt-1.5 border-t border-[#1a335a] flex items-center justify-between text-[10px] text-[#8ea7cb] font-sans font-medium">
        <span className="font-bold text-white">قالب شماره ۴ (Celestial To-Do)</span>
        <span className="bg-[#102344] text-[#93c5fd] border border-[#254b85] px-2 py-0.5 rounded-full font-bold text-[9px] shadow-2xs">
          {doneTasks} از {totalTasks} تسک
        </span>
      </div>
    </div>
  );
};
