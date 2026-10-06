import React, { useState, useRef } from 'react';
import { CustomHtmlTemplate } from '../types';
import { sound } from '../utils/audio';
import { injectHtmlSyncScript, HTML_TEMPLATE_PRESETS } from '../utils/htmlTemplates';
import { Upload, X, Check, FileCode, Trash2, Eye, Maximize2, Sparkles } from 'lucide-react';
import { HtmlTemplateThumbnail } from './templates/HtmlTemplateThumbnail';

interface AddHtmlTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: CustomHtmlTemplate) => void;
}

export const AddHtmlTemplateModal: React.FC<AddHtmlTemplateModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('لطفاً یک فایل با پسوند .html انتخاب کنید.');
      return;
    }

    sound.playAdd();
    setFileName(file.name);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleResetFile = () => {
    sound.playTick(false);
    setFileName('');
    setHtmlContent('');
    setTitle('');
    setDesc('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent.trim()) {
      alert('لطفاً یک فایل HTML بارگذاری کنید.');
      return;
    }

    sound.playAdd();
    const newTemplate: CustomHtmlTemplate = {
      id: `custom_html_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim() || fileName.replace(/\.[^/.]+$/, '') || 'قالب اختصاصی',
      badge: 'HTML',
      desc: desc.trim() || 'قالب بارگذاری‌شده از فایل HTML',
      htmlContent: htmlContent.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveTemplate(newTemplate);
    handleResetFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        dir="rtl"
        className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Clean Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Upload size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">افزودن قالب جدید</h3>
              <p className="text-[11px] text-slate-400">فایل HTML قالب خود را انتخاب کنید</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".html,.htm"
            onChange={handleFileChange}
            className="hidden"
          />

          {!htmlContent ? (
            <>
            {/* Upload Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  برای بارگذاری فایل کلیک کنید یا فایل را اینجا بکشید
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  فرمت مجاز: تنها فایل‌های HTML (.html)
                </span>
              </div>
            </div>

            {/* Quick Presets Selection */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <span>یا یکی از الگوهای استاندارد آماده را انتخاب کنید:</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {HTML_TEMPLATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      sound.playAdd();
                      setHtmlContent(preset.html);
                      setTitle(preset.name);
                      setDesc(preset.desc);
                      setFileName(`${preset.id}.html`);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            </>
          ) : (
            /* Uploaded File Selected State */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileCode size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {fileName}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">فایل با موفقیت بارگذاری شد</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetFile}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="تغییر فایل"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  نام قالب:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان قالب..."
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  توضیح کوتاه (اختیاری):
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="توضیح مختصر درباره ساختار برگه..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              {/* Complete scaled preview thumbnail */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">
                    پیش‌نمایش کامل قالب:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Maximize2 size={12} />
                    <span>مشاهده تمام‌صفحه پیش‌نمایش</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative p-2 shadow-inner">
                  <HtmlTemplateThumbnail
                    htmlContent={htmlContent}
                    title="پیش‌نمایش قالب ورودی"
                    virtualWidth={900}
                    virtualHeight={1200}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>

            {htmlContent && (
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Check size={14} />
                <span>ذخیره و ثبت قالب</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Fullscreen Live Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl p-4 flex items-center justify-between mb-3 shadow-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">پیش‌نمایش کامل قالب ورودی</h4>
                <p className="text-[11px] text-slate-500">مشاهده دقیق چیدمان و تمام بخش‌های قالب قبل از ذخیره</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={15} />
              <span>بستن پیش‌نمایش</span>
            </button>
          </div>

          <div className="flex-1 w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-y-auto p-4 sm:p-6 border border-slate-200">
            <iframe
              srcDoc={injectHtmlSyncScript(htmlContent)}
              title="Full Uploaded Preview"
              className="w-full min-h-[850px] border-none"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  );
};
