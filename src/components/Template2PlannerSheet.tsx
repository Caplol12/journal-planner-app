import React, { useState } from 'react';
import { Check, Plus, Trash2, Sparkles, Tag } from 'lucide-react';
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
  { id: 'emerald', color: '#10b981', label: 'کار و تمرکز' },
  { id: 'sky', color: '#0ea5e9', label: 'جلسه و ارتباط' },
  { id: 'amber', color: '#f59e0b', label: 'شخصی و خرید' },
  { id: 'rose', color: '#f43f5e', label: 'فوری و حیاتی' },
  { id: 'purple', color: '#8b5cf6', label: 'مطالعه و تحقیق' },
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
    const list = matrix[quadrant] || [];
    const target = list.find((i) => i.id === id);
    const nextDone = !target?.done;
    sound.playTick(nextDone);

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
            item.id === id ? { ...item, done: nextDone } : item
          ),
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
      className="w-full bg-[#fdfbf7] text-[#111111] p-6 sm:p-10 font-sans shadow-2xl rounded-2xl border border-neutral-300 relative select-text"
      style={{
        boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      {/* ========================================================
          1. TOP BANNER: THE ONE BIG THING
         ======================================================== */}
      <div className="w-full mb-8">
        <div className="bg-black text-white text-center py-3.5 px-6 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] uppercase font-mono">
            THE ONE BIG THING
          </h1>
        </div>

        {/* Big Thing Interactive Writing Line */}
        <div className="mt-3 relative flex items-center bg-white border-2 border-black/80 rounded-sm p-3 px-4 shadow-2xs group focus-within:border-black transition-all">
          <input
            type="text"
            value={pageData.oneBigThing || ''}
            onChange={(e) => handleOneBigThingChange(e.target.value)}
            disabled={isMiniPreview}
            placeholder="Write your #1 most important mission / outcome for today..."
            className="w-full text-base sm:text-lg font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal outline-none bg-transparent"
          />
          {pageData.oneBigThing && pageData.oneBigThing.trim() && (
            <span className="shrink-0 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ⭐ Goal #1
            </span>
          )}
        </div>
      </div>

      {/* ========================================================
          2. TWO-COLUMN MAIN CONTENT (TIME BLOCKING & MATRIX/DUMP)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: TIME BLOCKING (8 AM - 6 PM)
           ======================================================== */}
        <div className="lg:col-span-6 flex flex-col">
          <h2 className="text-sm font-black tracking-wider text-black text-center mb-2.5 uppercase font-mono">
            TIME BLOCKING (8 AM - 6 PM)
          </h2>

          {/* Time Blocking Table */}
          <div className="border-2 border-black bg-white flex flex-col divide-y divide-black/70">
            {HOURS.map((hour) => {
              const hKey00 = `${pad(hour)}:00`;
              const hKey30 = `${pad(hour)}:30`;
              const slot00 = halfHourSlots[hKey00] || { text: '', done: false };
              const slot30 = halfHourSlots[hKey30] || { text: '', done: false };

              return (
                <div key={hour} className="flex min-h-[58px] divide-x divide-black/70">
                  {/* Hour Label (spans the 2 half hours) */}
                  <div className="w-14 sm:w-16 shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm text-black select-none bg-[#fbf9f5] border-r border-black/70 font-mono">
                    {hour}:00
                  </div>

                  {/* 2 Half-Hour Rows (:00 and :30) */}
                  <div className="flex-1 flex flex-col divide-y divide-black/40">
                    {/* Row 1: :00 */}
                    <div
                      className={`flex items-center group transition-colors ${
                        slot00.done ? 'bg-neutral-100/80' : 'hover:bg-amber-50/20'
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
                        title="انتخاب برچسب رنگی"
                        className="w-3.5 self-stretch border-r border-black/30 shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative"
                        style={{ backgroundColor: slot00.color || '#e5e7eb' }}
                      />

                      {/* Main Text Input */}
                      <input
                        type="text"
                        value={slot00.text || ''}
                        onChange={(e) => handleSlotTextChange(hKey00, e.target.value)}
                        disabled={isMiniPreview}
                        className={`flex-1 px-2.5 py-1 text-xs sm:text-sm text-neutral-900 outline-none bg-transparent leading-snug font-sans ${
                          slot00.done ? 'line-through text-neutral-400 font-normal' : 'font-medium'
                        }`}
                        placeholder=""
                      />

                      {/* Checkbox on Far Right */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlotDone(hKey00)}
                        disabled={isMiniPreview}
                        className="w-8 self-stretch border-l border-black/70 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 border border-black rounded-xs flex items-center justify-center transition-all ${
                            slot00.done ? 'bg-black text-white' : 'bg-white'
                          }`}
                        >
                          {slot00.done && <Check size={11} strokeWidth={3.5} />}
                        </div>
                      </button>

                      {/* Floating Color Picker Popup */}
                      {activeColorPickerSlot === hKey00 && (
                        <div className="absolute left-16 z-30 bg-white border border-black shadow-xl p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-100">
                          {COLOR_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleSetSlotColor(hKey00, tag.color)}
                              className="w-5 h-5 rounded-full border border-black/30 hover:scale-115 transition-transform cursor-pointer"
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
                        slot30.done ? 'bg-neutral-100/80' : 'hover:bg-amber-50/20'
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
                        title="انتخاب برچسب رنگی"
                        className="w-3.5 self-stretch border-r border-black/30 shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative"
                        style={{ backgroundColor: slot30.color || '#e5e7eb' }}
                      />

                      {/* Main Text Input */}
                      <input
                        type="text"
                        value={slot30.text || ''}
                        onChange={(e) => handleSlotTextChange(hKey30, e.target.value)}
                        disabled={isMiniPreview}
                        className={`flex-1 px-2.5 py-1 text-xs sm:text-sm text-neutral-900 outline-none bg-transparent leading-snug font-sans ${
                          slot30.done ? 'line-through text-neutral-400 font-normal' : 'font-medium'
                        }`}
                        placeholder=""
                      />

                      {/* Checkbox on Far Right */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlotDone(hKey30)}
                        disabled={isMiniPreview}
                        className="w-8 self-stretch border-l border-black/70 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 border border-black rounded-xs flex items-center justify-center transition-all ${
                            slot30.done ? 'bg-black text-white' : 'bg-white'
                          }`}
                        >
                          {slot30.done && <Check size={11} strokeWidth={3.5} />}
                        </div>
                      </button>

                      {/* Floating Color Picker Popup */}
                      {activeColorPickerSlot === hKey30 && (
                        <div className="absolute left-16 z-30 bg-white border border-black shadow-xl p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-100">
                          {COLOR_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleSetSlotColor(hKey30, tag.color)}
                              className="w-5 h-5 rounded-full border border-black/30 hover:scale-115 transition-transform cursor-pointer"
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

        {/* ========================================================
            RIGHT COLUMN: EISENHOWER PRIORITY MATRIX & BRAIN DUMP
           ======================================================== */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          {/* Top of Right Column: EISENHOWER PRIORITY MATRIX */}
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-wider text-black text-center mb-2.5 uppercase font-mono">
              EISENHOWER PRIORITY MATRIX
            </h2>

            {/* 2x2 Grid with Bold Black Borders */}
            <div className="border-2 border-black bg-white grid grid-cols-2 divide-x divide-y divide-black">
              {/* Quadrant 1: URGENT & IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[145px] bg-white">
                <div className="text-center font-black text-[11px] sm:text-xs tracking-wider uppercase mb-2 leading-tight text-neutral-900 border-b border-black/20 pb-1 font-mono">
                  URGENT &<br />IMPORTANT
                </div>

                {/* Items */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.urgentImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('urgentImportant', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border border-black rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                          item.done ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3.5} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('urgentImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-[11px] sm:text-xs text-neutral-900 outline-none bg-transparent ${
                          item.done ? 'line-through text-neutral-400' : 'font-medium'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('urgentImportant', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5 cursor-pointer"
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
                    className="mt-2 text-[10px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 2: IMPORTANT, NOT URGENT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[145px] bg-white">
                <div className="text-center font-black text-[11px] sm:text-xs tracking-wider uppercase mb-2 leading-tight text-neutral-900 border-b border-black/20 pb-1 font-mono">
                  IMPORTANT,<br />NOT URGENT
                </div>

                {/* Items */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.importantNotUrgent || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('importantNotUrgent', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border border-black rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                          item.done ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3.5} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('importantNotUrgent', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-[11px] sm:text-xs text-neutral-900 outline-none bg-transparent ${
                          item.done ? 'line-through text-neutral-400' : 'font-medium'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('importantNotUrgent', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5 cursor-pointer"
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
                    className="mt-2 text-[10px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 3: URGENT, NOT IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[145px] bg-white">
                <div className="text-center font-black text-[11px] sm:text-xs tracking-wider uppercase mb-2 leading-tight text-neutral-900 border-b border-black/20 pb-1 font-mono">
                  URGENT,<br />NOT IMPORTANT
                </div>

                {/* Items */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.urgentNotImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() => handleToggleMatrixItemDone('urgentNotImportant', item.id)}
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border border-black rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                          item.done ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3.5} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('urgentNotImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-[11px] sm:text-xs text-neutral-900 outline-none bg-transparent ${
                          item.done ? 'line-through text-neutral-400' : 'font-medium'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMatrixItem('urgentNotImportant', item.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5 cursor-pointer"
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
                    className="mt-2 text-[10px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Quadrant 4: NOT URGENT, NOT IMPORTANT */}
              <div className="p-3 sm:p-3.5 flex flex-col min-h-[145px] bg-white">
                <div className="text-center font-black text-[11px] sm:text-xs tracking-wider uppercase mb-2 leading-tight text-neutral-900 border-b border-black/20 pb-1 font-mono">
                  NOT URGENT,<br />NOT IMPORTANT
                </div>

                {/* Items */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32">
                  {(matrix.notUrgentNotImportant || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 group">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleMatrixItemDone('notUrgentNotImportant', item.id)
                        }
                        disabled={isMiniPreview}
                        className={`w-3.5 h-3.5 shrink-0 border border-black rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                          item.done ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        {item.done && <Check size={9} strokeWidth={3.5} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          handleUpdateMatrixItem('notUrgentNotImportant', item.id, e.target.value)
                        }
                        disabled={isMiniPreview}
                        className={`flex-1 text-[11px] sm:text-xs text-neutral-900 outline-none bg-transparent ${
                          item.done ? 'line-through text-neutral-400' : 'font-medium'
                        }`}
                        placeholder="Task..."
                      />
                      {!isMiniPreview && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMatrixItem('notUrgentNotImportant', item.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-0.5 cursor-pointer"
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
                    className="mt-2 text-[10px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add Item</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom of Right Column: BRAIN DUMP */}
          <div className="flex flex-col flex-1">
            <h2 className="text-sm font-black tracking-wider text-black text-center mb-3 uppercase font-mono">
              BRAIN DUMP
            </h2>

            {/* Dotted Lined Note Area (exact replica of the image dotted rules!) */}
            <div className="relative w-full rounded-xs bg-white/70 p-4 pt-2">
              <textarea
                value={pageData.brainDump || ''}
                onChange={(e) => handleBrainDumpChange(e.target.value)}
                disabled={isMiniPreview}
                rows={14}
                placeholder="Write freeform thoughts, ideas, sparks, notes, or quick reminders here..."
                className="w-full text-xs sm:text-sm font-mono leading-[28px] text-neutral-800 outline-none resize-none bg-transparent placeholder:text-neutral-300"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent, transparent 27px, #9ca3af 27px, #9ca3af 28px)',
                  backgroundAttachment: 'local',
                  lineHeight: '28px',
                  paddingTop: '2px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
