import React, { useState } from 'react';
import { DayPage, CelestialTemplateData, CelestialTaskItem } from '../types';
import { sound } from '../utils/audio';
import { Check, Plus, Trash2, Sun, Home, Utensils, Moon, Crop, Sparkles } from 'lucide-react';
import {
  CelestialCrescentMoon,
  CelestialConstellations,
  MountainPineLandscape,
  BotanicalBranchDoodle,
} from './CelestialArtwork';
import { ArtworkCropModal } from './ArtworkCropModal';

interface Template4CelestialSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
  isMiniPreview?: boolean;
}

export const Template4CelestialSheet: React.FC<Template4CelestialSheetProps> = ({
  pageData,
  onUpdate,
  isMiniPreview = false,
}) => {
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Safe default data
  const data: CelestialTemplateData = pageData.celestialTodo || {
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
        { id: 'h5', text: 'Vacuum', done: false },
        { id: 'h6', text: 'Tidy living room', done: false },
        { id: 'h7', text: 'Make / tidy beds', done: true },
        { id: 'h8', text: 'Check / take out trash', done: false },
        { id: 'h9', text: 'Cook / prepare food', done: false },
        { id: 'h10', text: 'Pick up for the night', done: false },
      ],
      meals: [
        { id: 'ml1', text: 'Eat breakfast', done: true },
        { id: 'ml2', text: 'Eat lunch', done: false },
        { id: 'ml3', text: 'Eat dinner', done: false },
        { id: 'ml4', text: 'Snack', done: false },
        { id: 'ml5', text: 'Drink water', done: true },
      ],
      night: [
        { id: 'n1', text: 'Brush teeth', done: false },
        { id: 'n2', text: 'Face care', done: false },
        { id: 'n3', text: 'Tidy for tomorrow', done: false },
        { id: 'n4', text: 'Relax & recharge', done: false },
      ],
    },
    todayTasks: [
      { id: 'tt1', text: 'Review weekly priorities and plan calendar', done: true },
      { id: 'tt2', text: 'Send project update email to team', done: true },
      { id: 'tt3', text: 'Draft chapter overview and notes', done: false },
      { id: 'tt4', text: 'Call pharmacy and pick up prescription', done: false },
      { id: 'tt5', text: '30-minute evening walk in the park', done: false },
      { id: 'tt6', text: '', done: false },
      { id: 'tt7', text: '', done: false },
      { id: 'tt8', text: '', done: false },
      { id: 'tt9', text: '', done: false },
      { id: 'tt10', text: '', done: false },
      { id: 'tt11', text: '', done: false },
      { id: 'tt12', text: '', done: false },
      { id: 'tt13', text: '', done: false },
      { id: 'tt14', text: '', done: false },
      { id: 'tt15', text: '', done: false },
      { id: 'tt16', text: '', done: false },
      { id: 'tt17', text: '', done: false },
      { id: 'tt18', text: '', done: false },
      { id: 'tt19', text: '', done: false },
    ],
  };

  const updateData = (updater: (prev: CelestialTemplateData) => CelestialTemplateData) => {
    onUpdate((prev) => {
      const current = prev.celestialTodo || data;
      return {
        ...prev,
        templateType: 'template-4-celestial-todo',
        celestialTodo: updater(current),
      };
    });
  };

  // Toggle Basic Task
  const toggleBasicTask = (section: keyof typeof data.dailyBasics, taskId: string) => {
    sound.playTick();
    updateData((prev) => {
      const list = prev.dailyBasics[section].map((item) =>
        item.id === taskId ? { ...item, done: !item.done } : item
      );
      return {
        ...prev,
        dailyBasics: {
          ...prev.dailyBasics,
          [section]: list,
        },
      };
    });
  };

  // Update Basic Task Text
  const updateBasicTaskText = (section: keyof typeof data.dailyBasics, taskId: string, text: string) => {
    updateData((prev) => {
      const list = prev.dailyBasics[section].map((item) =>
        item.id === taskId ? { ...item, text } : item
      );
      return {
        ...prev,
        dailyBasics: {
          ...prev.dailyBasics,
          [section]: list,
        },
      };
    });
  };

  // Toggle Today's Task
  const toggleTodayTask = (taskId: string) => {
    sound.playTick();
    updateData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      ),
    }));
  };

  // Update Today's Task Text
  const updateTodayTaskText = (taskId: string, text: string) => {
    updateData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.map((t) =>
        t.id === taskId ? { ...t, text } : t
      ),
    }));
  };

  // Add Task to Today's Tasks
  const handleAddTodayTask = () => {
    sound.playAdd();
    updateData((prev) => ({
      ...prev,
      todayTasks: [
        ...prev.todayTasks,
        { id: `tt_${Date.now()}`, text: '', done: false },
      ],
    }));
  };

  return (
    <div
      dir="ltr"
      className="w-full bg-[#071124] text-[#1c2438] p-3 sm:p-6 md:p-8 font-serif shadow-2xl rounded-3xl border-2 border-[#1a2f52] relative select-text"
      style={{
        boxShadow: '0 25px 60px -15px rgba(5, 12, 30, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        backgroundImage:
          'radial-gradient(#1e3b66 1px, transparent 1px), radial-gradient(#14294a 1px, #071124 1px)',
        backgroundSize: '36px 36px',
        backgroundPosition: '0 0, 18px 18px',
      }}
    >
      {/* ========================================================
          1. TOP COSMIC BANNER (STARRY SKY, MOON, TITLE)
         ======================================================== */}
      <header className="relative w-full rounded-2xl overflow-hidden border border-[#2b4c80] shadow-xl mb-5 min-h-[145px] sm:min-h-[175px] md:min-h-[195px] flex items-center justify-center">
        {data.headerBannerUrl ? (
          <div className="relative w-full h-full min-h-[145px] sm:min-h-[175px] md:min-h-[195px]">
            <img
              src={data.headerBannerUrl}
              alt="Daily To-Do List Celestial Banner"
              className="w-full h-full object-cover select-none"
            />
          </div>
        ) : (
          <div className="relative w-full h-full bg-[#061026] p-4 sm:p-6 md:p-8 overflow-hidden select-none flex items-center justify-between">
            {/* Deep space aurora gradient background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, #eff7fe 0%, #b8def6 20%, #4697bf 36%, #123d68 55%, #06132a 78%, #030914 100%)',
              }}
            />

            {/* Glowing Aurora Borealis Ribbons across the sky */}
            <div
              className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 65% 45% at 18% 42%, rgba(45, 212, 191, 0.5), transparent), radial-gradient(ellipse 55% 45% at 82% 38%, rgba(129, 140, 248, 0.45), transparent), radial-gradient(ellipse 42% 65% at 50% 50%, rgba(255, 255, 255, 0.96), transparent)',
              }}
            />

            {/* Faint stardust pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-45 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Radiant White Nebular Aura behind center title */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-[580px] h-[88%] rounded-[100%] bg-gradient-to-r from-transparent via-white/95 to-transparent blur-md pointer-events-none" />

            {/* Main Content Layer */}
            <div className="relative z-10 w-full flex items-center justify-between gap-3 sm:gap-6">
              {/* Left: Ornate Golden Crescent Moon & Laurel Branch */}
              <div className="shrink-0 flex items-center justify-center pl-1 sm:pl-2">
                <CelestialCrescentMoon className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-[0_0_14px_rgba(254,240,138,0.55)]" />
              </div>

              {/* Center: Typography in deep ink midnight navy */}
              <div className="text-center flex-1 py-1">
                <div className="text-[10px] sm:text-xs font-serif tracking-[0.26em] text-[#1c355e] uppercase mb-1 font-bold">
                  ✦ Pretty Functional ✦
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-black tracking-tight text-[#0c1f3d] drop-shadow-xs leading-none">
                  Daily To-Do List
                </h1>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mt-2 text-[9px] sm:text-[11px] font-serif tracking-[0.22em] text-[#183159] uppercase font-bold">
                  <span>FOCUS.</span>
                  <span>FOLLOW THROUGH.</span>
                  <span>FEEL GOOD.</span>
                </div>
                {/* Ornamental divider line with star */}
                <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-[260px] sm:max-w-[320px] mx-auto opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#183159]" />
                  <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#183159] to-transparent" />
                  <span className="text-[#183159] text-[11px] leading-none">✦</span>
                  <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#183159] to-transparent" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#183159]" />
                </div>
              </div>

              {/* Right: Constellation with 8-Point Starburst */}
              <div className="shrink-0 flex items-center justify-center pr-1 sm:pr-2">
                <CelestialConstellations className="w-20 h-16 sm:w-28 sm:h-22 md:w-32 md:h-24 drop-shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. TWO-COLUMN MAIN CONTENT (PARCHMENT CARD)
         ======================================================== */}
      <div className="bg-[#faf8f4] rounded-2xl p-4 sm:p-6 md:p-7 border-2 border-[#d5c7b5] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Left Column: "Daily Basics" (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Daily Basics Main Header Banner */}
          <div className="bg-[#0b1b36] border border-[#1d3c6d] rounded-xl p-2.5 text-center text-white flex items-center justify-center gap-3 shadow-md">
            <span className="text-amber-400 text-xs">✦ ✧</span>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-wide">
              Daily Basics
            </h2>
            <span className="text-amber-400 text-xs">✧ ✦</span>
          </div>

          {/* 1. MORNING BLOCK */}
          <div className="bg-white border-2 border-[#12284b] rounded-xl overflow-hidden shadow-xs">
            {/* Header */}
            <div className="bg-[#0b1b36] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#1d3c6d]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Sun size={12} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-serif font-bold tracking-wider uppercase">
                  Morning
                </span>
              </div>
              <span className="text-[10px] text-amber-300">★</span>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2">
              {data.dailyBasics.morning.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 group">
                  <button
                    type="button"
                    onClick={() => toggleBasicTask('morning', task.id)}
                    disabled={isMiniPreview}
                    className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.done
                        ? 'bg-[#0b1b36] border-[#0b1b36] text-white shadow-2xs'
                        : 'border-[#758ba8] bg-white hover:border-[#0b1b36]'
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateBasicTaskText('morning', task.id, e.target.value)}
                    disabled={isMiniPreview}
                    className={`flex-1 text-xs font-sans outline-none bg-transparent transition-all ${
                      task.done ? 'line-through text-neutral-400 font-normal' : 'text-[#1a2334] font-medium'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. HOME BLOCK */}
          <div className="bg-white border-2 border-[#12284b] rounded-xl overflow-hidden shadow-xs relative">
            {/* Header */}
            <div className="bg-[#0b1b36] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#1d3c6d]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-200 flex items-center justify-center">
                  <Home size={12} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-serif font-bold tracking-wider uppercase">
                  Home
                </span>
              </div>
              <span className="text-[10px] text-amber-300">☾</span>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2 relative z-10">
              {data.dailyBasics.home.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 group">
                  <button
                    type="button"
                    onClick={() => toggleBasicTask('home', task.id)}
                    disabled={isMiniPreview}
                    className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.done
                        ? 'bg-[#0b1b36] border-[#0b1b36] text-white shadow-2xs'
                        : 'border-[#758ba8] bg-white hover:border-[#0b1b36]'
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateBasicTaskText('home', task.id, e.target.value)}
                    disabled={isMiniPreview}
                    className={`flex-1 text-xs font-sans outline-none bg-transparent transition-all ${
                      task.done ? 'line-through text-neutral-400 font-normal' : 'text-[#1a2334] font-medium'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Mountain pine tree artwork illustration at bottom right of home card */}
            <div className="absolute bottom-0 right-0 w-24 h-16 pointer-events-none opacity-25">
              <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="20,15 30,45 10,45" fill="#132742" />
                <polygon points="50,5 65,50 35,50" fill="#132742" />
                <polygon points="80,20 95,55 65,55" fill="#132742" />
                <polygon points="0,55 100,55 100,70 0,70" fill="#132742" />
              </svg>
            </div>
          </div>

          {/* 3. MEALS BLOCK */}
          <div className="bg-white border-2 border-[#12284b] rounded-xl overflow-hidden shadow-xs relative">
            {/* Header */}
            <div className="bg-[#0b1b36] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#1d3c6d]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-200 flex items-center justify-center">
                  <Utensils size={12} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-serif font-bold tracking-wider uppercase">
                  Meals
                </span>
              </div>
              <span className="text-[10px] text-amber-300">✦</span>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2 relative z-10">
              {data.dailyBasics.meals.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 group">
                  <button
                    type="button"
                    onClick={() => toggleBasicTask('meals', task.id)}
                    disabled={isMiniPreview}
                    className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.done
                        ? 'bg-[#0b1b36] border-[#0b1b36] text-white shadow-2xs'
                        : 'border-[#758ba8] bg-white hover:border-[#0b1b36]'
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateBasicTaskText('meals', task.id, e.target.value)}
                    disabled={isMiniPreview}
                    className={`flex-1 text-xs font-sans outline-none bg-transparent transition-all ${
                      task.done ? 'line-through text-neutral-400 font-normal' : 'text-[#1a2334] font-medium'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Botanical branch doodle */}
            <div className="absolute bottom-1 right-2 pointer-events-none opacity-30">
              <BotanicalBranchDoodle className="w-10 h-16" />
            </div>
          </div>

          {/* 4. NIGHT BLOCK */}
          <div className="bg-white border-2 border-[#12284b] rounded-xl overflow-hidden shadow-xs">
            {/* Header */}
            <div className="bg-[#0b1b36] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#1d3c6d]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-400/20 text-indigo-200 flex items-center justify-center">
                  <Moon size={12} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-serif font-bold tracking-wider uppercase">
                  Night
                </span>
              </div>
              <span className="text-[10px] text-amber-300">★</span>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2">
              {data.dailyBasics.night.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 group">
                  <button
                    type="button"
                    onClick={() => toggleBasicTask('night', task.id)}
                    disabled={isMiniPreview}
                    className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.done
                        ? 'bg-[#0b1b36] border-[#0b1b36] text-white shadow-2xs'
                        : 'border-[#758ba8] bg-white hover:border-[#0b1b36]'
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateBasicTaskText('night', task.id, e.target.value)}
                    disabled={isMiniPreview}
                    className={`flex-1 text-xs font-sans outline-none bg-transparent transition-all ${
                      task.done ? 'line-through text-neutral-400 font-normal' : 'text-[#1a2334] font-medium'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: "Today's Tasks" (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Header Banner */}
          <div className="bg-[#0b1b36] border border-[#1d3c6d] rounded-xl p-2.5 text-center text-white flex items-center justify-center gap-3 shadow-md">
            <span className="text-amber-400 text-xs">✦ ✧</span>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-wide">
              Today's Tasks
            </h2>
            <span className="text-amber-400 text-xs">☾ ✦</span>
          </div>

          {/* Today's Tasks Lined Sheet Container */}
          <div className="bg-white border-2 border-[#12284b] rounded-xl p-4 sm:p-5 flex-1 shadow-xs flex flex-col justify-between relative overflow-hidden">
            {/* 19 Ruled Task Rows */}
            <div className="flex flex-col divide-y divide-dotted divide-[#cbd5e1] relative z-10">
              {data.todayTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-1.5 hover:bg-blue-50/30 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodayTask(task.id)}
                    disabled={isMiniPreview}
                    className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      task.done
                        ? 'bg-[#0b1b36] border-[#0b1b36] text-white shadow-2xs'
                        : 'border-[#758ba8] bg-white hover:border-[#0b1b36]'
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>

                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateTodayTaskText(task.id, e.target.value)}
                    disabled={isMiniPreview}
                    placeholder={idx < 5 ? `تسک شماره ${idx + 1}...` : ''}
                    className={`flex-1 text-xs font-sans outline-none bg-transparent transition-all ${
                      task.done
                        ? 'line-through text-neutral-400 font-normal'
                        : 'text-[#15233c] font-medium placeholder:text-[#94a3b8]'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Quick Add row button at bottom of list */}
            {!isMiniPreview && (
              <div className="relative z-10 pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddTodayTask}
                  className="text-xs font-sans font-bold text-[#1a3867] hover:text-[#0b1b36] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>افزودن سطر جدید</span>
                </button>

                <span className="text-[11px] font-sans text-neutral-400">
                  {data.todayTasks.filter((t) => t.done).length} / {data.todayTasks.filter((t) => t.text.trim()).length || data.todayTasks.length} انجام‌شده
                </span>
              </div>
            )}

            {/* Misty Mountain Pine Landscape Artwork at the bottom right */}
            <div className="absolute -bottom-1 -right-1 left-0 pointer-events-none opacity-40 select-none">
              {data.customArtworkUrl ? (
                <img
                  src={data.customArtworkUrl}
                  alt="Mountain Landscape"
                  className="w-full h-auto object-cover max-h-[140px]"
                />
              ) : (
                <MountainPineLandscape className="w-full h-auto max-h-[130px]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. CROP MODAL FOR CUSTOM ARTWORK
         ======================================================== */}
      {!isMiniPreview && (
        <ArtworkCropModal
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          targetTitle="منظره کوهستان و تم قالب ۴"
          currentImageUrl={data.customArtworkUrl}
          aspectRatio={2.1}
          onApplyCrop={(croppedUrl) => {
            updateData((prev) => ({ ...prev, customArtworkUrl: croppedUrl }));
          }}
          onRemoveCrop={() => {
            updateData((prev) => ({ ...prev, customArtworkUrl: undefined }));
          }}
        />
      )}
    </div>
  );
};
