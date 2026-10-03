import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, Download, Upload, Volume2, Image as ImageIcon, Pipette, RotateCcw } from 'lucide-react';
import { AppSettings, Journal, JournalTheme } from '../types';
import { sound } from '../utils/audio';

// Color palette matching the screenshot exactly
export const NOTEBOOK_PALETTE = [
  { hex: '#fbc068', name: 'زرد زردآلویی' },
  { hex: '#cf6748', name: 'نارنجی سفالی' },
  { hex: '#c893d6', name: 'بنفش اسطوخودوس' },
  { hex: '#8bc6f8', name: 'آبی آسمانی' },
  { hex: '#9ecf9f', name: 'سبز پاستلی' },
  { hex: '#f7b7cb', name: 'صورتی ملایم' },
];

// Unified Notebook Creator / Editor Modal matching image.png
interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: string, theme: JournalTheme, coverImage?: string) => void;
  initialTitle?: string;
  initialColor?: string;
  initialTheme?: JournalTheme;
  initialCoverImage?: string;
  isEditMode?: boolean;
}

export const NotebookCoverModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle = 'notebook 22',
  initialColor = '#cf6748',
  initialTheme = 'sage',
  initialCoverImage,
  isEditMode = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);
  const [theme] = useState<JournalTheme>(initialTheme);
  const [coverImage, setCoverImage] = useState<string | undefined>(initialCoverImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setColor(initialColor);
      setCoverImage(initialCoverImage);
    }
  }, [isOpen, initialTitle, initialColor, initialCoverImage]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCoverImage(dataUrl);
        sound.playAdd();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    sound.playAdd();
    onSave(title.trim() || 'notebook 22', color, theme, coverImage);
    onClose();
  };

  const isCustomColor = !NOTEBOOK_PALETTE.some((p) => p.hex.toLowerCase() === color.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] md:rounded-[38px] p-6 sm:p-7 max-w-[390px] w-full shadow-2xl flex flex-col gap-5 border border-slate-100 select-none animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar: Checkmark (Save), Centered Title, Close */}
        <div className="flex items-center justify-between">
          {/* Confirm Button (Green checkmark in rounded button) */}
          <button
            type="button"
            onClick={handleSave}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200/90 shadow-2xs flex items-center justify-center text-emerald-600 transition-all active:scale-95 cursor-pointer"
            title="تایید و ذخیره"
          >
            <Check size={18} strokeWidth={2.8} />
          </button>

          {/* Centered Modal Title */}
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
            {isEditMode ? 'ویرایش دفترچه' : 'دفترچه جدید'}
          </h2>

          {/* Close Button (Rounded square with X) */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-500 transition-all active:scale-95 cursor-pointer"
            title="بستن"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* 3D Realistic Notebook Illustration Preview */}
        <div className="flex justify-center py-1">
          <div
            className="w-[195px] h-[255px] rounded-r-[22px] rounded-l-[4px] relative shadow-[0_16px_35px_-8px_rgba(0,0,0,0.28)] transition-all duration-300 overflow-hidden flex flex-col justify-start"
            style={{
              backgroundColor: color,
              backgroundImage: coverImage ? `url(${coverImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark gradient overlay for 3D depth if plain color */}
            {!coverImage && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10 pointer-events-none" />
            )}

            {/* Notebook Spine (left vertical spine crease lines) */}
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/15 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-black/30 pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 left-[9px] w-[1px] bg-white/40 pointer-events-none z-10" />

            {/* Cream Horizontal Title Label Strip (Exact match to image.png) */}
            <div className="relative mt-8 z-10 w-[84%] bg-[#fbf6f3] shadow-md rounded-r-2xl py-2 px-3.5 flex items-center border-y border-r border-[#eddcd4]/50">
              <span className="text-xs sm:text-[13px] font-black text-slate-800 truncate tracking-tight select-none">
                {title.trim() || 'notebook 22'}
              </span>
            </div>
          </div>
        </div>

        {/* "Import From Gallery" Button */}
        <div className="flex items-center justify-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-2xl flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Import From Gallery</span>
            <ImageIcon size={15} className="text-slate-600" />
          </button>

          {coverImage && (
            <button
              type="button"
              onClick={() => setCoverImage(undefined)}
              className="p-2.5 text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-200 hover:bg-rose-50 transition-colors cursor-pointer"
              title="حذف تصویر و بازگشت به رنگ تک‌رنگ"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Notebook Title Text Input */}
        <div className="w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="notebook 22"
            className="w-full bg-[#f0f4f9] border border-slate-200/90 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner/10"
          />
        </div>

        {/* "Cover Color" Palette Selector */}
        <div className="flex flex-col gap-2">
          <div className="text-left select-none">
            <span className="text-xs font-bold text-slate-700">Cover Color</span>
          </div>

          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            {NOTEBOOK_PALETTE.map((item) => {
              const isSelected = color.toLowerCase() === item.hex.toLowerCase();
              return (
                <button
                  type="button"
                  key={item.hex}
                  onClick={() => {
                    setColor(item.hex);
                    sound.playTick(true);
                  }}
                  title={item.name}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'ring-2 ring-slate-800 border-2 border-slate-800 scale-105 shadow-md'
                      : 'border border-black/10 hover:scale-105 shadow-2xs'
                  }`}
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && <span className="w-2.5 h-2.5 bg-white rounded-full shadow-xs" />}
                </button>
              );
            })}

            {/* Rainbow Custom Color Picker (Eyedropper / Pipette) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                title="انتخاب رنگ دلخواه..."
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                  isCustomColor
                    ? 'ring-2 ring-slate-800 border-2 border-slate-800 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  background:
                    'linear-gradient(135deg, #00c6ff 0%, #0072ff 20%, #7f00ff 40%, #e100ff 60%, #ff007f 80%, #ffff00 100%)',
                }}
              >
                <Pipette size={17} className="text-white drop-shadow-md" />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
                className="sr-only"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliases for clean backward-compatibility with App.tsx
export const NewJournalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, color: string, theme: JournalTheme, coverImage?: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  return (
    <NotebookCoverModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={(title, color, theme, coverImage) => onCreate(title, color, theme, coverImage)}
      initialTitle="notebook 22"
      initialColor="#cf6748"
      isEditMode={false}
    />
  );
};

export const EditCoverModal: React.FC<{
  journal: Journal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (journalId: string, title: string, color: string, theme: JournalTheme, coverImage?: string) => void;
}> = ({ journal, isOpen, onClose, onSave }) => {
  if (!journal) return null;
  return (
    <NotebookCoverModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={(title, color, theme, coverImage) =>
        onSave(journal.id, title, color, theme, coverImage)
      }
      initialTitle={journal.title}
      initialColor={journal.color}
      initialTheme={journal.theme}
      initialCoverImage={journal.coverImage}
      isEditMode={true}
    />
  );
};

// 3. Settings Modal
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">تنظیمات و شخصی‌سازی پلنر ⚙️</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Animation Styles */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-slate-800">سبک انیمیشن تعویض روز و ورق زدن:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'flip', name: '📖 ورق زدن سه‌بعدی کتاب', desc: 'شبیه‌سازی باز شدن برگه‌ها' },
              { id: 'slide', name: '↔️ اسلاید افقی نرم', desc: 'حرکت روان به طرفین' },
              { id: 'fade', name: '✨ محو شدن و ظاهر شدن', desc: 'مینیمال و آرام' },
              { id: 'none', name: '⚡ آنی (بدون انیمیشن)', desc: 'بسیار سریع' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    animationStyle: anim.id as AppSettings['animationStyle'],
                  })
                }
                className={`flex flex-col gap-0.5 p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  settings.animationStyle === anim.id
                    ? 'border-[#ff6438] bg-orange-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold text-slate-900">{anim.name}</span>
                <span className="text-[10px] text-slate-400">{anim.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task Rollover */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-800">انتقال خودکار کارهای انجام‌نشده (Rollover)</span>
            <span className="text-[11px] text-slate-500">
              کارهای تیک‌نخورده روز قبل به روز جدید منتقل شوند.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoRolloverTasks}
              onChange={(e) =>
                onUpdateSettings({ ...settings, autoRolloverTasks: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Sound Effects */}
        <div className="flex flex-col gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-800">افکت‌های صوتی تعاملی</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => {
                  sound.enabled = e.target.checked;
                  onUpdateSettings({ ...settings, soundEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {settings.soundEnabled && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => sound.playTick(true)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 cursor-pointer"
              >
                تست صدای تیک
              </button>
              <button
                type="button"
                onClick={() => sound.playStar()}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 cursor-pointer"
              >
                تست صدای ستاره ⭐
              </button>
              <button
                type="button"
                onClick={() => sound.playSwoosh()}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 cursor-pointer"
              >
                تست ورق زدن کاغذ
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            بستن و ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Markdown Export Modal
interface MarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  filename: string;
}

export const MarkdownModal: React.FC<MarkdownModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    sound.playTick(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playAdd();
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-5 max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">خروجی یادداشت روزانه (Markdown .md) 📝</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          این فرمت کاملاً ساختاریافته است و می‌توانید آن را مستقیماً در Obsidian، Notion، Logseq یا VS Code ایمپورت کنید.
        </p>

        <textarea
          readOnly
          value={markdownContent}
          className="w-full flex-1 min-h-[260px] bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 outline-none leading-relaxed resize-none"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleDownload}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Download size={14} />
            <span>دانلود فایل .md</span>
          </button>

          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'کپی شد!' : 'کپی در کلیپ‌بورد'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Backup & Restore Modal
interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: Journal[];
  onImportJournals: (journals: Journal[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  journals,
  onImportJournals,
}) => {
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleExportJson = () => {
    sound.playAdd();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(journals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `planner-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          onImportJournals(parsed);
          sound.playCelebration();
          onClose();
        } else {
          setImportError('فرمت فایل پشتیبان معتبر نیست.');
        }
      } catch {
        setImportError('خطا در خواندن فایل JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">پشتیبان‌گیری و بازیابی اطلاعات</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          تمام ژورنال‌ها و برگه‌های ثبت‌شده شما در حافظه محلی ذخیره می‌شوند. می‌توانید یک نسخه پشتیبان JSON دانلود کنید یا اطلاعات را به دستگاه دیگری منتقل کنید.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleExportJson}
            className="w-full bg-[#ff6438] hover:bg-[#f05427] text-white py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Download size={16} />
            <span>دانلود فایل پشتیبان (JSON)</span>
          </button>

          <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-dashed border-slate-300">
            <Upload size={16} />
            <span>بازیابی از فایل JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importError && (
          <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
            ⚠️ {importError}
          </p>
        )}
      </div>
    </div>
  );
};
