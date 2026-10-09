import React, { useState } from 'react';
import { Check, Plus, Trash2, Sparkles, Tag, Target } from 'lucide-react';
import { DayPage, EisenhowerMatrixData, MatrixItem, TimeBlockSlot } from '../types';
import { sound } from '../utils/audio';

interface Template2PlannerSheetProps {
  pageData: DayPage;
  onUpdate: (updater: (prev: DayPage) => DayPage) => void;
  isMiniPreview?: boolean;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const COLOR_TAGS = [
  { id: 'none', color: 'transparent', label: 'بدون رنگ' },
  { id: 'emerald', color: '#526b58', label: 'تمرکز و کار عمیق' },
  { id: 'sky', color: '#4a6572', label: 'جلسه و ارتباط' },
  { id: 'amber', color: '#b47820', label: 'شخصی' },
  { id: 'rose', color: '#c2593f', label: 'فوری و حیاتی' },
  { id: 'slate', color: '#606f7b', label: 'مطالعه و بازنگری' },
];

export const Template2PlannerSheet: React.FC<Template2PlannerSheetProps> = ({
  pageData,
  onUpdate,
  isMiniPreview = false,
}) => {
  const [activeColorPickerSlot, setActiveColorPickerSlot] = useState<string | null>(null);

  // Initialize halfHourSlots if empty
  const halfHourSlots: Record<string, TimeBlockSlot> = pageData.halfHourSlots || {};
  const matrix: EisenhowerMatrixData = pageData.eisenhowerMatrix || {
    urgentImportant: [],
    importantNotUrgent: [],
    urgentNotImportant: [],
    notUrgentNotImportant: [],
  };

  // Helper for 2-digit padding
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Handle One Big Thing
  const handleOneBigThingChange = (val: string) => {
    onUpdate((prev) => ({
      ...prev,
      templateType: 'template-2-one-big-thing',
      oneBigThing: val,
    }));
  };

  // Handle Time Block text change
  const handleSlotTextChange = (key: string, text: string) => {
    onUpdate((prev) => {
      const existingSlots = prev.halfHourSlots || {};
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        halfHourSlots: {
          ...existingSlots,
          [key]: {
            ...(existingSlots[key] || { done: false }),
            text,
          },
        },
      };
    });
  };

  // Toggle Time Block Done
  const handleToggleSlotDone = (key: string) => {
    const current = halfHourSlots[key]?.done || false;
    sound.playTick(!current);
    onUpdate((prev) => {
      const existingSlots = prev.halfHourSlots || {};
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        halfHourSlots: {
          ...existingSlots,
          [key]: {
            ...(existingSlots[key] || { text: '' }),
            done: !current,
          },
        },
      };
    });
  };

  // Set Time Block Color Tag
  const handleSetSlotColor = (key: string, color: string) => {
    sound.playAdd();
    setActiveColorPickerSlot(null);
    onUpdate((prev) => {
      const existingSlots = prev.halfHourSlots || {};
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        halfHourSlots: {
          ...existingSlots,
          [key]: {
            ...(existingSlots[key] || { text: '', done: false }),
            color: color === 'transparent' ? undefined : color,
          },
        },
      };
    });
  };

  // Eisenhower Matrix handlers
  const handleAddMatrixItem = (quadrant: keyof EisenhowerMatrixData) => {
    sound.playAdd();
    const newItem: MatrixItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: '',
      done: false,
    };
    onUpdate((prev) => {
      const curMatrix = prev.eisenhowerMatrix || {
        urgentImportant: [],
        importantNotUrgent: [],
        urgentNotImportant: [],
        notUrgentNotImportant: [],
      };
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        eisenhowerMatrix: {
          ...curMatrix,
          [quadrant]: [...(curMatrix[quadrant] || []), newItem],
        },
      };
    });
  };

  const handleUpdateMatrixItem = (
    quadrant: keyof EisenhowerMatrixData,
    id: string,
    text: string
  ) => {
    onUpdate((prev) => {
      const curMatrix = prev.eisenhowerMatrix || {
        urgentImportant: [],
        importantNotUrgent: [],
        urgentNotImportant: [],
        notUrgentNotImportant: [],
      };
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        eisenhowerMatrix: {
          ...curMatrix,
          [quadrant]: (curMatrix[quadrant] || []).map((item) =>
            item.id === id ? { ...item, text } : item
          ),
        },
      };
    });
  };

  const handleToggleMatrixItemDone = (quadrant: keyof EisenhowerMatrixData, id: string) => {
    onUpdate((prev) => {
      const curMatrix = prev.eisenhowerMatrix || {
        urgentImportant: [],
        importantNotUrgent: [],
        urgentNotImportant: [],
        notUrgentNotImportant: [],
      };
      let wasDone = false;
      const updatedList = (curMatrix[quadrant] || []).map((item) => {
        if (item.id === id) {
          wasDone = item.done;
          return { ...item, done: !item.done };
        }
        return item;
      });
      sound.playTick(!wasDone);
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        eisenhowerMatrix: {
          ...curMatrix,
          [quadrant]: updatedList,
        },
      };
    });
  };

  const handleDeleteMatrixItem = (quadrant: keyof EisenhowerMatrixData, id: string) => {
    sound.playTick(false);
    onUpdate((prev) => {
      const curMatrix = prev.eisenhowerMatrix || {
        urgentImportant: [],
        importantNotUrgent: [],
        urgentNotImportant: [],
        notUrgentNotImportant: [],
      };
      return {
        ...prev,
        templateType: 'template-2-one-big-thing',
        eisenhowerMatrix: {
          ...curMatrix,
          [quadrant]: (curMatrix[quadrant] || []).filter((item) => item.id !== id),
        },
      };
    });
  };

  // Brain Dump handler
  const handleBrainDumpChange = (text: string) => {
    onUpdate((prev) => ({
      ...prev,
      templateType: 'template-2-one-big-thing',
      brainDump: text,
    }));
  };

  return (
    <div
      dir="ltr"
      className="w-full bg-[#fcfbf9] dark:bg-[#191918] text-stone-900 dark:text-stone-100 p-6 sm:p-8 md:p-10 font-sans shadow-sm rounded-2xl border border-stone-200/80 dark:border-stone-800 relative select-text transition-colors"
    >
      {/* 1. TOP BANNER: THE ONE BIG THING */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-stone-700 dark:text-stone-300" />
            <h1 className="text-sm sm:text-base font-bold tracking-widest uppercase font-mono text-stone-800 dark:text-stone-200">
              THE ONE BIG THING
            </h1>
          </div>
          <span className="text-xs text-stone-400 font-mono">هدف استراتژیک امروز</span>
        </div>

        {/* Big Thing Interactive Writing Line */}
        <div className="relative flex items-center bg-white dark:bg-[#20201f] border border-stone-200 dark:border-stone-700/80 rounded-xl p-3 px-4 shadow-2xs group focus-within:border-stone-400 dark:focus-within:border-stone-500 transition-all">
          <input
            type="text"
            value={pageData.oneBigThing || ''}
            onChange={(e) => handleOneBigThingChange(e.target.value)}
            disabled={isMiniPreview}
            placeholder="Write your #1 most important mission / outcome for today..."
            className="w-full text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 placeholder:font-normal outline-none bg-transparent"
          />
          {pageData.oneBigThing && pageData.oneBigThing.trim() && (
            <span className="shrink-0 text-amber-600 dark:text-amber-400 font-semibold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
              ★ Priority Goal
            </span>
          )}
        </div>
      </div>

      {/* 2. TWO-COLUMN MAIN CONTENT (TIME BLOCKING & MATRIX/DUMP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: TIME BLOCKING (8 AM - 6 PM) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-2 mb-3">
            <h2 className="text-xs font-semibold tracking-wider text-stone-700 dark:text-stone-300 uppercase font-mono">
              TIME BLOCKING (8:00 - 18:00)
            </h2>
            <span className="text-[10px] text-stone-400 font-mono">30-min intervals</span>
          </div>

          {/* Time Blocking Table */}
          <div className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#20201f] rounded-xl overflow-hidden flex flex-col divide-y divide-stone-200/60 dark:divide-stone-800">
            {HOURS.map((hour) => {
              const hKey00 = `${pad(hour)}:00`;
              const hKey30 = `${pad(hour)}:30`;
              const slot00 = halfHourSlots[hKey00] || { text: '', done: false };
              const slot30 = halfHourSlots[hKey30] || { text: '', done: false };

              return (
                <div key={hour} className="flex min-h-[50px] divide-x divide-stone-200/60 dark:divide-stone-800">
                  {/* Hour Label */}
                  <div className="w-14 sm:w-16 shrink-0 flex items-center justify-center font-medium text-xs text-stone-500 dark:text-stone-400 select-none bg-stone-50/70 dark:bg-stone-900/50 font-mono">
                    {hour}:00
                  </div>

                  {/* 2 Half-Hour Rows (:00 and :30) */}
                  <div className="flex-1 flex flex-col divide-y divide-stone-150 dark:divide-stone-800/60">
                    {/* Row 1: :00 */}
                    <div
                      className={`flex items-center group transition-colors ${
                        slot00.done ? 'bg-stone-50/60 dark:bg-stone-900/40' : 'hover:bg-stone-50/70 dark:hover:bg-stone-850'
                      }`}
                      style={{
                        backgroundColor: slot00.color ? `${slot00.color}15` : undefined,
                      }}
                    >
                      {/* Color Tag Indicator */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveColorPickerSlot(
                            activeColorPickerSlot === hKey00 ? null : hKey00
                          )
                        }
                        title="انتخاب رنگ"
                        className="w-2.5 self-stretch shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative"
                        style={{ backgroundColor: slot00.color || '#e7e5e4' }}
                      />

                      {/* Main Text Input */}
                      <input
                        type="text"
                        value={slot00.text || ''}
                        onChange={(e) => handleSlotTextChange(hKey00, e.target.value)}
                        disabled={isMiniPreview}
                        className={`flex-1 px-3 py-1.5 text-xs sm:text-sm text-stone-800 dark:text-stone-200 outline-none bg-transparent font-sans ${
                          slot00.done ? 'line-through text-stone-400 dark:text-stone-500 font-normal' : 'font-normal'
                        }`}
                        placeholder=""
                      />

                      {/* Checkbox on Far Right */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlotDone(hKey00)}
                        disabled={isMiniPreview}
                        className="w-7 self-stretch flex items-center justify-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      >
                        <div
                          className={`w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center transition-all ${
                            slot00.done
                              ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                              : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                          }`}
                        >
                          {slot00.done && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>

                      {/* Floating Color Picker Popup */}
                      {activeColorPickerSlot === hKey00 && (
                        <div className="absolute left-16 z-30 bg-white dark:bg-[#1c1c1b] border border-stone-200 dark:border-stone-700 shadow-xl p-2 rounded-xl flex items-center gap-1.5 animate-in fade-in duration-100">
                          {COLOR_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleSetSlotColor(hKey00, tag.color)}
                              className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 hover:scale-120 transition-transform cursor-pointer"
                              style={{ backgroundColor: tag.color }}
                              title={tag.label}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Row 2: :30 */}
                    <div
                      className={`flex items-center group transition-colors ${
                        slot30.done ? 'bg-stone-50/60 dark:bg-stone-900/40' : 'hover:bg-stone-50/70 dark:hover:bg-stone-850'
                      }`}
                      style={{
                        backgroundColor: slot30.color ? `${slot30.color}15` : undefined,
                      }}
                    >
                      {/* Color Tag Indicator */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveColorPickerSlot(
                            activeColorPickerSlot === hKey30 ? null : hKey30
                          )
                        }
                        title="انتخاب رنگ"
                        className="w-2.5 self-stretch shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative"
                        style={{ backgroundColor: slot30.color || '#e7e5e4' }}
                      />

                      {/* Main Text Input */}
                      <input
                        type="text"
                        value={slot30.text || ''}
                        onChange={(e) => handleSlotTextChange(hKey30, e.target.value)}
                        disabled={isMiniPreview}
                        className={`flex-1 px-3 py-1.5 text-xs sm:text-sm text-stone-800 dark:text-stone-200 outline-none bg-transparent font-sans ${
                          slot30.done ? 'line-through text-stone-400 dark:text-stone-500 font-normal' : 'font-normal'
                        }`}
                        placeholder=""
                      />

                      {/* Checkbox on Far Right */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlotDone(hKey30)}
                        disabled={isMiniPreview}
                        className="w-7 self-stretch flex items-center justify-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      >
                        <div
                          className={`w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center transition-all ${
                            slot30.done
                              ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                              : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                          }`}
                        >
                          {slot30.done && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>

                      {/* Floating Color Picker Popup */}
                      {activeColorPickerSlot === hKey30 && (
                        <div className="absolute left-16 z-30 bg-white dark:bg-[#1c1c1b] border border-stone-200 dark:border-stone-700 shadow-xl p-2 rounded-xl flex items-center gap-1.5 animate-in fade-in duration-100">
                          {COLOR_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleSetSlotColor(hKey30, tag.color)}
                              className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 hover:scale-120 transition-transform cursor-pointer"
                              style={{ backgroundColor: tag.color }}
                              title={tag.label}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EISENHOWER PRIORITY MATRIX & BRAIN DUMP */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Top: EISENHOWER PRIORITY MATRIX */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-2 mb-3">
              <h2 className="text-xs font-semibold tracking-wider text-stone-700 dark:text-stone-300 uppercase font-mono">
                EISENHOWER PRIORITY MATRIX
              </h2>
              <span className="text-[10px] text-stone-400 font-mono">ماتریس اولویت</span>
            </div>

            {/* 2x2 Grid with Whisper Dividers */}
            <div className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#20201f] rounded-xl overflow-hidden grid grid-cols-2 divide-x divide-y divide-stone-200/60 dark:divide-stone-800">
              {/* Quadrant 1: URGENT & IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[140px]">
                <div className="text-left font-semibold text-[11px] tracking-wider uppercase mb-2 text-stone-800 dark:text-stone-200 border-b border-stone-200/40 dark:border-stone-800 pb-1 font-mono">
                  1. Urgent & Important
                </div>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.urgentImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('urgentImportant', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border rounded-[3px] flex items-center justify-center cursor-pointer transition-all ${
                          item.done
                            ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                            : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('urgentImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-xs text-stone-800 dark:text-stone-200 outline-none bg-transparent ${
                          item.done ? 'line-through text-stone-400 dark:text-stone-500' : 'font-normal'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('urgentImportant', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isMiniPreview && (
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('urgentImportant')}
                    className="mt-2 text-[10px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 2: IMPORTANT, NOT URGENT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[140px]">
                <div className="text-left font-semibold text-[11px] tracking-wider uppercase mb-2 text-stone-800 dark:text-stone-200 border-b border-stone-200/40 dark:border-stone-800 pb-1 font-mono">
                  2. Important, Not Urgent
                </div>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.importantNotUrgent || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('importantNotUrgent', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border rounded-[3px] flex items-center justify-center cursor-pointer transition-all ${
                          item.done
                            ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                            : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('importantNotUrgent', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-xs text-stone-800 dark:text-stone-200 outline-none bg-transparent ${
                          item.done ? 'line-through text-stone-400 dark:text-stone-500' : 'font-normal'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('importantNotUrgent', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isMiniPreview && (
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('importantNotUrgent')}
                    className="mt-2 text-[10px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 3: URGENT, NOT IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[140px]">
                <div className="text-left font-semibold text-[11px] tracking-wider uppercase mb-2 text-stone-800 dark:text-stone-200 border-b border-stone-200/40 dark:border-stone-800 pb-1 font-mono">
                  3. Urgent, Not Important
                </div>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.urgentNotImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('urgentNotImportant', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border rounded-[3px] flex items-center justify-center cursor-pointer transition-all ${
                          item.done
                            ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                            : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('urgentNotImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-xs text-stone-800 dark:text-stone-200 outline-none bg-transparent ${
                          item.done ? 'line-through text-stone-400 dark:text-stone-500' : 'font-normal'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('urgentNotImportant', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isMiniPreview && (
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('urgentNotImportant')}
                    className="mt-2 text-[10px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 4: NOT URGENT, NOT IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[140px]">
                <div className="text-left font-semibold text-[11px] tracking-wider uppercase mb-2 text-stone-800 dark:text-stone-200 border-b border-stone-200/40 dark:border-stone-800 pb-1 font-mono">
                  4. Not Urgent & Not Important
                </div>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.notUrgentNotImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleMatrixItemDone('notUrgentNotImportant', item.id)
                        }
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border rounded-[3px] flex items-center justify-center cursor-pointer transition-all ${
                          item.done
                            ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
                            : 'border-stone-300 dark:border-stone-600 bg-transparent text-transparent'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('notUrgentNotImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-xs text-stone-800 dark:text-stone-200 outline-none bg-transparent ${
                          item.done ? 'line-through text-stone-400 dark:text-stone-500' : 'font-normal'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMatrixItem('notUrgentNotImportant', item.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isMiniPreview && (
                  <button
                    type="button"
                    onClick={() => handleAddMatrixItem('notUrgentNotImportant')}
                    className="mt-2 text-[10px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: BRAIN DUMP */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-2 mb-3">
              <h2 className="text-xs font-semibold tracking-wider text-stone-700 dark:text-stone-300 uppercase font-mono">
                BRAIN DUMP & REFLECTIONS
              </h2>
              <span className="text-[10px] text-stone-400 font-mono">تخلیه ذهن</span>
            </div>

            <div className="relative w-full rounded-xl bg-white dark:bg-[#20201f] border border-stone-200/80 dark:border-stone-800 p-4">
              <textarea
                value={pageData.brainDump || ''}
                onChange={(e) => handleBrainDumpChange(e.target.value)}
                disabled={isMiniPreview}
                rows={10}
                placeholder="Write freeform thoughts, ideas, sparks, notes, or quick reminders here..."
                className="w-full text-xs sm:text-sm font-sans leading-[28px] text-stone-800 dark:text-stone-200 outline-none resize-none bg-transparent placeholder:text-stone-400 notebook-lines"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
