import React from 'react';
import { Heart, Coffee, Music, Sparkles, Check, Bookmark, Plus, Trash2 } from 'lucide-react';
import { DayPage } from '../../types';
import { sound } from '../../utils/audio';
import { toPersianDigits } from '../../utils/jalali';

interface WriterSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
}

const CHECKIN_QUESTIONS = [
  { id: 'q1', text: 'Did I show up today? (آیا امروز حاضر شدم و نوشتم؟)' },
  { id: 'q2', text: 'Did I enjoy what I wrote? (آیا از آنچه نوشتم لذت بردم؟)' },
  { id: 'q3', text: 'Did I learn something new? (آیا نکته یا تکنیک جدیدی یاد گرفتم؟)' },
  { id: 'q4', text: 'Did I get out of my head? (آیا از وسواس فکری خارج شدم؟)' },
  { id: 'q5', text: 'Did I move the story forward? (آیا داستان یا متن را جلو بردم؟)' },
  { id: 'q6', text: 'Am I proud of myself? (آیا به تلاشم افتخار می‌کنم؟)' },
];

const RATINGS = [
  { val: 1, label: 'NOT REALLY' },
  { val: 2, label: 'A LITTLE' },
  { val: 3, label: 'KIND OF' },
  { val: 4, label: 'YES!' },
  { val: 5, label: 'HECK YES!' },
];

export const WriterSheet: React.FC<WriterSheetProps> = ({
  pageData,
  onUpdate,
}) => {
  const project = pageData.currentProject || {
    title: 'Hollow Pines (Book 1)',
    goalCount: 2000,
    currentCount: 1450,
  };
  const completedChapters = pageData.completedChapters || [1, 2, 3, 4];
  const scenesStuck = pageData.scenesStuck || [
    'رویارویی دو شخصیت در کلبه چوبی جنگلی',
    'کشف نامه قدیمی پنهان شده در کتابخانه',
  ];
  const characterThoughts = pageData.characterThoughts || '';
  const favoriteLines = pageData.favoriteLines || [
    '«برخی سکوت‌ها از هزاران کلمه پرصداتر فریاد می‌کشند.»',
  ];
  const playlist = pageData.playlist || [
    'Acoustic Cabin Morning • Novo Amor',
    'Rainy Window Ambience • Lofi Beats',
  ];
  const coffeeCups = pageData.coffeeCups ?? 3;
  const writingCheckin = pageData.writingCheckin || { q1: 5, q2: 4, q3: 3, q4: 4, q5: 4, q6: 5 };

  // Handlers
  const handleToggleChapter = (chNum: number) => {
    sound.playStar();
    onUpdate((prev) => {
      const cur = prev.completedChapters || [];
      const updated = cur.includes(chNum) ? cur.filter((c) => c !== chNum) : [...cur, chNum];
      return { ...prev, completedChapters: updated };
    });
  };

  const handleSetCoffee = (level: number) => {
    sound.playTick(true);
    onUpdate((prev) => ({ ...prev, coffeeCups: level }));
  };

  const handleSetCheckin = (qId: string, rating: number) => {
    sound.playTick(true);
    onUpdate((prev) => ({
      ...prev,
      writingCheckin: {
        ...(prev.writingCheckin || {}),
        [qId]: rating,
      },
    }));
  };

  const wordPercent = project.goalCount > 0 ? Math.min(100, Math.round((project.currentCount / project.goalCount) * 100)) : 0;

  return (
    <div className="w-full bg-[#f9f5ec] text-slate-800 rounded-[34px] p-6 md:p-10 shadow-2xl border-2 border-[#546a53]/30 flex flex-col gap-8 font-sans relative overflow-hidden">
      {/* Decorative Forest Background Watermark Accent */}
      <div className="absolute top-3 left-4 text-emerald-900/10 pointer-events-none select-none text-6xl">
        🌲 🌲 🌲
      </div>

      {/* TOP HEADER: Writing Plans & Pinned Sticky Project Note */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-dashed border-[#546a53]/25 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="text-2xl">🌲</span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              writing plans ♡
            </h1>
            <Sparkles size={20} className="text-amber-600 animate-pulse" />
          </div>
          <p className="text-sm font-medium italic text-emerald-900/70" style={{ fontFamily: 'Georgia, serif' }}>
            “write the story only you can tell.”
          </p>
        </div>

        {/* Pinned Sticky Project Note (Right Top) */}
        <div className="bg-[#fffdf9] border-2 border-[#d9ccba] rounded-2xl p-4 shadow-md w-full md:w-80 relative rotate-1 hover:rotate-0 transition-transform flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-dashed border-amber-200 pb-1.5">
            <span className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1.5">
              <Bookmark size={13} className="text-amber-700" />
              CURRENT PROJECT:
            </span>
            <Heart size={14} className="text-rose-500 fill-rose-500" />
          </div>

          <input
            type="text"
            value={project.title}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                currentProject: {
                  ...(prev.currentProject || project),
                  title: e.target.value,
                },
              }))
            }
            className="font-bold text-sm text-slate-900 bg-transparent border-b border-slate-300 outline-none pb-1"
            placeholder="عنوان پروژه..."
          />

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">هدف کلمات:</span>
              <input
                type="number"
                value={project.goalCount}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    currentProject: {
                      ...(prev.currentProject || project),
                      goalCount: Number(e.target.value),
                    },
                  }))
                }
                className="font-bold text-xs text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">کلمات فعلی:</span>
              <input
                type="number"
                value={project.currentCount}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    currentProject: {
                      ...(prev.currentProject || project),
                      currentCount: Number(e.target.value),
                    },
                  }))
                }
                className="font-bold text-xs text-emerald-700 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Word Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${wordPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-right font-mono font-bold text-emerald-800">
            %{toPersianDigits(wordPercent)} محقق شده
          </span>
        </div>
      </div>

      {/* CHAPTER TRACKER: 25 Clickable Chapter Bubbles */}
      <div className="bg-white border-2 border-[#546a53]/20 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
            <span className="text-sm">📖</span>
            <span>CHAPTER TRACKER (ردیاب فصل‌ها):</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">
            {toPersianDigits(completedChapters.length)} از ۲۵ فصل تکمیل شد
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-13 gap-2 justify-center">
          {[...Array(25)].map((_, idx) => {
            const chNum = idx + 1;
            const isCompleted = completedChapters.includes(chNum);

            return (
              <button
                type="button"
                key={chNum}
                onClick={() => handleToggleChapter(chNum)}
                className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-2 shadow-2xs ${
                  isCompleted
                    ? 'bg-[#546a53] text-white border-[#546a53] scale-105 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-[#546a53] hover:scale-105'
                }`}
                title={`فصل ${chNum}: کلیک برای ثبت تکمیل`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : toPersianDigits(chNum)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 MIDDLE CARDS: Scenes / Character / Lines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: SCENES STUCK IN MY HEAD */}
        <div className="bg-white border-2 border-[#d9ccba] rounded-2xl p-4 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-dashed border-amber-200 pb-1.5">
            <span className="text-xs font-black text-slate-800">SCENES STUCK IN MY HEAD ♡</span>
            <span className="text-sm">🌲</span>
          </div>
          <div className="flex flex-col gap-2">
            {scenesStuck.map((scene, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="text-amber-700 font-bold">•</span>
                <input
                  type="text"
                  value={scene}
                  onChange={(e) => {
                    const list = [...scenesStuck];
                    list[idx] = e.target.value;
                    onUpdate((prev) => ({ ...prev, scenesStuck: list }));
                  }}
                  className="flex-1 bg-transparent border-b border-slate-200 outline-none pb-0.5"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                sound.playAdd();
                onUpdate((prev) => ({
                  ...prev,
                  scenesStuck: [...(prev.scenesStuck || []), ''],
                }));
              }}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>افزودن صحنه</span>
            </button>
          </div>
        </div>

        {/* Card 2: CHARACTER THOUGHTS */}
        <div className="bg-white border-2 border-[#d9ccba] rounded-2xl p-4 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-dashed border-amber-200 pb-1.5">
            <span className="text-xs font-black text-slate-800">CHARACTER THOUGHTS 💭</span>
            <span className="text-sm">☁️</span>
          </div>
          <textarea
            value={characterThoughts}
            onChange={(e) => onUpdate((prev) => ({ ...prev, characterThoughts: e.target.value }))}
            placeholder="انگیزه‌ها، احساسات و مونولوگ‌های درونی شخصیت‌ها را اینجا بنویسید..."
            rows={5}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-700 leading-relaxed resize-none font-medium"
          />
        </div>

        {/* Card 3: LINES I ACTUALLY LIKE */}
        <div className="bg-[#fffef7] border-2 border-[#d9ccba] rounded-2xl p-4 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-dashed border-amber-200 pb-1.5">
            <span className="text-xs font-black text-slate-800">LINES I ACTUALLY LIKE ♡</span>
            <Heart size={14} className="text-rose-400" />
          </div>
          <div className="flex flex-col gap-2">
            {favoriteLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="text-rose-500 font-bold">♡</span>
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const list = [...favoriteLines];
                    list[idx] = e.target.value;
                    onUpdate((prev) => ({ ...prev, favoriteLines: list }));
                  }}
                  className="flex-1 bg-transparent border-b border-slate-200 outline-none pb-0.5 italic"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                sound.playAdd();
                onUpdate((prev) => ({
                  ...prev,
                  favoriteLines: [...(prev.favoriteLines || []), ''],
                }));
              }}
              className="text-[11px] font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1 mt-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>افزودن دیالوگ یا خط زیبا</span>
            </button>
          </div>
        </div>
      </div>

      {/* PLAYLIST + LATE NIGHT WRITING METER (Coffee Cups) + QUOTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Inspiration Playlist */}
        <div className="bg-white border-2 border-[#d9ccba] rounded-2xl p-4 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-dashed border-amber-200 pb-1.5">
            <span className="text-xs font-black text-slate-800">INSPIRATION PLAYLIST 🎧</span>
            <Music size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col gap-1.5">
            {playlist.map((track, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                <span className="text-indigo-500 font-bold">♪</span>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => {
                    const list = [...playlist];
                    list[idx] = e.target.value;
                    onUpdate((prev) => ({ ...prev, playlist: list }));
                  }}
                  className="flex-1 bg-transparent border-b border-slate-100 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Late Night Writing Meter: 5 Clickable Coffee Cups */}
        <div className="bg-white border-2 border-[#d9ccba] rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
          <div>
            <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
              LATE NIGHT WRITING METER ☕
            </h4>
            <span className="text-[10px] text-slate-500 italic">fueled by coffee, chaos & main character energy</span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((cupNum) => {
              const isFilled = cupNum <= coffeeCups;
              return (
                <button
                  type="button"
                  key={cupNum}
                  onClick={() => handleSetCoffee(cupNum)}
                  className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center border-2 transition-transform hover:scale-115 cursor-pointer shadow-2xs ${
                    isFilled
                      ? 'bg-amber-800 border-amber-950 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                  title={`${cupNum} فنجان قهوه`}
                >
                  <Coffee size={17} />
                  <span className="text-[8px] font-mono font-bold mt-0.5">{cupNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Note Quote */}
        <div className="bg-[#fff9e6] border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col justify-center text-center rotate-[-1deg] hover:rotate-0 transition-transform">
          <p className="text-xs font-bold text-amber-950 italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            “first drafts don't have to be perfect. they just have to exist.” ♡
          </p>
          <span className="text-[10px] text-amber-700/80 mt-2 font-mono">— قانون طلایی نویسندگی</span>
        </div>
      </div>

      {/* DAILY WRITING CHECK-IN (Likert scale matrix matching Image 2) */}
      <div className="bg-white border-2 border-[#546a53]/25 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
            <span>⭐</span>
            <span>DAILY WRITING CHECK-IN (ارزیابی روزانه نوشتن)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-bold">ثبت احساس و پیشرفت ذهنی</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="text-right py-2 px-3 font-bold text-slate-800">سوالات ارزیابی</th>
                {RATINGS.map((r) => (
                  <th key={r.val} className="text-center py-2 px-2 text-[10px] font-black uppercase text-slate-600">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {CHECKIN_QUESTIONS.map((q) => {
                const currentVal = writingCheckin[q.id] || 3;
                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 text-xs">{q.text}</td>
                    {RATINGS.map((r) => {
                      const isSelected = currentVal === r.val;
                      return (
                        <td key={r.val} className="text-center py-2 px-2">
                          <button
                            type="button"
                            onClick={() => handleSetCheckin(q.id, r.val)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer mx-auto flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#546a53] border-[#546a53] text-white shadow-xs'
                                : 'border-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
