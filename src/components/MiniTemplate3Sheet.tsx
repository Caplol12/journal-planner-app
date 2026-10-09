import React from 'react';
import { DayPage } from '../types';
import { Trash2, Check } from 'lucide-react';
import {
  WriterGirlDeskIllustration,
  VintageTypewriterIllustration,
  PolaroidForestIllustration,
  PineTreesHeaderDoodle,
  HeadphonesDoodle,
} from './WritingPlansArtwork';

interface MiniTemplate3SheetProps {
  page: DayPage;
  dateKey?: string;
  onOpen: () => void;
  onDelete?: () => void;
  hideDelete?: boolean;
}

export const MiniTemplate3Sheet: React.FC<MiniTemplate3SheetProps> = ({
  page,
  dateKey,
  onOpen,
  onDelete,
  hideDelete = false,
}) => {
  const wp = page.writingPlans || {
    currentProject: 'Hollow Pines (book 1) ♡',
    completedChapters: [1, 2, 3],
    wordCountGoal: 2000,
    currentWordCount: 1450,
    scenesStuckInHead: [],
    characterThoughts: '',
    linesILike: [],
    inspirationPlaylist: [],
    coffeeCups: 3,
    dailyCheckIn: {},
  };

  const completedCount = wp.completedChapters?.length || 0;
  const goalNum = Number(wp.wordCountGoal) || 1;
  const currentNum = Number(wp.currentWordCount) || 0;
  const progressPercent = Math.min(100, Math.round((currentNum / goalNum) * 100));

  return (
    <div
      onClick={onOpen}
      dir="ltr"
      className="w-full bg-[#faf7f2] border-2 border-[#d5c5b5] hover:border-[#3e5f44] rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden select-none font-serif text-[#2c241e]"
      style={{
        minHeight: '440px',
        backgroundImage:
          'radial-gradient(#ebdcd0 0.6px, transparent 0.6px), radial-gradient(#ebdcd0 0.6px, #faf7f2 0.6px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      }}
    >
      {/* Delete button on hover */}
      {!hideDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-white/95 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 hover:text-rose-700 dark:text-stone-400 dark:hover:text-rose-300 border border-stone-200 dark:border-stone-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
          title="حذف این برگه"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* ========================================================
          1. TOP HEADER: Pine Trees, Title, Pinned Project
         ======================================================== */}
      <div className="w-full mb-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <PineTreesHeaderDoodle className="w-7 h-8 shrink-0 drop-shadow-2xs" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-amber-800">★</span>
                <span className="text-xs sm:text-sm font-black text-[#1c140e] font-serif leading-none">
                  writing plans <span className="text-[#a44a3f]">♡</span>
                </span>
              </div>
              <span className="text-[8px] text-[#735d4d] italic font-sans block leading-tight">
                "write the story only you can tell."
              </span>
            </div>
          </div>

          {/* Current Project Pinned Note */}
          <div className="bg-[#fcf9f2] border border-[#d6c7b7] rounded px-1.5 py-0.5 shadow-2xs max-w-[125px] shrink-0 text-right rotate-1">
            <div className="text-[7px] font-black text-[#634832] font-sans uppercase">
              PROJECT:
            </div>
            <div className="text-[8.5px] font-bold text-[#1f1712] truncate font-serif">
              {wp.currentProject || 'Hollow Pines ♡'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. HERO ROW: CHAPTER TRACKER | WRITER GIRL CENTERPIECE | WORD COUNT & POLAROID
         ======================================================== */}
      <div className="grid grid-cols-12 gap-1.5 items-center my-1 bg-[#fffdf9]/70 border border-[#e5dcd3] rounded-xl p-1.5">
        {/* Left: Chapter Tracker (4 cols) */}
        <div className="col-span-4 bg-[#fdfbf7] border border-[#d5c5b5] rounded-lg p-1 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-0.5 mb-1">
            <span className="text-[7.5px] font-black text-[#335c3c] font-sans">
              CHAPTERS
            </span>
            <span className="text-[7.5px] font-bold text-[#7d6755] font-sans">
              {completedCount}/25
            </span>
          </div>
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((ch) => {
              const done = (wp.completedChapters || []).includes(ch);
              return (
                <div
                  key={ch}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center text-[6px] font-sans mx-auto transition-transform ${
                    done
                      ? 'bg-[#3e5f44] text-white font-bold'
                      : 'border border-[#d2c0b0] bg-white text-[#735d4d]'
                  }`}
                >
                  {done ? '✓' : ch}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: THE WRITER GIRL AT HER DESK (4 cols) — HERO ILLUSTRATION */}
        <div className="col-span-4 flex flex-col items-center justify-center px-0.5 relative group-hover:scale-105 transition-transform duration-300">
          <div className="relative w-full flex items-center justify-center">
            {wp.girlImageUrl ? (
              <img
                src={wp.girlImageUrl}
                alt="دختر نویسنده"
                className="w-full max-w-[130px] h-auto object-contain rounded-lg drop-shadow-xs"
              />
            ) : (
              <WriterGirlDeskIllustration className="w-full max-w-[130px] h-auto drop-shadow-xs" />
            )}
          </div>
          <span className="text-[7px] font-serif italic text-[#785b46] mt-0.5 leading-none">
            ✍️ one more chapter ♡
          </span>
        </div>

        {/* Right: Word Count & Polaroid (4 cols) */}
        <div className="col-span-4 flex flex-col gap-1 justify-between h-full">
          {/* Word Count Progress */}
          <div className="bg-[#fcfaf4] border border-[#d5c5b5] rounded-lg p-1 font-sans">
            <div className="flex items-center justify-between text-[7px] font-bold text-[#634832]">
              <span>WORDS</span>
              <span className="text-[#a44a3f]">{progressPercent}%</span>
            </div>
            <div className="text-[8.5px] font-black text-[#1f1712] mt-0.5">
              {wp.currentWordCount} <span className="text-[7px] text-neutral-400">/ {wp.wordCountGoal}</span>
            </div>
            <div className="w-full h-1 bg-[#ebdcd0] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#416248] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Mini Polaroid Photo */}
          <div className="flex justify-center">
            {wp.polaroidImageUrl ? (
              <div className="bg-[#faf8f2] border border-[#d5c7b8] rounded p-0.5 shadow-2xs rotate-2 max-w-[50px]">
                <img src={wp.polaroidImageUrl} alt="Polaroid" className="w-full aspect-square object-cover" />
                <div className="text-right text-[6px] text-[#a44a3f] font-sans">♥</div>
              </div>
            ) : (
              <PolaroidForestIllustration className="w-12 h-auto drop-shadow-2xs" />
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MIDDLE 3-PANELS ROW: SCENES | THOUGHTS | LINES I LIKE
         ======================================================== */}
      <div className="grid grid-cols-3 gap-1 my-1">
        {/* Scenes */}
        <div className="bg-[#fcf9f2] border border-[#d5c5b5] rounded-lg p-1 flex flex-col justify-between">
          <span className="text-[7px] font-black uppercase text-[#423124] font-sans border-b border-[#ebdcd0] pb-0.5 mb-0.5 truncate">
            SCENES STUCK IN HEAD
          </span>
          <div className="flex flex-col gap-0.5 text-[7px] text-[#634832] font-serif">
            <span className="truncate">• The hidden key</span>
            <span className="truncate">• Rainstorm argument</span>
            <span className="truncate">• Whispering fog</span>
          </div>
        </div>

        {/* Thoughts */}
        <div className="bg-[#fcf9f2] border border-[#d5c5b5] rounded-lg p-1 flex flex-col justify-between">
          <span className="text-[7px] font-black uppercase text-[#423124] font-sans border-b border-[#ebdcd0] pb-0.5 mb-0.5 truncate">
            CHARACTER THOUGHTS 💭
          </span>
          <p className="text-[7px] text-[#634832] font-serif line-clamp-2 italic leading-tight">
            "She wants to protect her brother, but the secret is breaking trust..."
          </p>
        </div>

        {/* Lines I Like */}
        <div className="bg-[#faf7f0] border border-[#d5c5b5] rounded-lg p-1 flex flex-col justify-between relative">
          <span className="text-[7px] font-black uppercase text-[#423124] font-sans border-b border-[#ebdcd0] pb-0.5 mb-0.5 truncate">
            LINES I LIKE ♡
          </span>
          <div className="flex flex-col gap-0.5 text-[7px] text-[#634832] font-serif italic">
            <span className="truncate">♡ The forest held its breath</span>
            <span className="truncate">♡ Hands of pine needles</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. LOWER ROW: PLAYLIST | QUOTE | COFFEE METER
         ======================================================== */}
      <div className="grid grid-cols-3 gap-1 my-1 items-center">
        {/* Playlist */}
        <div className="bg-[#fcf9f2] border border-[#d5c5b5] rounded-lg p-1 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[7px] font-bold text-[#423124] font-sans block truncate">
              PLAYLIST ♫
            </span>
            <span className="text-[6.5px] text-[#735d4d] font-sans block truncate">
              Rivers & Roads
            </span>
          </div>
          <HeadphonesDoodle className="w-4 h-4 shrink-0 opacity-80" />
        </div>

        {/* Kraft quote */}
        <div className="bg-[#ede4d3] border border-[#cfbeaa] rounded p-1 text-center shadow-2xs">
          <p className="text-[6.5px] font-serif italic text-[#3a2c20] leading-tight">
            "first drafts don't have to be perfect. they just have to exist."
          </p>
        </div>

        {/* Coffee Meter */}
        <div className="bg-[#fcfaf4] border border-[#d5c5b5] rounded-lg p-1 text-center font-sans">
          <span className="text-[7px] font-bold text-[#5c493c] block">COFFEE METER</span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((c) => (
              <span
                key={c}
                className={`text-[8px] ${
                  (wp.coffeeCups || 0) >= c ? 'opacity-100 scale-110' : 'opacity-25'
                }`}
              >
                ☕
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. BOTTOM ROW: CHECK-IN & VINTAGE TYPEWRITER ART
         ======================================================== */}
      <div className="grid grid-cols-12 gap-1.5 items-center mt-1 pt-1.5 border-t border-[#e3d5c6]">
        {/* Check-in reflection snippet (7 cols) */}
        <div className="col-span-7 bg-[#fdfbf7] border border-[#d5c5b5] rounded-lg p-1">
          <div className="flex items-center justify-between text-[7px] font-bold text-[#335c3c] font-sans mb-0.5">
            <span>DAILY CHECK-IN</span>
            <span className="text-amber-700">★ ★ ★ ★ ★</span>
          </div>
          <div className="flex flex-col gap-0.5 text-[6.5px] text-[#554133] font-serif">
            <span className="truncate">♡ Did I show up today? • YES!</span>
            <span className="truncate">♡ Am I proud of myself? • HECK YES</span>
          </div>
        </div>

        {/* Vintage Typewriter (5 cols) */}
        <div className="col-span-5 flex flex-col items-center justify-center bg-[#fbf9f4] border border-[#d5c5b5] rounded-lg p-0.5">
          {wp.typewriterImageUrl ? (
            <img
              src={wp.typewriterImageUrl}
              alt="ماشین تحریر"
              className="w-16 h-auto object-contain rounded drop-shadow-2xs"
            />
          ) : (
            <VintageTypewriterIllustration className="w-16 h-auto drop-shadow-2xs" />
          )}
          <span className="text-[6.5px] font-serif italic text-[#4a3627] mt-0.5">
            one word at a time ♡
          </span>
        </div>
      </div>

      {/* ========================================================
          6. FOOTER STRIP
         ======================================================== */}
      <div className="mt-2 pt-1.5 border-t border-[#e3d5c6] flex items-center justify-between text-[10px] text-[#735d4d] font-sans font-medium">
        <span className="font-bold text-[#2c241e]">قالب شماره ۳ (Writing Plans)</span>
        <span className="bg-[#e4ece2] text-[#335c3c] px-2 py-0.5 rounded-full font-bold text-[9px] shadow-2xs">
          {completedCount} فصل تکمیل‌شده
        </span>
      </div>
    </div>
  );
};
