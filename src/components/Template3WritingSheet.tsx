import React, { useState } from 'react';
import { DayPage, WritingPlansData } from '../types';
import { sound } from '../utils/audio';
import { Check, Crop, Image as ImageIcon } from 'lucide-react';
import {
  WriterGirlDeskIllustration,
  VintageTypewriterIllustration,
  PolaroidForestIllustration,
  HeadphonesDoodle,
  PineconeDoodle,
  PineTreesHeaderDoodle,
} from './WritingPlansArtwork';
import { ArtworkCropModal } from './ArtworkCropModal';

interface Template3WritingSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
  isMiniPreview?: boolean;
}

const CHECK_IN_QUESTIONS = [
  { id: 'q1', text: 'Did I show up today?' },
  { id: 'q2', text: 'Did I enjoy what I wrote?' },
  { id: 'q3', text: 'Did I learn something new?' },
  { id: 'q4', text: 'Did I get out of my head?' },
  { id: 'q5', text: 'Did I move the story forward?' },
  { id: 'q6', text: 'Am I proud of myself?' },
];

const CHECK_IN_OPTIONS = [
  { val: 1, label: 'NOT REALLY' },
  { val: 2, label: 'A LITTLE' },
  { val: 3, label: 'KIND OF' },
  { val: 4, label: 'YES!' },
  { val: 5, label: 'HECK YES' },
];

export const Template3WritingSheet: React.FC<Template3WritingSheetProps> = ({
  pageData,
  onUpdate,
  isMiniPreview = false,
}) => {
  const [activeCropTarget, setActiveCropTarget] = useState<'girl' | 'polaroid' | 'typewriter' | null>(null);

  // Safe default data
  const wp: WritingPlansData = pageData.writingPlans || {
    currentProject: 'Hollow Pines (book 1) ♡',
    completedChapters: [1, 2, 3],
    wordCountGoal: 2000,
    currentWordCount: 1450,
    scenesStuckInHead: ['', '', '', '', ''],
    characterThoughts: '',
    linesILike: ['', '', '', '', '', ''],
    inspirationPlaylist: ['', '', '', ''],
    coffeeCups: 3,
    dailyCheckIn: {},
  };

  const updateWP = (updater: (prevWP: WritingPlansData) => WritingPlansData) => {
    onUpdate((prev) => {
      const currentWP = prev.writingPlans || wp;
      return {
        ...prev,
        templateType: 'template-3-writing-plans',
        writingPlans: updater(currentWP),
      };
    });
  };

  // Chapter Toggle
  const toggleChapter = (chapterNum: number) => {
    const list = wp.completedChapters || [];
    const isCompleted = list.includes(chapterNum);
    sound.playTick(!isCompleted);
    const updated = isCompleted
      ? list.filter((n) => n !== chapterNum)
      : [...list, chapterNum];
    updateWP((prev) => ({ ...prev, completedChapters: updated }));
  };

  // Word Count Progress
  const goalNum = Number(wp.wordCountGoal) || 1;
  const currentNum = Number(wp.currentWordCount) || 0;
  const progressPercent = Math.min(100, Math.round((currentNum / goalNum) * 100));

  // Coffee Meter Toggle
  const setCoffee = (count: number) => {
    sound.playAdd();
    updateWP((prev) => ({
      ...prev,
      coffeeCups: prev.coffeeCups === count ? count - 1 : count,
    }));
  };

  // Check-In Rating Toggle
  const setRating = (questionId: string, rating: number) => {
    sound.playTick(true);
    updateWP((prev) => ({
      ...prev,
      dailyCheckIn: {
        ...(prev.dailyCheckIn || {}),
        [questionId]: rating,
      },
    }));
  };

  return (
    <div
      dir="ltr"
      className="w-full bg-[#faf7f2] text-[#2c241e] p-6 sm:p-10 font-serif shadow-2xl rounded-2xl border border-[#e5dcd3] relative select-text"
      style={{
        boxShadow: '0 20px 50px -15px rgba(60, 45, 30, 0.18), 0 0 0 1px rgba(110,85,60,0.08)',
        backgroundImage:
          'radial-gradient(#ebdcd0 0.75px, transparent 0.75px), radial-gradient(#ebdcd0 0.75px, #faf7f2 0.75px)',
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0, 15px 15px',
      }}
    >
      {/* ========================================================
          1. TOP HERO HEADER & CURRENT PROJECT NOTE
         ======================================================== */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        {/* Left Side: Pine tree doodle + Title + Subtitle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <PineTreesHeaderDoodle className="w-12 h-14 shrink-0 drop-shadow-xs" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-sm">★</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1c140e] font-serif">
                writing plans <span className="text-[#a44a3f]">♡</span>
              </h1>
              <span className="text-amber-800 text-xs">☆</span>
            </div>
            <p className="text-xs sm:text-sm text-[#735d4d] italic mt-0.5 font-sans">
              "write the story only you can tell."
            </p>
          </div>
        </div>

        {/* Right Side: CURRENT PROJECT Pinned Note */}
        <div className="relative bg-[#fcf9f2] border-2 border-[#d6c7b7] rounded-lg p-3 pt-3.5 pr-4 shadow-sm max-w-[240px] w-full rotate-1 hover:rotate-0 transition-transform shrink-0 self-end sm:self-center">
          {/* Paperclip top pin */}
          <div className="absolute -top-3.5 left-4 w-4 h-7 border-2 border-neutral-700 rounded-full bg-transparent shadow-xs pointer-events-none" />

          <div className="text-[10px] font-black uppercase tracking-wider text-[#634832] font-sans">
            CURRENT PROJECT:
          </div>
          <input
            type="text"
            value={wp.currentProject || ''}
            onChange={(e) => updateWP((prev) => ({ ...prev, currentProject: e.target.value }))}
            disabled={isMiniPreview}
            placeholder="Hollow Pines (book 1) ♡"
            className="w-full text-xs sm:text-sm font-bold text-[#1f1712] outline-none bg-transparent placeholder:text-[#a89584] mt-0.5 font-serif"
          />
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#937b68] font-sans">
            <span className="flex items-center gap-1">🌲 Book Draft</span>
            <span className="text-[#a44a3f]">♡</span>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO ROW: CHAPTER TRACKER | WRITER GIRL AT DESK | WORD COUNT & POLAROID
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 my-4 items-center">
        {/* CHAPTER TRACKER (Left, 4 cols) */}
        <div className="md:col-span-4 bg-[#fdfbf7] border-2 border-[#d5c5b5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#e4ece2] text-[#335c3c] text-xs font-bold px-2 py-0.5 rounded-full font-sans tracking-wide">
                CHAPTER TRACKER
              </span>
              <span className="text-amber-600 text-xs">★</span>
            </div>
            <span className="text-[11px] text-[#7d6755] font-sans font-bold">
              {wp.completedChapters?.length || 0}/25
            </span>
          </div>

          {/* 5x5 Number Circles (1 to 25) */}
          <div className="grid grid-cols-5 gap-2 py-1">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((ch) => {
              const done = (wp.completedChapters || []).includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChapter(ch)}
                  disabled={isMiniPreview}
                  className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full border-2 flex items-center justify-center font-bold text-xs font-sans transition-all cursor-pointer shadow-xs active:scale-90 ${
                    done
                      ? 'bg-[#3e5f44] border-[#29422e] text-[#f7fdf8] scale-105'
                      : 'bg-white border-[#d2c0b0] text-[#5c493c] hover:border-[#3e5f44] hover:bg-[#edf4ed]'
                  }`}
                  title={`فصل ${ch}`}
                >
                  {done ? <Check size={12} strokeWidth={3.5} /> : ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTERPIECE: WRITER GIRL AT HER DESK (Center, 4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 px-1 relative">
          <div className="relative flex flex-col items-center group w-full max-w-[340px]">
            {/* Ambient warm glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-100/50 via-orange-50/30 to-transparent rounded-full blur-xl -z-10 scale-105 pointer-events-none" />

            {/* If user cropped the girl from their original image, show it! Otherwise show high-detail illustration */}
            {wp.girlImageUrl ? (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#d5c5b5] bg-[#faf7f2] shadow-md group/crop">
                <img
                  src={wp.girlImageUrl}
                  alt="تصویر برش‌خورده دختر"
                  className="w-full h-auto object-contain max-h-[300px] transition-transform duration-300 group-hover/crop:scale-[1.02]"
                />
                {!isMiniPreview && (
                  <button
                    type="button"
                    onClick={() => setActiveCropTarget('girl')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-sans font-bold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover/crop:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    title="برش مجدد یا تغییر تصویر دختر"
                  >
                    <Crop size={12} />
                    <span>برش مجدد</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => !isMiniPreview && setActiveCropTarget('girl')}
                className="cursor-pointer transition-transform hover:scale-[1.02] duration-300 relative group/vect w-full flex flex-col items-center"
                title="کلیک برای برش و قرار دادن تصویر دختر از عکس اصلی قالب"
              >
                <WriterGirlDeskIllustration className="w-full max-w-[320px] h-auto drop-shadow-md" />
                {!isMiniPreview && (
                  <div className="absolute top-2 right-4 bg-white/90 hover:bg-white text-[#3e5f44] border border-[#d5c5b5] text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 opacity-0 group-hover/vect:opacity-100 transition-opacity">
                    <Crop size={11} />
                    <span>برش از عکس اصلی</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Badge / Trigger button */}
            {!isMiniPreview ? (
              <button
                type="button"
                onClick={() => setActiveCropTarget('girl')}
                className="mt-1 flex items-center gap-1.5 bg-[#fbf9f4] hover:bg-white border border-[#d6c7b7] px-3 py-1 rounded-full shadow-2xs text-[11px] font-sans font-bold text-[#4a3627] hover:text-[#3e5f44] cursor-pointer transition-colors"
                title="برش تصویر دختر مستقیماً از عکس اصلی قالب"
              >
                <Crop size={12} className="text-[#3e5f44]" />
                <span>
                  {wp.girlImageUrl
                    ? '✂️ تغییر تصویر برش‌خورده دختر'
                    : '✂️ برش تصویر دختر از عکس اصلی'}
                </span>
              </button>
            ) : (
              <div className="mt-1 flex items-center gap-1.5 bg-[#fbf9f4] border border-[#d6c7b7] px-3 py-0.5 rounded-full shadow-2xs">
                <span className="text-amber-800 text-[10px]">★</span>
                <span className="text-[11px] font-serif italic text-[#4a3627]">
                  ✍️ "one more chapter ♡"
                </span>
                <span className="text-amber-800 text-[10px]">★</span>
              </div>
            )}
          </div>
        </div>

        {/* WORD COUNT GOAL & POLAROID PHOTO (Right, 4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <div className="bg-[#fcfaf4] border-2 border-[#d5c5b5] rounded-2xl p-4 shadow-xs relative">
            {/* Tapes on corners */}
            <div className="absolute -top-2 left-6 w-10 h-4 bg-[#ede2c8]/90 border-t border-b border-[#d8c5a2] rotate-3 shadow-2xs pointer-events-none" />

            <div className="flex flex-col gap-2 font-sans">
              <div>
                <label className="text-[10px] font-black uppercase text-[#634832] tracking-wider block">
                  WORD COUNT GOAL
                </label>
                <input
                  type="number"
                  value={wp.wordCountGoal}
                  onChange={(e) =>
                    updateWP((prev) => ({ ...prev, wordCountGoal: e.target.value }))
                  }
                  disabled={isMiniPreview}
                  placeholder="2000"
                  className="w-full text-base font-bold text-[#1f1712] border-b border-dashed border-[#bfae9e] py-0.5 outline-none bg-transparent"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#634832] tracking-wider block">
                  CURRENT COUNT
                </label>
                <input
                  type="number"
                  value={wp.currentWordCount}
                  onChange={(e) =>
                    updateWP((prev) => ({ ...prev, currentWordCount: e.target.value }))
                  }
                  disabled={isMiniPreview}
                  placeholder="1450"
                  className="w-full text-base font-bold text-[#1f1712] border-b border-dashed border-[#bfae9e] py-0.5 outline-none bg-transparent"
                />
              </div>

              {/* Progress bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[11px] text-[#735d4d] font-bold mb-1">
                  <span>Progress</span>
                  <span className="text-[#a44a3f]">{progressPercent}% ♡</span>
                </div>
                <div className="w-full h-2.5 bg-[#ebdcd0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#416248] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Polaroid Pine Forest Photo */}
          <div className="self-end mr-4 relative group/pol">
            {wp.polaroidImageUrl ? (
              <div
                onClick={() => !isMiniPreview && setActiveCropTarget('polaroid')}
                className="bg-[#faf8f2] border-2 border-[#d5c7b8] rounded-md p-1.5 shadow-sm rotate-2 hover:rotate-0 transition-transform duration-300 max-w-[125px] cursor-pointer"
              >
                <img
                  src={wp.polaroidImageUrl}
                  alt="Polaroid"
                  className="w-full aspect-square object-cover rounded-xs"
                />
                <div className="text-right text-[9px] text-[#a44a3f] font-sans mt-0.5">♥</div>
              </div>
            ) : (
              <div
                onClick={() => !isMiniPreview && setActiveCropTarget('polaroid')}
                className="cursor-pointer"
                title="کلیک برای برش عکس پولاروید از عکس اصلی"
              >
                <PolaroidForestIllustration className="w-24 sm:w-28 h-auto drop-shadow-sm hover:rotate-0 transition-transform duration-300" />
              </div>
            )}

            {!isMiniPreview && (
              <button
                type="button"
                onClick={() => setActiveCropTarget('polaroid')}
                className="absolute -bottom-2 -left-2 bg-white/95 text-[9px] font-sans font-bold text-[#4a3627] border border-[#d5c5b5] px-1.5 py-0.5 rounded-full shadow-2xs opacity-0 group-hover/pol:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5"
              >
                <Crop size={10} />
                <span>برش</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MIDDLE 3-PANEL ROW: SCENES, CHARACTER THOUGHTS, LINES I LIKE
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-start">
        {/* 1. SCENES STUCK IN MY HEAD (Left) */}
        <div className="bg-[#fcf9f2] border-2 border-[#d5c5b5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[250px] relative">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2 mb-3">
              <span className="text-xs font-black uppercase text-[#423124] tracking-wide font-sans">
                SCENES STUCK IN MY HEAD
              </span>
              <span className="text-[#a44a3f] text-xs">♡</span>
            </div>

            {/* 5 Bullet points on dotted lines */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 border-b border-dotted border-[#bfae9e] pb-1">
                  <span className="text-neutral-400 select-none text-xs">•</span>
                  <input
                    type="text"
                    value={wp.scenesStuckInHead?.[idx] || ''}
                    onChange={(e) => {
                      const updated = [...(wp.scenesStuckInHead || ['', '', '', '', ''])];
                      updated[idx] = e.target.value;
                      updateWP((prev) => ({ ...prev, scenesStuckInHead: updated }));
                    }}
                    disabled={isMiniPreview}
                    className="w-full text-xs text-[#2c241e] font-serif outline-none bg-transparent placeholder:text-[#c4b5a5]"
                    placeholder="Scene idea..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="self-end mt-1">
            <PineconeDoodle className="w-6 h-7 opacity-85" />
          </div>
        </div>

        {/* 2. CHARACTER THOUGHTS (Center) */}
        <div className="bg-[#fcf9f2] border-2 border-[#d5c5b5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2 mb-3">
            <span className="text-xs font-black uppercase text-[#423124] tracking-wide font-sans">
              CHARACTER THOUGHTS
            </span>
            <span className="text-neutral-500 text-sm">💭</span>
          </div>

          <textarea
            value={wp.characterThoughts || ''}
            onChange={(e) => updateWP((prev) => ({ ...prev, characterThoughts: e.target.value }))}
            disabled={isMiniPreview}
            rows={7}
            placeholder="Motivations, inner voice, secrets, dialogue fragments..."
            className="w-full flex-1 text-xs sm:text-sm font-serif text-[#2c241e] outline-none resize-none bg-transparent placeholder:text-[#c4b5a5] leading-[26px]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent, transparent 25px, #c4b5a5 25px, #c4b5a5 26px)',
              backgroundAttachment: 'local',
              lineHeight: '26px',
            }}
          />
        </div>

        {/* 3. LINES I ACTUALLY LIKE (Right, Spiral Notebook style) */}
        <div className="bg-[#faf7f0] border-2 border-[#d5c5b5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[250px] relative">
          {/* Spiral binding rings at top */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex gap-2 select-none pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="w-2.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-200" />
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2 mb-3 mt-1">
            <span className="text-xs font-black uppercase text-[#423124] tracking-wide font-sans">
              LINES I ACTUALLY LIKE
            </span>
            <span className="text-[#a44a3f] text-xs">♡</span>
          </div>

          {/* 6 Heart bullet points on dotted lines */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 border-b border-dotted border-[#bfae9e] pb-1">
                <span className="text-[#a44a3f] select-none text-[10px]">♡</span>
                <input
                  type="text"
                  value={wp.linesILike?.[idx] || ''}
                  onChange={(e) => {
                    const updated = [...(wp.linesILike || ['', '', '', '', '', ''])];
                    updated[idx] = e.target.value;
                    updateWP((prev) => ({ ...prev, linesILike: updated }));
                  }}
                  disabled={isMiniPreview}
                  className="w-full text-xs text-[#2c241e] font-serif italic outline-none bg-transparent placeholder:text-[#c4b5a5]"
                  placeholder="Golden sentence..."
                />
              </div>
            ))}
          </div>
          <div className="self-end text-sm select-none text-emerald-800/60 mt-1">🌿</div>
        </div>
      </div>

      {/* ========================================================
          4. INSPIRATION PLAYLIST + KRAFT QUOTE + COFFEE METER
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* INSPIRATION PLAYLIST (Left, 4 cols) */}
        <div className="md:col-span-4 bg-[#fcf9f2] border-2 border-[#d5c5b5] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[#423124] tracking-wide font-sans">
                INSPIRATION PLAYLIST
              </span>
              <span className="text-[#a44a3f] text-xs">♡</span>
            </div>
            <HeadphonesDoodle className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 border-b border-dotted border-[#bfae9e] pb-0.5">
                <span className="text-[#a44a3f] select-none text-[10px]">♡</span>
                <input
                  type="text"
                  value={wp.inspirationPlaylist?.[idx] || ''}
                  onChange={(e) => {
                    const updated = [...(wp.inspirationPlaylist || ['', '', '', ''])];
                    updated[idx] = e.target.value;
                    updateWP((prev) => ({ ...prev, inspirationPlaylist: updated }));
                  }}
                  disabled={isMiniPreview}
                  className="w-full text-xs text-[#2c241e] font-sans outline-none bg-transparent placeholder:text-[#c4b5a5]"
                  placeholder="Song & Artist..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* CENTER KRAFT STICKY QUOTE (Center, 4 cols) */}
        <div className="md:col-span-4 relative bg-[#ede4d3] border-2 border-[#cfbeaa] rounded-xl p-4 text-center shadow-xs rotate-[-1deg] hover:rotate-0 transition-transform">
          {/* Top Tape */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-[#ded1bc]/90 border-t border-b border-[#c4b59f] shadow-2xs pointer-events-none" />

          <p className="text-xs sm:text-sm font-serif italic text-[#3a2c20] leading-relaxed pt-1">
            "first drafts don't have to be perfect. they just have to exist."
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#a44a3f]">
            <span>♡</span>
            <span className="text-neutral-600">🌿</span>
          </div>
        </div>

        {/* LATE NIGHT WRITING METER (Right, 4 cols) */}
        <div className="md:col-span-4 bg-[#fcf9f2] border-2 border-[#d5c5b5] rounded-2xl p-4 shadow-xs text-center">
          <div className="text-xs font-black uppercase text-[#423124] tracking-wide font-sans mb-0.5">
            LATE NIGHT WRITING METER
          </div>
          <p className="text-[10px] text-[#735d4d] italic font-sans mb-3">
            fueled by coffee, chaos & main character energy
          </p>

          {/* 5 Coffee Cups with sleeve & lid */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((cupNum) => {
              const isFilled = (wp.coffeeCups || 0) >= cupNum;
              return (
                <button
                  key={cupNum}
                  type="button"
                  onClick={() => setCoffee(cupNum)}
                  disabled={isMiniPreview}
                  className={`w-9 h-12 border-2 rounded-b-md rounded-t-xs flex flex-col items-center justify-between p-1 transition-all cursor-pointer shadow-xs active:scale-90 ${
                    isFilled
                      ? 'bg-[#5c3d28] border-[#382315] text-amber-100 scale-105'
                      : 'bg-white border-[#d2c0b0] text-[#a89584] hover:border-[#5c3d28]'
                  }`}
                  title={`${cupNum} cups of coffee`}
                >
                  <span className="text-[10px]">☕</span>
                  <span className="text-[8px] font-sans font-black">
                    {isFilled ? '♡' : cupNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. BOTTOM CHECK-IN TABLE & VINTAGE TYPEWRITER ART
         ======================================================== */}
      <div className="mt-8 pt-6 border-t border-[#e3d5c6] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* CHECK-IN TABLE (8 cols) */}
        <div className="lg:col-span-8 bg-[#fdfbf7] border-2 border-[#d5c5b5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#e4ece2] text-[#335c3c] text-xs font-bold px-2.5 py-0.5 rounded-full font-sans tracking-wide">
                DAILY WRITING CHECK-IN
              </span>
              <span className="text-amber-600 text-xs">★</span>
            </div>
            <span className="text-[11px] text-[#7d6755] font-sans">Honest reflection</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-[#ebdcd0] text-[9px] sm:text-[10px] text-[#634832] font-black uppercase">
                  <th className="py-2 pr-2 font-serif font-bold text-xs text-[#2c241e]">Reflection</th>
                  {CHECK_IN_OPTIONS.map((opt) => (
                    <th key={opt.val} className="py-2 text-center px-1">
                      {opt.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6dd]">
                {CHECK_IN_QUESTIONS.map((q) => {
                  const currentRating = wp.dailyCheckIn?.[q.id] || 0;
                  return (
                    <tr key={q.id} className="hover:bg-[#faf4ec] transition-colors">
                      <td className="py-2.5 pr-2 font-serif text-xs sm:text-sm text-[#2b221b]">
                        <span className="text-[#a44a3f] mr-1">♡</span>
                        <span>{q.text}</span>
                      </td>
                      {CHECK_IN_OPTIONS.map((opt) => (
                        <td key={opt.val} className="py-2.5 text-center px-1">
                          <button
                            type="button"
                            onClick={() => setRating(q.id, opt.val)}
                            disabled={isMiniPreview}
                            className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center transition-all cursor-pointer ${
                              currentRating === opt.val
                                ? 'bg-[#3e5f44] border-[#29422e] text-white scale-110 shadow-2xs'
                                : 'bg-white border-[#d2c0b0] hover:border-[#3e5f44]'
                            }`}
                          >
                            {currentRating === opt.val && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* VINTAGE TYPEWRITER ART CARD (4 cols) */}
        <div className="lg:col-span-4 bg-[#fbf9f4] border-2 border-[#d5c5b5] rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center text-center relative group/type">
          {wp.typewriterImageUrl ? (
            <div
              onClick={() => !isMiniPreview && setActiveCropTarget('typewriter')}
              className="cursor-pointer"
            >
              <img
                src={wp.typewriterImageUrl}
                alt="ماشین تحریر"
                className="w-full max-w-[210px] h-auto object-contain rounded-xl drop-shadow-sm transition-transform hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div
              onClick={() => !isMiniPreview && setActiveCropTarget('typewriter')}
              className="cursor-pointer"
            >
              <VintageTypewriterIllustration className="w-full max-w-[210px] h-auto drop-shadow-sm transition-transform hover:scale-[1.03] duration-300" />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-amber-700/90 mt-2 font-serif">
            <span>★</span>
            <span className="italic text-[#4a3627]">one word at a time ♡</span>
            <span>★</span>
          </div>

          {!isMiniPreview && (
            <button
              type="button"
              onClick={() => setActiveCropTarget('typewriter')}
              className="mt-1 text-[10px] font-sans font-bold text-[#4a3627] hover:text-[#3e5f44] bg-white border border-[#d5c5b5] px-2.5 py-0.5 rounded-full shadow-2xs opacity-0 group-hover/type:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
            >
              <Crop size={10} />
              <span>{wp.typewriterImageUrl ? 'تغییر تصویر' : 'برش از عکس اصلی'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          6. VERY BOTTOM TAPE RIBBON
         ======================================================== */}
      <footer className="mt-8 pt-4 border-t border-[#e3d5c6] flex items-center justify-center">
        <div className="relative bg-[#fcfbf7] border-2 border-[#d6c7b7] px-6 py-2 rounded-lg text-center shadow-xs flex items-center gap-3">
          <span className="text-amber-500 select-none text-base">🌼</span>
          <span className="text-xs sm:text-sm font-serif italic text-[#3d2f23]">
            progress isn't always loud. keep going, you're doing great. ♡
          </span>
          <span className="text-amber-500 select-none text-base">🌼</span>
        </div>
      </footer>

      {/* Interactive Crop & Placement Modal */}
      {!isMiniPreview && (
        <ArtworkCropModal
          isOpen={activeCropTarget !== null}
          onClose={() => setActiveCropTarget(null)}
          targetTitle={
            activeCropTarget === 'girl'
              ? 'تصویر دختر در مرکز قالب'
              : activeCropTarget === 'polaroid'
              ? 'عکس پولاروید جنگل'
              : 'ماشین تحریر قدیمی'
          }
          currentImageUrl={
            activeCropTarget === 'girl'
              ? wp.girlImageUrl
              : activeCropTarget === 'polaroid'
              ? wp.polaroidImageUrl
              : wp.typewriterImageUrl
          }
          aspectRatio={
            activeCropTarget === 'girl'
              ? 1.15
              : activeCropTarget === 'polaroid'
              ? 0.85
              : 1.15
          }
          onApplyCrop={(croppedUrl) => {
            if (activeCropTarget === 'girl') {
              updateWP((prev) => ({ ...prev, girlImageUrl: croppedUrl }));
            } else if (activeCropTarget === 'polaroid') {
              updateWP((prev) => ({ ...prev, polaroidImageUrl: croppedUrl }));
            } else if (activeCropTarget === 'typewriter') {
              updateWP((prev) => ({ ...prev, typewriterImageUrl: croppedUrl }));
            }
          }}
          onRemoveCrop={() => {
            if (activeCropTarget === 'girl') {
              updateWP((prev) => ({ ...prev, girlImageUrl: undefined }));
            } else if (activeCropTarget === 'polaroid') {
              updateWP((prev) => ({ ...prev, polaroidImageUrl: undefined }));
            } else if (activeCropTarget === 'typewriter') {
              updateWP((prev) => ({ ...prev, typewriterImageUrl: undefined }));
            }
          }}
        />
      )}
    </div>
  );
};
