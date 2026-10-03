import React from 'react';
import { Sparkles, Moon, Sun, Feather, Star, Check } from 'lucide-react';
import { DayPage } from '../../types';
import { sound } from '../../utils/audio';

interface CelestialSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
}

const CELESTIAL_HOURS = [
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '6 PM', '7 PM', '8 PM',
  '9 PM', '10 PM', '11 PM',
];

export const CelestialSheet: React.FC<CelestialSheetProps> = ({
  pageData,
  onUpdate,
}) => {
  const schedule = pageData.celestialSchedule || {};
  const priorities = pageData.celestialPriorities || ['', '', '', '', ''];
  const todos = pageData.celestialTodos || [
    { id: 'ct1', text: '', done: false },
    { id: 'ct2', text: '', done: false },
    { id: 'ct3', text: '', done: false },
    { id: 'ct4', text: '', done: false },
    { id: 'ct5', text: '', done: false },
  ];
  const gratitude = pageData.gratitudeEntries || ['', '', ''];
  const ravenNotes = pageData.ravenNotes || '';
  const selfCare = pageData.selfCare || { hydrate: 3, move: 2, rest: 4, mind: 4 };

  const handleUpdateSchedule = (hourStr: string, text: string) => {
    onUpdate((prev) => ({
      ...prev,
      celestialSchedule: {
        ...(prev.celestialSchedule || {}),
        [hourStr]: { ...(prev.celestialSchedule?.[hourStr] || {}), text },
      },
    }));
  };

  const handleToggleScheduleDone = (hourStr: string) => {
    sound.playStar();
    onUpdate((prev) => {
      const cur = prev.celestialSchedule?.[hourStr] || { text: '', done: false };
      return {
        ...prev,
        celestialSchedule: {
          ...(prev.celestialSchedule || {}),
          [hourStr]: { ...cur, done: !cur.done },
        },
      };
    });
  };

  const handleUpdatePriority = (idx: number, val: string) => {
    onUpdate((prev) => {
      const list = [...(prev.celestialPriorities || priorities)];
      list[idx] = val;
      return { ...prev, celestialPriorities: list };
    });
  };

  const handleToggleTodo = (id: string) => {
    sound.playStar();
    onUpdate((prev) => ({
      ...prev,
      celestialTodos: (prev.celestialTodos || todos).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));
  };

  const handleUpdateTodoText = (id: string, text: string) => {
    onUpdate((prev) => ({
      ...prev,
      celestialTodos: (prev.celestialTodos || todos).map((t) =>
        t.id === id ? { ...t, text } : t
      ),
    }));
  };

  const handleUpdateGratitude = (idx: number, text: string) => {
    onUpdate((prev) => {
      const list = [...(prev.gratitudeEntries || gratitude)];
      list[idx] = text;
      return { ...prev, gratitudeEntries: list };
    });
  };

  const handleSetSelfCare = (key: keyof typeof selfCare, val: number) => {
    sound.playStar();
    onUpdate((prev) => ({
      ...prev,
      selfCare: {
        ...(prev.selfCare || selfCare),
        [key]: val,
      },
    }));
  };

  return (
    <div className="w-full bg-[#0b1320] text-[#dfca86] rounded-[36px] p-6 md:p-10 shadow-2xl border-2 border-[#c5a65c]/60 flex flex-col gap-8 font-serif relative overflow-hidden">
      {/* Golden Corner Filigree Accents */}
      <div className="absolute top-2 left-2 text-[#c5a65c]/30 pointer-events-none select-none text-2xl">
        ⚜️
      </div>
      <div className="absolute top-2 right-2 text-[#c5a65c]/30 pointer-events-none select-none text-2xl">
        ⚜️
      </div>
      <div className="absolute bottom-2 left-2 text-[#c5a65c]/30 pointer-events-none select-none text-2xl">
        ⚜️
      </div>
      <div className="absolute bottom-2 right-2 text-[#c5a65c]/30 pointer-events-none select-none text-2xl">
        ⚜️
      </div>

      {/* TOP ORNATE HEADER: Sun & Moon Celestial Face + Quote Frame */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-[#c5a65c]/40 pb-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-3">
            <Feather size={22} className="text-[#c5a65c]" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-[#f4e2a8] drop-shadow-md">
              Daily Planner
            </h1>
          </div>
          <span className="text-xs italic text-[#c5a65c]/80 flex items-center gap-1.5 mt-1">
            <span>✨ Celestial Magic & Golden Rituals</span>
          </span>
        </div>

        {/* Center Celestial Sun & Moon Vector Artwork */}
        <div className="w-20 h-20 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#c5a65c]/50 animate-spin" style={{ animationDuration: '40s' }} />
          <Sun size={40} className="text-[#f4c430] absolute" />
          <Moon size={28} className="text-[#dfca86] absolute -top-1 -right-1" />
        </div>

        {/* Ornate Gold Filigree Quote Frame */}
        <div className="border border-[#c5a65c]/60 bg-[#101b2d] rounded-2xl p-3.5 max-w-xs text-center shadow-lg">
          <p className="text-xs italic text-[#f4e2a8] leading-relaxed">
            “Plan with purpose. Live with magic. Make today extraordinary.”
          </p>
        </div>
      </div>

      {/* 2-COLUMN MAIN LAYOUT: Today's Schedule & Gratitude (Left) / Priorities & To-Do (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: TODAY'S SCHEDULE + GRATITUDE CASTLE */}
        <div className="flex flex-col gap-6">
          {/* Today's Schedule (6 AM to 11 PM) */}
          <div className="border border-[#c5a65c]/50 bg-[#0f1929] rounded-2xl p-4 md:p-5 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#c5a65c]/30 pb-2">
              <span className="text-xs font-black tracking-widest text-[#f4e2a8] uppercase">
                ✦ TODAY'S SCHEDULE ✦
              </span>
              <span className="text-[10px] text-[#c5a65c]/70 font-mono">6 AM - 11 PM</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {CELESTIAL_HOURS.map((hourStr) => {
                const entry = schedule[hourStr] || { text: '', done: false };
                return (
                  <div key={hourStr} className="flex items-center gap-2 border-b border-[#c5a65c]/15 pb-1">
                    <button
                      type="button"
                      onClick={() => handleToggleScheduleDone(hourStr)}
                      className={`w-4 h-4 rounded-full border border-[#c5a65c] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        entry.done ? 'bg-[#c5a65c] text-[#0b1320]' : 'hover:bg-[#c5a65c]/20'
                      }`}
                    >
                      {entry.done && <Check size={10} strokeWidth={3} />}
                    </button>
                    <span className="w-14 text-[11px] font-mono font-bold text-[#dfca86] shrink-0">
                      {hourStr}
                    </span>
                    <input
                      type="text"
                      value={entry.text}
                      onChange={(e) => handleUpdateSchedule(hourStr, e.target.value)}
                      placeholder="برنامه این ساعت..."
                      className={`flex-1 bg-transparent border-none outline-none text-xs text-[#f4e2a8] placeholder-[#c5a65c]/30 ${
                        entry.done ? 'line-through opacity-50' : ''
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today I Am Grateful For... (with Castle & Night Forest Art) */}
          <div className="border border-[#c5a65c]/50 bg-[#0f1929] rounded-2xl p-4 md:p-5 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#c5a65c]/30 pb-2">
              <span className="text-xs font-black tracking-widest text-[#f4e2a8] uppercase flex items-center gap-1.5">
                <span>🏰</span>
                <span>TODAY I AM GRATEFUL FOR...</span>
              </span>
              <span className="text-[10px] text-[#c5a65c]/70 font-mono">شکرگزاری</span>
            </div>

            <div className="flex flex-col gap-2">
              {gratitude.map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 border-b border-[#c5a65c]/20 pb-1.5">
                  <span className="w-5 font-mono text-xs font-bold text-[#c5a65c]">{idx + 1}.</span>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => handleUpdateGratitude(idx, e.target.value)}
                    placeholder="موهبت و زیبایی که بابت آن شکرگزارم..."
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[#f4e2a8] placeholder-[#c5a65c]/30 italic"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOP PRIORITIES + TO DO LIST */}
        <div className="flex flex-col gap-6">
          {/* Top Priorities (1 to 5) */}
          <div className="border border-[#c5a65c]/50 bg-[#0f1929] rounded-2xl p-4 md:p-5 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#c5a65c]/30 pb-2">
              <span className="text-xs font-black tracking-widest text-[#f4e2a8] uppercase flex items-center gap-1.5">
                <span>⭐</span>
                <span>TOP PRIORITIES</span>
              </span>
              <span className="text-[10px] text-[#c5a65c]/70 font-mono">۵ اولویت زرین</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {priorities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 border-b border-[#c5a65c]/25 pb-1.5">
                  <span className="w-5 text-center font-mono text-xs font-bold text-[#c5a65c] bg-[#1a2940] py-0.5 rounded">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdatePriority(idx, e.target.value)}
                    placeholder={`اولویت شماره ${idx + 1}...`}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-[#f4e2a8] placeholder-[#c5a65c]/30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* To Do List with Star and Moon Bullets */}
          <div className="border border-[#c5a65c]/50 bg-[#0f1929] rounded-2xl p-4 md:p-5 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#c5a65c]/30 pb-2">
              <span className="text-xs font-black tracking-widest text-[#f4e2a8] uppercase flex items-center gap-1.5">
                <span>🌹</span>
                <span>TO DO LIST</span>
              </span>
              <span className="text-[10px] text-[#c5a65c]/70 font-mono">فهرست کارها</span>
            </div>

            <div className="flex flex-col gap-2">
              {todos.map((todo, idx) => (
                <div key={todo.id} className="flex items-center gap-2 border-b border-[#c5a65c]/20 pb-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className="cursor-pointer text-sm text-[#c5a65c] hover:scale-125 transition-transform"
                    title={todo.done ? 'تکمیل شده' : 'علامت'}
                  >
                    {idx % 2 === 0 ? '✦' : '☾'}
                  </button>
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                    placeholder="کار قابل انجام..."
                    className={`flex-1 bg-transparent border-none outline-none text-xs text-[#f4e2a8] placeholder-[#c5a65c]/30 ${
                      todo.done ? 'line-through opacity-50' : ''
                    }`}
                  />
                  {todo.done && <Check size={12} className="text-emerald-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NOTES & IDEAS with Enchanted Raven Illustration */}
      <div className="border border-[#c5a65c]/50 bg-[#0f1929] rounded-2xl p-5 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#c5a65c]/30 pb-2">
          <span className="text-xs font-black tracking-widest text-[#f4e2a8] uppercase flex items-center gap-2">
            <span>🦅</span>
            <span>NOTES & IDEAS (افکار، شهود و الهامات روز)</span>
          </span>
          <span className="text-[10px] text-[#c5a65c]/70 italic">Stay magical</span>
        </div>

        <textarea
          value={ravenNotes}
          onChange={(e) => onUpdate((prev) => ({ ...prev, ravenNotes: e.target.value }))}
          placeholder="افکار عمیق، رویاها، استراتژی‌ها و الهامات جادویی خود را در این بخش نگارش فرمایید..."
          rows={4}
          className="w-full bg-transparent border-none outline-none text-xs text-[#f4e2a8] leading-relaxed resize-none italic"
        />
      </div>

      {/* BOTTOM ORNATE SELF-CARE RITUAL BAR */}
      <div className="border-2 border-[#c5a65c]/60 bg-[#101b2d] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-around gap-4 text-center">
        {/* Hydrate */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-[#c5a65c] tracking-widest">
            HYDRATE (آب)
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => handleSetSelfCare('hydrate', d)}
                className={`text-base transition-transform hover:scale-125 cursor-pointer ${
                  d <= selfCare.hydrate ? 'opacity-100 drop-shadow-[0_0_5px_rgba(244,196,48,0.8)]' : 'opacity-25'
                }`}
              >
                💧
              </button>
            ))}
          </div>
        </div>

        {/* Move */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-[#c5a65c] tracking-widest">
            MOVE (تحرک و ورزش)
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => handleSetSelfCare('move', m)}
                className={`text-base transition-transform hover:scale-125 cursor-pointer ${
                  m <= selfCare.move ? 'opacity-100 drop-shadow-[0_0_5px_rgba(244,196,48,0.8)]' : 'opacity-25'
                }`}
              >
                🪷
              </button>
            ))}
          </div>
        </div>

        {/* Rest */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-[#c5a65c] tracking-widest">
            REST (آرامش و خواب)
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => handleSetSelfCare('rest', r)}
                className={`text-base transition-transform hover:scale-125 cursor-pointer ${
                  r <= selfCare.rest ? 'opacity-100 drop-shadow-[0_0_5px_rgba(244,196,48,0.8)]' : 'opacity-25'
                }`}
              >
                🌙
              </button>
            ))}
          </div>
        </div>

        {/* Mind */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-[#c5a65c] tracking-widest">
            MIND (تمرکز ذهن)
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleSetSelfCare('mind', s)}
                className={`text-base transition-transform hover:scale-125 cursor-pointer ${
                  s <= selfCare.mind ? 'opacity-100 drop-shadow-[0_0_5px_rgba(244,196,48,0.8)]' : 'opacity-25'
                }`}
              >
                ✨
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="text-center border-t border-[#c5a65c]/30 pt-3">
        <p className="text-xs italic text-[#c5a65c] tracking-widest">
          ☾ Stay focused. Stay grateful. Stay magical. ☽
        </p>
      </div>
    </div>
  );
};
