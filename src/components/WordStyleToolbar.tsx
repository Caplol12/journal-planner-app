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
    <div className="w-full max-w-5xl mb-4 bg-white/20 dark:bg-black/35 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-2xl rounded-3xl p-2.5 sm:px-4 sm:py-3 text-white transition-all select-none animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Glass Header Row: Minimal Tabs & Close Button */}
      <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          {/* Tab 1: Drawing & Inking */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('draw');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-white/30 text-white border border-white/30 shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <PenTool size={13} />
            <span>قلم و نقاشی</span>
            {isDrawingActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Tab 2: Typography & Word Formatting */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              setActiveTab('text');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white/30 text-white border border-white/30 shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/10'
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
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
              isDrawingActive
                ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-400/40'
                : 'bg-white/15 hover:bg-white/25 text-white/90 border-white/20'
            }`}
          >
            <Pencil size={12} className={isDrawingActive ? 'animate-bounce' : ''} />
            <span>{isDrawingActive ? 'قلم فعال است' : 'شروع نقاشی با قلم'}</span>
          </button>

          {/* Close toolbar button */}
          <button
            type="button"
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-rose-500/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
            title="بستن نوار ابزار"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Tool Row */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs">
        {activeTab === 'draw' ? (
          /* =========================================================
             TAB 1: GLASS DRAWING & INKING CONTROLS
             ========================================================= */
          <div className="flex flex-wrap items-center gap-2 w-full justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tool Selector: Pen / Highlighter / Eraser */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={() => {
                    sound.playTick();
                    onChangeTool('pen');
                    if (!isDrawingActive) onToggleDrawing();
                  }}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                    currentTool === 'pen' && isDrawingActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                    currentTool === 'highlighter' && isDrawingActive
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                    currentTool === 'eraser' && isDrawingActive
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="پاک‌کن"
                >
                  <Eraser size={13} />
                  <span>پاک‌کن</span>
                </button>
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-xl border border-white/15">
                <span className="text-[11px] text-white/70">ضخامت:</span>
                <div className="flex items-center gap-1">
                  {PEN_SIZES.map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => {
                        sound.playTick();
                        onChangeStrokeSize(item.size);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        strokeSize === item.size
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'hover:bg-white/20 text-white'
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
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-xl border border-white/15">
                <span className="text-[11px] text-white/70">رنگ:</span>
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
                        className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer relative ${
                          strokeColor === item.color
                            ? 'scale-125 border-white shadow-md'
                            : 'border-white/40 hover:scale-115'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    )
                  )}
                  {/* Custom color picker */}
                  <label className="w-5 h-5 rounded-full border border-white/40 overflow-hidden cursor-pointer flex items-center justify-center relative hover:scale-115 transition-transform">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => onChangeStrokeColor(e.target.value)}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                    <Palette size={10} className="text-white/80" />
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
                    ? 'bg-white/15 hover:bg-white/25 border-white/20 text-white cursor-pointer'
                    : 'opacity-40 border-white/10 text-white/40 cursor-not-allowed'
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
                    ? 'bg-white/15 hover:bg-white/25 border-white/20 text-white cursor-pointer'
                    : 'opacity-40 border-white/10 text-white/40 cursor-not-allowed'
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
                  className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
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
             TAB 2: GLASS TYPOGRAPHY CONTROLS
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
                  className="h-8 px-2.5 bg-black/25 hover:bg-black/35 border border-white/25 rounded-xl flex items-center gap-2 transition-colors cursor-pointer min-w-[130px] justify-between text-xs"
                >
                  <span className={`truncate font-bold ${currentFontObj.className}`}>
                    {currentFontObj.name}
                  </span>
                  <ChevronDown size={12} className="text-white/70" />
                </button>

                {isFontDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 p-1.5 max-h-64 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-bold text-white/50 border-b border-white/10 mb-1">
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
                            ? 'bg-white/25 text-white font-bold'
                            : 'hover:bg-white/10 text-white/80'
                        }`}
                      >
                        <span className={font.className}>{font.name}</span>
                        {textFormat.fontFamily === font.id && (
                          <Check size={13} className="text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Size Stepper */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDecreaseFontSize}
                  className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
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
                    className="px-2 py-0.5 text-xs font-mono font-bold hover:bg-white/20 rounded cursor-pointer"
                  >
                    {textFormat.fontSize} pt
                  </button>
                  {isSizeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-16 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-50 p-1 max-h-48 overflow-y-auto">
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
                              ? 'bg-blue-600 text-white font-bold'
                              : 'hover:bg-white/15 text-white/80'
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
                  className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                  title="افزایش اندازه قلم (A+)"
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Bold / Italic / Underline */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ isBold: !textFormat.isBold });
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isBold
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isItalic
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.isUnderline
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="زیرخط‌دار (Underline)"
                >
                  <Underline size={13} />
                </button>
              </div>

              {/* Text Align */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    applyChange({ textAlign: 'right' });
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'right'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'center'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    textFormat.textAlign === 'left'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="چپ‌چین"
                >
                  <AlignLeft size={13} />
                </button>
              </div>

              {/* Text Color */}
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-xl border border-white/15">
                <span className="text-[11px] text-white/70">رنگ متن:</span>
                <div className="flex items-center gap-1">
                  {QUICK_TEXT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyChange({ textColor: item.color });
                      }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer relative ${
                        textFormat.textColor === item.color
                          ? 'scale-125 border-white shadow-md'
                          : 'border-white/40 hover:scale-115'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                  <label
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded-full border border-white/40 overflow-hidden cursor-pointer flex items-center justify-center relative hover:scale-115 transition-transform"
                  >
                    <input
                      type="color"
                      value={textFormat.textColor}
                      onChange={(e) => {
                        applyChange({ textColor: e.target.value });
                      }}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                    <Palette size={10} className="text-white/80" />
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
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
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
