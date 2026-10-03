import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingStroke, DrawingPoint } from '../types';

interface DrawingCanvasOverlayProps {
  strokes: DrawingStroke[];
  onUpdateStrokes: (strokes: DrawingStroke[]) => void;
  isDrawingActive: boolean;
  currentTool: 'pen' | 'highlighter' | 'eraser';
  strokeColor: string;
  strokeSize: number;
}

export const DrawingCanvasOverlay: React.FC<DrawingCanvasOverlayProps> = ({
  strokes,
  onUpdateStrokes,
  isDrawingActive,
  currentTool,
  strokeColor,
  strokeSize,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const activePointsRef = useRef<DrawingPoint[]>([]);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    // Draw all completed strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.save();
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * 3.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else {
        // Standard Pen
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Smooth curve through points
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    });
  }, [strokes]);

  // Handle Resize and Retina Scaling
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    handleResize();
    const ro = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Re-draw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer position helper
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const point = getCoordinates(e);
    activePointsRef.current = [point];
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeSize * 3.5;
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize * 3.2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1, strokeSize / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingActive) return;
    e.preventDefault();

    const point = getCoordinates(e);
    activePointsRef.current.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = activePointsRef.current;
    if (points.length < 2) return;

    ctx.save();
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeSize * 3.5;
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize * 3.2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activePointsRef.current.length > 1) {
      const newStroke: DrawingStroke = {
        id: `str_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        points: [...activePointsRef.current],
        color: strokeColor,
        size: strokeSize,
        tool: currentTool,
      };
      onUpdateStrokes([...strokes, newStroke]);
    }
    activePointsRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-20 select-none ${
        isDrawingActive ? 'pointer-events-auto touch-none' : 'pointer-events-none'
      }`}
      style={{
        cursor: isDrawingActive
          ? currentTool === 'eraser'
            ? 'cell'
            : currentTool === 'highlighter'
            ? 'crosshair'
            : 'crosshair'
          : 'default',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        className="w-full h-full block"
      />
    </div>
  );
};
