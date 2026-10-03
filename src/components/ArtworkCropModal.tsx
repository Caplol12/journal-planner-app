import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';
import { Crop, ZoomIn, ZoomOut, Upload, Check, RotateCcw, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ArtworkCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string; // e.g. "تصویر دختر وسط قالب"
  currentImageUrl?: string;
  onApplyCrop: (croppedDataUrl: string) => void;
  onRemoveCrop?: () => void;
  aspectRatio?: number; // width / height, e.g. 1.15
}

export const ArtworkCropModal: React.FC<ArtworkCropModalProps> = ({
  isOpen,
  onClose,
  targetTitle,
  currentImageUrl,
  onApplyCrop,
  onRemoveCrop,
  aspectRatio = 1.15,
}) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // When modal opens, initialize with current custom image if any
  useEffect(() => {
    if (isOpen) {
      if (currentImageUrl) {
        setSourceImage(currentImageUrl);
      }
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, currentImageUrl]);

  // Load image object whenever sourceImage changes
  useEffect(() => {
    if (!sourceImage) {
      imageObjRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      drawPreview();
    };
    img.src = sourceImage;
  }, [sourceImage]);

  // Redraw when zoom or pan changes
  useEffect(() => {
    drawPreview();
  }, [zoom, pan]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Background paper tint
    ctx.fillStyle = '#faf7f2';
    ctx.fillRect(0, 0, cw, ch);

    // Calculate scaled dimensions to cover canvas
    const imgAspect = img.width / img.height;
    const canvasAspect = cw / ch;

    let baseW = cw;
    let baseH = ch;

    if (imgAspect > canvasAspect) {
      baseH = ch;
      baseW = ch * imgAspect;
    } else {
      baseW = cw;
      baseH = cw / imgAspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;

    const drawX = (cw - drawW) / 2 + pan.x;
    const drawY = (ch - drawH) / 2 + pan.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playAdd();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSourceImage(dataUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Mouse / Touch Dragging for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sourceImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    if (!sourceImage || !canvasRef.current) return;
    sound.playStar();

    // Export high-res result from the canvas
    const croppedDataUrl = canvasRef.current.toDataURL('image/png', 0.95);
    onApplyCrop(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="bg-[#faf7f2] border-2 border-[#d5c5b5] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl flex flex-col gap-4 font-sans select-none text-[#2c241e]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5dcd3] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e4ece2] text-[#335c3c] flex items-center justify-center shadow-2xs">
              <Crop size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1c140e]">
                برش و جاگذاری {targetTitle}
              </h3>
              <p className="text-[11px] text-[#78614f]">
                عکس کامل قالب را انتخاب کنید و بخش مورد نظر را با جابجایی و زوم برش بزنید.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 border border-[#d5c5b5] flex items-center justify-center text-neutral-500 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Upload Button or Change Image */}
        <div className="flex items-center justify-between gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-white hover:bg-[#f6eee3] text-[#4a3525] border-2 border-dashed border-[#bda895] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Upload size={14} />
            <span>{sourceImage ? 'انتخاب تصویر دیگر از دستگاه' : 'آپلود عکس اصلی قالب از دستگاه'}</span>
          </button>

          {currentImageUrl && onRemoveCrop && (
            <button
              type="button"
              onClick={() => {
                sound.playTick(false);
                onRemoveCrop();
                onClose();
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="بازگشت به طراحی وکتور اصلی"
            >
              <RotateCcw size={13} />
              <span>بازنشانی</span>
            </button>
          )}
        </div>

        {/* Canvas Workspace */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative w-full aspect-[4/3] max-w-[380px] bg-[#ede3d5] rounded-2xl border-2 border-[#bfae9e] overflow-hidden shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {sourceImage ? (
              <canvas
                ref={canvasRef}
                width={500}
                height={Math.round(500 / aspectRatio)}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-6 text-center cursor-pointer text-[#7a6553] hover:text-[#3e5f44] transition-colors"
              >
                <ImageIcon size={40} strokeWidth={1.5} className="opacity-70 animate-pulse" />
                <span className="text-xs font-bold">برای انتخاب عکس قالب کلیک کنید</span>
                <span className="text-[10px] text-[#9a8573]">
                  (فرمت‌های JPG، PNG یا WEBP پشتیبانی می‌شوند)
                </span>
              </div>
            )}

            {/* Subtle Crosshair Guide Overlay */}
            {sourceImage && (
              <div className="absolute inset-0 pointer-events-none border border-black/10 rounded-2xl flex items-center justify-center">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          {sourceImage && (
            <div className="w-full max-w-[380px] flex items-center justify-between gap-3 bg-white border border-[#d5c5b5] px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-[#634832] flex items-center gap-1">
                <ZoomIn size={13} /> بزرگ‌نمایی:
              </span>

              <input
                type="range"
                min="0.6"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#3e5f44] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded cursor-pointer"
              >
                ریست
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5dcd3]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            disabled={!sourceImage}
            onClick={handleApply}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              sourceImage
                ? 'bg-[#3e5f44] hover:bg-[#2c4731] text-white active:scale-95'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Check size={15} strokeWidth={2.5} />
            <span>تایید و قرار دادن در قالب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
