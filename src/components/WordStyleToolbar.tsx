import React, { useState } from 'react';
import { PageTextFormat } from '../types';
import { sound } from '../utils/audio';
import {
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  ChevronDown,
  Type,
  Palette,
  Minus,
  Plus,
  Check,
  RotateCcw,
  X,
  Pencil,
} from 'lucide-react';

export const PERSIAN_FONTS = [
  { id: 'Vazirmatn', name: 'وزیرمتن', className: 'font-vazir' },
  { id: 'Sahel', name: 'ساحل', className: 'font-sahel' },
  { id: 'Shabnam', name: 'شبنم', className: 'font-shabnam' },
  { id: 'Samim', name: 'صمیم', className: 'font-samim' },
  { id: 'Lalezar', name: 'لاله زار', className: 'font-lalezar' },
  { id: 'Amiri', name: 'امیری', className: 'font-amiri' },
  { id: 'Marhey', name: 'مَرحی', className: 'font-marhey' },
  { id: 'Scheherazade New', name: 'شهرزاد', className: 'font-scheherazade' },
];

export const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20, 24, 28];

export const PEN_SIZES = [
  { size: 1.5, label: 'بسیار نازک' },
  { size: 2.5, label: 'نازک' },
  { size: 4.5, label: 'متوسط' },
  { size: 8, label: 'پهن' },
];

export const QUICK_PEN_COLORS = [
  { color: '#ffffff', label: 'سفید' },
  { color: '#0f172a', label: 'تیره' },
  { color: '#38bdf8', label: 'آبی' },
  { color: '#f87171', label: 'قرمز' },
  { color: '#4ade80', label: 'سبز' },
  { color: '#fbbf24', label: 'طلایی' },
];

export const QUICK_HIGHLIGHT_COLORS = [
  { color: '#fef08a', label: 'زرد نئونی' },
  { color: '#86efac', label: 'سبز فسفری' },
  { color: '#7dd3fc', label: 'آبی روشن' },
  { color: '#f472b6', label: 'صورتی نئونی' },
];

export const QUICK_TEXT_COLORS = [
  { color: '#0f172a', label: 'سیاه' },
  { color: '#334155', label: 'دودی' },
  { color: '#1e3a8a', label: 'سرمه‌ای' },
  { color: '#991b1b', label: 'زرشکی' },
  { color: '#166534', label: 'سبز' },
];

interface WordStyleToolbarProps {
  onClose: () => void;

  // Drawing properties
  isDrawingActive: boolean;
  onToggleDrawing: () => void;
  currentTool: 'pen' | 'highlighter' | 'eraser';
  onChangeTool: (tool: 'pen' | 'highlighter' | 'eraser') => void;
  strokeColor: string;
  onChangeStrokeColor: (color: string) => void;
  strokeSize: number;
  onChangeStrokeSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearStrokes: () => void;
  totalStrokes: number;

  // Text formatting properties
  textFormat: PageTextFormat;
  onUpdateTextFormat: (updater: (prev: PageTextFormat) => PageTextFormat) => void;
  onApplyFormat?: (updates: Partial<PageTextFormat>) => void;
}

export const WordStyleToolbar: React.FC<WordStyleToolbarProps> = ({
  onClose,
  isDrawingActive,
  onToggleDrawing,
  currentTool,
  onChangeTool,
  strokeColor,
  onChangeStrokeColor,
  strokeSize,
  onChangeStrokeSize,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearStrokes,
  totalStrokes,
  textFormat,
  onUpdateTextFormat,
  onApplyFormat,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'text'>('draw');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  const applyChange = (updates: Partial<PageTextFormat>) => {
    sound.playTick();
    if (onApplyFormat) {
      onApplyFormat(updates);
    } else {
      onUpdateTextFormat((prev) => ({ ...prev, ...updates }));
    }
  };

  const handleIncreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(textFormat.fontSize);
    const newSize =
      currentIndex < FONT_SIZES.length - 1 && currentIndex !== -1
        ? FONT_SIZES[currentIndex + 1]
        : Math.min(40, textFormat.fontSize + 2);
    applyChange({ fontSize: newSize });
  };

  const handleDecreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(textFormat.fontSize);
    const newSize =
      currentIndex > 0
        ? FONT_SIZES[currentIndex - 1]
        : Math.max(10, textFormat.fontSize - 2);
    applyChange({ fontSize: newSize });
  };

  const currentFontObj = PERSIAN_FONTS.find((f) => f.id === textFormat.fontFamily) || PERSIAN_FONTS[0];

  return (
    <div className="w-full max-w-5xl mb-4 bg-white/95 dark:bg-[#1a1a18]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-sm rounded-2xl p-2.5 sm:px-4 sm:py-3 text-stone-800 dark:text-stone-200 transition-all select-none animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Header Row: Minimal Tabs & Close Button */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 dark:border-stone-800 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          {/* Tab 1: Drawing & Inking */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('draw');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <PenTool size={13} />
            <span>قلم و نقاشی</span>
            {isDrawingActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Tab 2: Typography & Word Formatting */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('text');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Type size={13} />
            <span>فونت و سایز متن</span>
          </button>
        </div>

        {/* Right side: Quick drawing toggle indicator + close button */}
        <div className="flex items-center gap-2">
          {/* Direct Draw Switch button */}
          <button
            type="button"
            onClick={onToggleDrawing}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isDrawingActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Pencil size={12} className={isDrawingActive ? 'text-white' : ''} />
            <span>{isDrawingActive ? 'قلم فعال است' : 'شروع نقاشی با قلم'}</span>
          </button>

          {/* Close toolbar button */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
            title="بستن نوار ابزار"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Tool Row */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs">
        {activeTab === 'draw' ? (
          /* =========================================================
             TAB 1: DRAWING & INKING CONTROLS
             ========================================================= */
          <div className="flex flex-wrap items-center gap-2 w-full justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tool Selector: Pen / Highlighter / Eraser */}
              <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => {
                    sound.playTick();
                    onChangeTool('pen');
                    if (!isDrawingActive) onToggleDrawing();
                  }}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    currentTool === 'pen' && isDrawingActive
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="قلم خودکاری و راپید"
                >
                  <PenTool size={13} />
                  <span>قلم</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playTick();
                    onChangeTool('highlighter');
                    if (!isDrawingActive) onToggleDrawing();
                  }}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    currentTool === 'highlighter' && isDrawingActive
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="هایلایتر ماژیکی"
                >
                  <Highlighter size={13} />
                  <span>هایلایتر</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playTick();
                    onChangeTool('eraser');
                    if (!isDrawingActive) onToggleDrawing();
                  }}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    currentTool === 'eraser' && isDrawingActive
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="پاک‌کن"
                >
                  <Eraser size={13} />
                  <span>پاک‌کن</span>
                </button>
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">ضخامت:</span>
                <div className="flex items-center gap-1">
                  {PEN_SIZES.map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => {
                        sound.playTick();
                        onChangeStrokeSize(item.size);
                      }}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                        strokeSize === item.size
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                          : 'hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-600 dark:text-stone-400'
                      }`}
                      title={item.label}
                    >
                      <div
                        className="rounded-full bg-current"
                        style={{
                          width: `${Math.max(2.5, item.size * 1.3)}px`,
                          height: `${Math.max(2.5, item.size * 1.3)}px`,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Color */}
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">رنگ:</span>
                <div className="flex items-center gap-1">
                  {(currentTool === 'highlighter' ? QUICK_HIGHLIGHT_COLORS : QUICK_PEN_COLORS).map(
                    (item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          sound.playTick();
                          onChangeStrokeColor(item.color);
                        }}
                        className={`w-4 h-4 rounded-full border transition-transform cursor-pointer relative ${
                          strokeColor === item.color
                            ? 'scale-125 border-stone-900 dark:border-stone-100 shadow-2xs'
                            : 'border-stone-300 dark:border-stone-600 hover:scale-110'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    )
                  )}
                  {/* Custom color picker */}
                  <label className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 overflow-hidden cursor-pointer flex items-center justify-center relative hover:scale-110 transition-transform">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => onChangeStrokeColor(e.target.value)}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                    <Palette size={9} className="text-stone-500" />
                  </label>
                </div>
              </div>
            </div>

            {/* Undo / Redo & Clear Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!canUndo}
                onClick={() => {
                  sound.playTick();
                  onUndo();
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                  canUndo
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer'
                    : 'opacity-40 border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                title="بازگشت (Undo)"
              >
                <Undo2 size={13} />
              </button>

              <button
                type="button"
                disabled={!canRedo}
                onClick={() => {
                  sound.playTick();
                  onRedo();
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                  canRedo
                    ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer'
                    : 'opacity-40 border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                title="جلو (Redo)"
              >
                <Redo2 size={13} />
              </button>

              {totalStrokes > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('آیا تمام خطوط کشیده شده این برگه پاک شوند؟')) {
                      sound.playSwoosh();
                      onClearStrokes();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition-colors"
                  title="پاک کردن تمام نقاشی‌های این برگه"
                >
                  <Trash2 size={12} />
                  <span>پاک‌سازی</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================
             TAB 2: TYPOGRAPHY CONTROLS
             ========================================================= */
          <div className="flex flex-wrap items-center gap-2.5 w-full justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Font Family Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setIsFontDropdownOpen(!isFontDropdownOpen);
                    setIsSizeDropdownOpen(false);
                  }}
                  className="h-8 px-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer min-w-[130px] justify-between text-xs text-stone-800 dark:text-stone-200"
                >
                  <span className={`truncate font-medium ${currentFontObj.className}`}>
                    {currentFontObj.name}
                  </span>
                  <ChevronDown size={12} className="text-stone-500" />
                </button>

                {isFontDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-white dark:bg-[#1f1f1d] border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg z-50 p-1.5 max-h-64 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-medium text-stone-400 border-b border-stone-100 dark:border-stone-800 mb-1">
                      انتخاب قلم فارسی
                    </div>
                    {PERSIAN_FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          applyChange({ fontFamily: font.id });
                          setIsFontDropdownOpen(false);
                        }}
                        className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer mb-0.5 ${
                          textFormat.fontFamily === font.id
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className={font.className}>{font.name}</span>
                        {textFormat.fontFamily === font.id && (
                          <Check size={13} className="text-stone-900 dark:text-stone-100 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Size Stepper */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDecreaseFontSize}
                  className="w-6 h-6 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center font-medium text-xs cursor-pointer transition-colors text-stone-700 dark:text-stone-300"
                  title="کاهش اندازه قلم (A-)"
                >
                  <Minus size={11} />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setIsSizeDropdownOpen(!isSizeDropdownOpen);
                      setIsFontDropdownOpen(false);
                    }}
                    className="px-2 py-0.5 text-xs font-mono font-medium hover:bg-stone-200/70 dark:hover:bg-stone-700/70 rounded cursor-pointer text-stone-800 dark:text-stone-200"
                  >
                    {textFormat.fontSize} pt
                  </button>
                  {isSizeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-16 bg-white dark:bg-[#1f1f1d] border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg z-50 p-1 max-h-48 overflow-y-auto">
                      {FONT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyChange({ fontSize: size });
                            setIsSizeDropdownOpen(false);
                          }}
                          className={`w-full text-center py-1 rounded text-xs font-mono cursor-pointer ${
                            textFormat.fontSize === size
                              ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleIncreaseFontSize}
                  className="w-6 h-6 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center font-medium text-xs cursor-pointer transition-colors text-stone-700 dark:text-stone-300"
                  title="افزایش اندازه قلم (A+)"
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Bold / Italic / Underline */}
              <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ isBold: !textFormat.isBold });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isBold
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="ضخیم (Bold)"
                >
                  <Bold size={13} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ isItalic: !textFormat.isItalic });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isItalic
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="مورب (Italic)"
                >
                  <Italic size={13} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ isUnderline: !textFormat.isUnderline });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isUnderline
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="زیرخط‌دار (Underline)"
                >
                  <Underline size={13} />
                </button>
              </div>

              {/* Text Align */}
              <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ textAlign: 'right' });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'right'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="راست‌چین"
                >
                  <AlignRight size={13} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ textAlign: 'center' });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'center'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="وسط‌چین"
                >
                  <AlignCenter size={13} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ textAlign: 'left' });
                  }}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'left'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title="چپ‌چین"
                >
                  <AlignLeft size={13} />
                </button>
              </div>

              {/* Text Color */}
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">رنگ متن:</span>
                <div className="flex items-center gap-1">
                  {QUICK_TEXT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyChange({ textColor: item.color });
                      }}
                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer relative ${
                        textFormat.textColor === item.color
                          ? 'scale-125 border-stone-900 dark:border-stone-100 shadow-2xs'
                          : 'border-stone-300 dark:border-stone-600 hover:scale-110'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                  <label
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 overflow-hidden cursor-pointer flex items-center justify-center relative hover:scale-110 transition-transform"
                  >
                    <input
                      type="color"
                      value={textFormat.textColor}
                      onChange={(e) => {
                        applyChange({ textColor: e.target.value });
                      }}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                    <Palette size={9} className="text-stone-500" />
                  </label>
                </div>
              </div>
            </div>

            {/* Reset to Default */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                applyChange({
                  fontFamily: 'Vazirmatn',
                  fontSize: 14,
                  isBold: false,
                  isItalic: false,
                  isUnderline: false,
                  textAlign: 'right',
                  textColor: '#1e293b',
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="بازنشانی قلم به حالت اولیه"
            >
              <RotateCcw size={12} />
              <span>پیش‌فرض</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
