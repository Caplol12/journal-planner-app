import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  StickyNote,
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
  Palette,
  Move,
  Map,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Compass,
} from 'lucide-react';
import {
  WorkspaceItem,
  DayPage,
  Journal,
  CanvasLink,
  CanvasNote,
  CanvasGroup,
} from '../../../types';
import { PageRenderer } from '../PageRenderer';
import { sound } from '../../../utils/audio';

interface CanvasModeProps {
  items: WorkspaceItem[];
  journal: Journal;
  activeItemId?: string;
  focusDim: boolean;
  viewport: { x: number; y: number; zoom: number };
  links: CanvasLink[];
  notes: CanvasNote[];
  groups: CanvasGroup[];
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  onUpdateCanvasLayout: (itemId: string, canvas: { x: number; y: number; w?: number; h?: number; z?: number }) => void;
  onAddLink: (fromId: string, toId: string, label?: string) => void;
  onRemoveLink: (linkId: string) => void;
  onAddNote: (note: { x: number; y: number; w: number; h: number; text: string; color: string }) => void;
  onUpdateNote: (noteId: string, updates: Partial<CanvasNote>) => void;
  onRemoveNote: (noteId: string) => void;
  onAutoLayout: () => void;
  onUpdatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onOpenAddDrawer: () => void;
}

const NOTE_COLORS = [
  { name: 'yellow', bg: '#fef08a', text: '#713f12', border: '#fde047' },
  { name: 'mint', bg: '#bbf7d0', text: '#14532d', border: '#86efac' },
  { name: 'rose', bg: '#fecdd3', text: '#881337', border: '#fda4af' },
  { name: 'sky', bg: '#bae6fd', text: '#0c4a6e', border: '#7dd3fc' },
  { name: 'lavender', bg: '#e9d5ff', text: '#581c87', border: '#d8b4fe' },
];

export const CanvasMode: React.FC<CanvasModeProps> = ({
  items,
  journal,
  activeItemId,
  focusDim,
  viewport,
  links,
  notes,
  groups,
  onSelectItem,
  onRemoveItem,
  onUpdateViewport,
  onUpdateCanvasLayout,
  onAddLink,
  onRemoveLink,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onAutoLayout,
  onUpdatePageData,
  onOpenAddDrawer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Collapsed state for cards on canvas
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Spacebar pan mode
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; initialVx: number; initialVy: number }>({
    clientX: 0,
    clientY: 0,
    initialVx: 0,
    initialVy: 0,
  });

  // Local live drag state to make dragging 60-120fps smooth with no lag
  const [activeDrag, setActiveDrag] = useState<{
    type: 'item' | 'note';
    id: string;
    currentX: number;
    currentY: number;
  } | null>(null);

  const dragMetaRef = useRef<{
    type: 'item' | 'note';
    id: string;
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Linking mode state
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);

  // Minimap visibility
  const [showMinimap, setShowMinimap] = useState(true);

  // Touch tracking for pinch-to-zoom
  const touchStateRef = useRef<{
    startDist: number;
    startZoom: number;
    startCenter: { x: number; y: number };
    startVx: number;
    startVy: number;
  } | null>(null);

  // Keep a ref to latest viewport to avoid stale closures in window listeners
  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Space key handling for easy pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !isSpacePressed &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable)
      ) {
        setIsSpacePressed(true);
      }
      if (e.key === 'Escape' && linkingFromId) {
        setLinkingFromId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, linkingFromId]);

  // Zoom anchored to a specific point in container coordinates
  const zoomAtPoint = useCallback(
    (pointerX: number, pointerY: number, newZoom: number) => {
      const clampedZoom = Math.min(2.5, Math.max(0.25, Number(newZoom.toFixed(2))));
      const currentV = viewportRef.current;
      const worldX = (pointerX - currentV.x) / currentV.zoom;
      const worldY = (pointerY - currentV.y) / currentV.zoom;
      const nextVx = pointerX - worldX * clampedZoom;
      const nextVy = pointerY - worldY * clampedZoom;
      onUpdateViewport({
        x: Math.round(nextVx),
        y: Math.round(nextVy),
        zoom: clampedZoom,
      });
    },
    [onUpdateViewport]
  );

  // Zoom in / out relative to viewport center
  const zoomByStep = useCallback(
    (factor: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const nextZoom = viewport.zoom * factor;
      zoomAtPoint(centerX, centerY, nextZoom);
    },
    [viewport.zoom, zoomAtPoint]
  );

  // Native non-passive wheel event listener to handle smooth zooming and panning reliably
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // If user is inside a scrollable card and NOT pressing Ctrl/Meta/Space, allow card scrolling!
      const scrollableInsideCard = (e.target as HTMLElement)?.closest('.canvas-card-scroll');
      if (scrollableInsideCard && !e.ctrlKey && !e.metaKey && !isSpacePressed) {
        // Normal card scroll: do not intercept
        return;
      }

      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // Zooming anchored to mouse cursor
        const zoomDelta = -e.deltaY * 0.003;
        const factor = Math.exp(zoomDelta);
        const nextZoom = viewportRef.current.zoom * factor;
        zoomAtPoint(mouseX, mouseY, nextZoom);
      } else {
        // Panning with scroll / trackpad
        const dx = e.deltaX;
        const dy = e.deltaY;
        const currentV = viewportRef.current;
        onUpdateViewport({
          ...currentV,
          x: Math.round(currentV.x - dx),
          y: Math.round(currentV.y - dy),
        });
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [isSpacePressed, zoomAtPoint, onUpdateViewport]);

  // Window pointer listeners for panning & dragging to guarantee zero stuck states
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.clientX;
        const dy = e.clientY - panStartRef.current.clientY;
        onUpdateViewport({
          ...viewportRef.current,
          x: Math.round(panStartRef.current.initialVx + dx),
          y: Math.round(panStartRef.current.initialVy + dy),
        });
        return;
      }

      if (dragMetaRef.current) {
        const currentZoom = viewportRef.current.zoom;
        const dx = (e.clientX - dragMetaRef.current.startClientX) / currentZoom;
        const dy = (e.clientY - dragMetaRef.current.startClientY) / currentZoom;
        const newX = Math.round(dragMetaRef.current.initialX + dx);
        const newY = Math.round(dragMetaRef.current.initialY + dy);

        setActiveDrag({
          type: dragMetaRef.current.type,
          id: dragMetaRef.current.id,
          currentX: newX,
          currentY: newY,
        });
      }
    };

    const handlePointerUp = () => {
      if (isPanning) {
        setIsPanning(false);
      }

      if (dragMetaRef.current && activeDrag) {
        const { type, id, currentX, currentY } = activeDrag;
        if (type === 'item') {
          onUpdateCanvasLayout(id, { x: currentX, y: currentY });
        } else if (type === 'note') {
          onUpdateNote(id, { x: currentX, y: currentY });
        }
      }

      dragMetaRef.current = null;
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isPanning, activeDrag, onUpdateViewport, onUpdateCanvasLayout, onUpdateNote]);

  // Start panning on background or with spacebar / middle click
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    // Middle click (button 1) or spacebar always pans
    const isMiddleClick = e.button === 1;
    const isSpacePan = isSpacePressed && e.button === 0;

    const clickedCard = (e.target as HTMLElement).closest('.canvas-card');
    const clickedNote = (e.target as HTMLElement).closest('.canvas-note');
    const clickedUi = (e.target as HTMLElement).closest('.canvas-ui');

    if (!isMiddleClick && !isSpacePan && (clickedCard || clickedNote || clickedUi)) {
      return;
    }

    if (e.button === 0 || isMiddleClick) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialVx: viewport.x,
        initialVy: viewport.y,
      };
    }
  };

  // Touch gestures for mobile/tablet (pan and 2-finger pinch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      touchStateRef.current = {
        startDist: dist,
        startZoom: viewport.zoom,
        startCenter: center,
        startVx: viewport.x,
        startVy: viewport.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current && containerRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchStateRef.current.startDist;
      const targetZoom = Math.min(2.5, Math.max(0.25, touchStateRef.current.startZoom * ratio));

      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = touchStateRef.current.startCenter.x - rect.left;
      const pointerY = touchStateRef.current.startCenter.y - rect.top;

      zoomAtPoint(pointerX, pointerY, targetZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current = null;
  };

  // Card drag start handler
  const handleCardDragStart = (e: React.PointerEvent, item: WorkspaceItem, currentX: number, currentY: number) => {
    if (e.button !== 0 || isSpacePressed) return;
    e.stopPropagation();
    onSelectItem(item.id);

    dragMetaRef.current = {
      type: 'item',
      id: item.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };

    setActiveDrag({
      type: 'item',
      id: item.id,
      currentX,
      currentY,
    });
  };

  // Note drag start handler
  const handleNoteDragStart = (e: React.PointerEvent, note: CanvasNote, currentX: number, currentY: number) => {
    if (e.button !== 0 || isSpacePressed) return;
    e.stopPropagation();

    dragMetaRef.current = {
      type: 'note',
      id: note.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };

    setActiveDrag({
      type: 'note',
      id: note.id,
      currentX,
      currentY,
    });
  };

  // Add a sticky note right in the visible area
  const handleAddStickyNote = () => {
    sound.playAdd();
    const colorObj = NOTE_COLORS[notes.length % NOTE_COLORS.length];
    const container = containerRef.current;
    const rect = container ? container.getBoundingClientRect() : { width: 900, height: 600 };
    // Center of current viewport in canvas space
    const centerCanvasX = (rect.width / 2 - viewport.x) / viewport.zoom - 110 + (Math.random() * 40 - 20);
    const centerCanvasY = (rect.height / 2 - viewport.y) / viewport.zoom - 90 + (Math.random() * 40 - 20);

    onAddNote({
      x: Math.round(centerCanvasX),
      y: Math.round(centerCanvasY),
      w: 220,
      h: 180,
      text: 'یادداشت جدید...',
      color: colorObj.bg,
    });
  };

  // Fit all items & notes to screen
  const handleFitAll = () => {
    sound.playTick(true);
    if (!containerRef.current || (items.length === 0 && notes.length === 0)) {
      onUpdateViewport({ x: 40, y: 40, zoom: 1 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    items.forEach((it, idx) => {
      const c = it.canvas || {
        x: 80 + (idx % 3) * 550,
        y: 80 + Math.floor(idx / 3) * 650,
        w: 520,
        h: 600,
      };
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + (c.w || 520));
      maxY = Math.max(maxY, c.y + (c.h || 600));
    });

    notes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    });

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 80;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const fitZoom = Math.min(1.2, Math.max(0.3, Math.min(scaleX, scaleY)));

    const nextVx = (rect.width - (maxX + minX) * fitZoom) / 2;
    const nextVy = (rect.height - (maxY + minY) * fitZoom) / 2;

    onUpdateViewport({
      x: Math.round(nextVx),
      y: Math.round(nextVy),
      zoom: Number(fitZoom.toFixed(2)),
    });
  };

  // Toggle card collapse
  const toggleCollapse = (itemId: string) => {
    sound.playTick(true);
    setCollapsedCards((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Item centers for drawing connection arrows
  const itemCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number }> = {};
    items.forEach((item, idx) => {
      const isDragging = activeDrag?.type === 'item' && activeDrag.id === item.id;
      const defaultLayout = {
        x: 80 + (idx % 3) * 550,
        y: 80 + Math.floor(idx / 3) * 650,
        w: 520,
        h: collapsedCards[item.id] ? 60 : 600,
      };
      const c = item.canvas || defaultLayout;
      const effectiveX = isDragging ? activeDrag.currentX : c.x;
      const effectiveY = isDragging ? activeDrag.currentY : c.y;
      const effectiveW = c.w || 520;
      const effectiveH = collapsedCards[item.id] ? 55 : c.h || 600;

      centers[item.id] = {
        x: effectiveX + effectiveW / 2,
        y: effectiveY + effectiveH / 2,
      };
    });
    return centers;
  }, [items, activeDrag, collapsedCards]);

  // Bounding box for minimap calculations
  const minimapBounds = useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = 1800;
    let maxY = 1400;

    items.forEach((it, idx) => {
      const c = it.canvas || {
        x: 80 + (idx % 3) * 550,
        y: 80 + Math.floor(idx / 3) * 650,
        w: 520,
        h: 600,
      };
      maxX = Math.max(maxX, c.x + 600);
      maxY = Math.max(maxY, c.y + 700);
    });

    notes.forEach((n) => {
      maxX = Math.max(maxX, n.x + 300);
      maxY = Math.max(maxY, n.y + 250);
    });

    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }, [items, notes]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    sound.playTick(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const fracX = clickX / rect.width;
    const fracY = clickY / rect.height;

    const targetCanvasX = minimapBounds.minX + fracX * minimapBounds.width;
    const targetCanvasY = minimapBounds.minY + fracY * minimapBounds.height;

    const container = containerRef.current;
    const cWidth = container ? container.clientWidth : 800;
    const cHeight = container ? container.clientHeight : 600;

    const targetVx = cWidth / 2 - targetCanvasX * viewport.zoom;
    const targetVy = cHeight / 2 - targetCanvasY * viewport.zoom;

    onUpdateViewport({
      ...viewport,
      x: Math.round(targetVx),
      y: Math.round(targetVy),
    });
  };

  const isInteracting = isPanning || activeDrag !== null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handleBackgroundPointerDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      dir="ltr"
      className={`relative w-full h-[calc(100vh-65px)] overflow-hidden select-none bg-[#f4f2eb] dark:bg-[#121211] ${
        isSpacePressed || isPanning
          ? isPanning
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-default'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle, currentColor 1.2px, transparent 1.2px)`,
        backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        color: 'rgba(130, 120, 110, 0.18)',
        touchAction: 'none',
      }}
    >
      {/* 
        Canvas Viewport Transformer
        Always anchored left-0 top-0 in LTR with transformOrigin: 0 0.
        Transitions are strictly disabled during drag/pan to prevent lag.
      */}
      <div
        className={`absolute top-0 left-0 ${
          isInteracting ? 'transition-none' : 'transition-transform duration-100 ease-out'
        }`}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: '8000px',
          height: '8000px',
        }}
      >
        {/* SVG Connective Links Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <marker
              id="canvas-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#d97706" />
            </marker>
          </defs>
          {links.map((link) => {
            const from = itemCenters[link.fromItemId];
            const to = itemCenters[link.toItemId];
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const cx1 = from.x + dx * 0.45;
            const cy1 = from.y;
            const cx2 = to.x - dx * 0.45;
            const cy2 = to.y;

            return (
              <g key={link.id} className="pointer-events-auto group">
                {/* Wider invisible stroke for easy clicking/hovering */}
                <path
                  d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-pointer"
                  onClick={() => onRemoveLink(link.id)}
                />
                <path
                  d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#canvas-arrow)"
                  className="transition-all hover:stroke-rose-600 hover:stroke-[4px] cursor-pointer"
                  onClick={() => onRemoveLink(link.id)}
                />
                {link.label && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 8}
                    textAnchor="middle"
                    fill="#78716c"
                    fontSize="11"
                    className="font-medium select-none bg-white px-1"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Sticky Notes Layer */}
        {notes.map((note) => {
          const isDragging = activeDrag?.type === 'note' && activeDrag.id === note.id;
          const currentX = isDragging ? activeDrag.currentX : note.x;
          const currentY = isDragging ? activeDrag.currentY : note.y;

          return (
            <div
              key={note.id}
              className={`canvas-note absolute p-3.5 rounded-2xl shadow-md border flex flex-col z-20 group select-text ${
                isDragging ? 'shadow-2xl ring-2 ring-amber-500 cursor-grabbing' : 'cursor-default'
              }`}
              style={{
                left: `${currentX}px`,
                top: `${currentY}px`,
                width: `${note.w}px`,
                minHeight: `${note.h}px`,
                backgroundColor: note.color,
                borderColor: 'rgba(0,0,0,0.12)',
              }}
            >
              <div
                onPointerDown={(e) => handleNoteDragStart(e, note, currentX, currentY)}
                className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-1">
                  <Move size={11} className="opacity-50" />
                  <span className="text-[10px] font-bold opacity-60">یادداشت</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNote(note.id);
                  }}
                  className="p-1 rounded-md text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
                  title="حذف یادداشت"
                >
                  <X size={12} />
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => onUpdateNote(note.id, { text: e.target.value })}
                dir="rtl"
                className="w-full flex-1 bg-transparent border-none outline-none resize-none text-xs leading-relaxed text-stone-800 font-medium placeholder:text-stone-500"
                placeholder="یادداشت خود را بنویسید..."
              />
            </div>
          );
        })}

        {/* Workspace Items (Daily Sheets & Templates) on Canvas */}
        {items.map((item, idx) => {
          const pageData = journal.pages[item.pageId];
          const defaultLayout = {
            x: 80 + (idx % 3) * 550,
            y: 80 + Math.floor(idx / 3) * 650,
            w: 520,
            h: 600,
            z: idx + 1,
          };
          const canvasData = item.canvas || defaultLayout;
          const isDragging = activeDrag?.type === 'item' && activeDrag.id === item.id;
          const currentX = isDragging ? activeDrag.currentX : canvasData.x;
          const currentY = isDragging ? activeDrag.currentY : canvasData.y;
          const isActive = activeItemId === item.id;
          const isDimmed = focusDim && activeItemId && !isActive;
          const isCollapsed = collapsedCards[item.id] || false;
          const isLinkingThis = linkingFromId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (linkingFromId && linkingFromId !== item.id) {
                  onAddLink(linkingFromId, item.id);
                  setLinkingFromId(null);
                } else if (!linkingFromId) {
                  onSelectItem(item.id);
                }
              }}
              dir="rtl"
              className={`canvas-card absolute transition-opacity duration-150 ${
                isDimmed ? 'opacity-40 hover:opacity-90' : 'opacity-100'
              }`}
              style={{
                left: `${currentX}px`,
                top: `${currentY}px`,
                width: isCollapsed ? '340px' : `${canvasData.w || 520}px`,
                zIndex: isDragging ? 50 : isActive ? 40 : canvasData.z || 20,
              }}
            >
              <div
                className={`w-full rounded-2xl shadow-lg border transition-all ${
                  isLinkingThis
                    ? 'ring-4 ring-amber-500 border-amber-500 shadow-amber-500/20 shadow-xl'
                    : isActive
                    ? 'ring-2 ring-amber-500/80 border-amber-400 dark:border-amber-600 shadow-xl'
                    : 'border-stone-300/80 dark:border-stone-800'
                } bg-white dark:bg-[#181816]`}
              >
                {/* Header Bar & Drag Handle */}
                <div
                  onPointerDown={(e) => handleCardDragStart(e, item, currentX, currentY)}
                  className={`px-3.5 py-2.5 bg-stone-100/95 dark:bg-stone-850/95 rounded-t-2xl border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 select-none cursor-grab active:cursor-grabbing ${
                    isCollapsed ? 'rounded-b-2xl border-b-0' : ''
                  }`}
                >
                  {/* Title & Template Badge */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Move size={14} className="text-stone-400 shrink-0" />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {item.title || item.pageId}
                    </span>
                    {pageData?.templateType && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0 hidden sm:inline">
                        {pageData.templateType.replace('template-', '')}
                      </span>
                    )}
                  </div>

                  {/* Actions (Link, Collapse, Remove) */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Link Card Button */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTick(true);
                        setLinkingFromId(linkingFromId === item.id ? null : item.id);
                      }}
                      className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        linkingFromId === item.id
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                      }`}
                      title={linkingFromId === item.id ? 'لغو اتصال' : 'اتصال با فلش به برگه دیگر'}
                    >
                      <LinkIcon size={13} />
                    </button>

                    {/* Collapse / Expand Button */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(item.id)}
                      className="p-1 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title={isCollapsed ? 'باز کردن محتوا' : 'جمع کردن برگه'}
                    >
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>

                    {/* Remove From Canvas Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="حذف از بوم"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Content Body: Scrollable, allows natural scrolling without moving canvas */}
                {!isCollapsed && (
                  <div
                    className={`canvas-card-scroll p-3.5 max-h-[680px] overflow-y-auto overscroll-contain ${
                      isInteracting ? 'pointer-events-none' : ''
                    }`}
                  >
                    {pageData ? (
                      <PageRenderer
                        pageId={item.pageId}
                        pageData={pageData}
                        journal={journal}
                        onUpdate={(updater) => onUpdatePageData(item.pageId, updater)}
                        compact
                      />
                    ) : (
                      <div className="p-8 text-center text-stone-400 text-xs">
                        برگه یافت نشد ({item.pageId})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty Canvas Friendly State */}
        {items.length === 0 && notes.length === 0 && (
          <div
            dir="rtl"
            className="absolute left-40 top-32 p-8 max-w-md bg-white/90 dark:bg-stone-850/90 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl text-center"
          >
            <Compass className="mx-auto text-amber-500 mb-3" size={36} />
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
              بوم بینهایت خالی است
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              برگه‌های ژورنال یا یادداشت‌های آزاد خود را اضافه کنید، آن‌ها را جابجا کنید و با فلش به یکدیگر پیوند دهید.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddDrawer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>+ افزودن برگه به بوم</span>
              </button>
              <button
                type="button"
                onClick={handleAddStickyNote}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <StickyNote size={14} />
                <span>+ یادداشت</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls Overlay (Bottom End) */}
      <div
        dir="rtl"
        className="canvas-ui absolute bottom-4 end-4 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-stone-850/95 backdrop-blur-md rounded-2xl border border-stone-200/80 dark:border-stone-700/80 shadow-lg z-40"
      >
        {/* Zoom In */}
        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            zoomByStep(1.15);
          }}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          title="بزرگ‌نمایی (Zoom In)"
        >
          <ZoomIn size={16} />
        </button>

        {/* Zoom Percentage */}
        <span className="text-[11px] font-mono px-1 font-bold text-stone-600 dark:text-stone-400 select-none">
          {Math.round(viewport.zoom * 100)}%
        </span>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            zoomByStep(0.85);
          }}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          title="کوچک‌نمایی (Zoom Out)"
        >
          <ZoomOut size={16} />
        </button>

        {/* Fit All Content Button */}
        <button
          type="button"
          onClick={handleFitAll}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
          title="جا دادن همه برگه‌ها در صفحه (Fit All)"
        >
          <Maximize size={14} />
          <span className="hidden sm:inline">تناسب</span>
        </button>

        {/* Reset 100% View */}
        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            onUpdateViewport({ x: 40, y: 40, zoom: 1 });
          }}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          title="بازنشانی ۱۰۰٪"
        >
          <RotateCcw size={15} />
        </button>

        {/* Toggle Minimap */}
        <button
          type="button"
          onClick={() => {
            sound.playTick(true);
            setShowMinimap(!showMinimap);
          }}
          className={`p-2 rounded-xl cursor-pointer transition-colors ${
            showMinimap
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400'
              : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title="نقشه کوچک بوم (Minimap)"
        >
          <Map size={16} />
        </button>

        <div className="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-1" />

        {/* Auto Layout */}
        <button
          type="button"
          onClick={onAutoLayout}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
          title="چیدمان خودکار منظم (Auto Layout)"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span className="hidden sm:inline">مرتب‌سازی</span>
        </button>

        {/* Add Sticky Note */}
        <button
          type="button"
          onClick={handleAddStickyNote}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold cursor-pointer transition-colors"
          title="افزودن یادداشت چسبان"
        >
          <StickyNote size={14} />
          <span className="hidden sm:inline">+ یادداشت</span>
        </button>

        {/* Add Sheet */}
        <button
          type="button"
          onClick={onOpenAddDrawer}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
          title="افزودن برگه به بوم"
        >
          <Plus size={14} />
          <span>+ برگه</span>
        </button>
      </div>

      {/* Interactive Minimap Overlay (Bottom Start) */}
      {showMinimap && (
        <div
          dir="rtl"
          className="canvas-ui absolute bottom-4 start-4 p-2 bg-white/95 dark:bg-stone-850/95 backdrop-blur-md rounded-2xl border border-stone-200/80 dark:border-stone-700/80 shadow-lg z-40 hidden md:flex flex-col gap-1 w-44"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 pb-1 border-b border-stone-100 dark:border-stone-800">
            <span>نقشه بوم</span>
            <span className="font-mono">{items.length} برگه</span>
          </div>
          <div
            onClick={handleMinimapClick}
            className="relative w-40 h-28 bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200/60 dark:border-stone-800 cursor-crosshair"
            title="کلیک برای پرش به موقعیت"
          >
            {/* Cards on minimap */}
            {items.map((item) => {
              const c = item.canvas || { x: 80, y: 80, w: 520, h: 600 };
              const mx = ((c.x - minimapBounds.minX) / minimapBounds.width) * 160;
              const my = ((c.y - minimapBounds.minY) / minimapBounds.height) * 112;
              const mw = Math.max(8, ((c.w || 520) / minimapBounds.width) * 160);
              const mh = Math.max(8, ((c.h || 600) / minimapBounds.height) * 112);
              const isAct = item.id === activeItemId;
              return (
                <div
                  key={item.id}
                  className={`absolute rounded-xs ${
                    isAct ? 'bg-amber-500 ring-1 ring-amber-400' : 'bg-stone-400 dark:bg-stone-600'
                  }`}
                  style={{
                    left: `${Math.min(150, Math.max(0, mx))}px`,
                    top: `${Math.min(100, Math.max(0, my))}px`,
                    width: `${mw}px`,
                    height: `${mh}px`,
                  }}
                />
              );
            })}

            {/* Viewport frame indicator */}
            <div
              className="absolute border-2 border-amber-600 bg-amber-500/15 rounded-xs pointer-events-none"
              style={{
                left: `${Math.min(
                  150,
                  Math.max(0, ((-viewport.x / viewport.zoom - minimapBounds.minX) / minimapBounds.width) * 160)
                )}px`,
                top: `${Math.min(
                  100,
                  Math.max(0, ((-viewport.y / viewport.zoom - minimapBounds.minY) / minimapBounds.height) * 112)
                )}px`,
                width: `${Math.min(
                  160,
                  Math.max(
                    16,
                    (((containerRef.current?.clientWidth || 1000) / viewport.zoom) / minimapBounds.width) * 160
                  )
                )}px`,
                height: `${Math.min(
                  112,
                  Math.max(
                    14,
                    (((containerRef.current?.clientHeight || 700) / viewport.zoom) / minimapBounds.height) * 112
                  )
                )}px`,
              }}
            />
          </div>
        </div>
      )}

      {/* Linking Mode Active Banner */}
      {linkingFromId && (
        <div
          dir="rtl"
          className="canvas-ui absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg text-xs font-bold flex items-center gap-2 z-50 animate-bounce"
        >
          <span>روی برگه مقصد کلیک کنید تا متصل شود</span>
          <button
            type="button"
            onClick={() => setLinkingFromId(null)}
            className="p-0.5 rounded-full hover:bg-amber-600 cursor-pointer"
            title="انصراف (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Helpful Hint banner (fades after interaction) */}
      <div
        dir="rtl"
        className="canvas-ui absolute top-3 end-4 pointer-events-none text-[11px] font-medium text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-850/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-200/50 dark:border-stone-800/50 hidden lg:flex items-center gap-2"
      >
        <span>کلید Space + ماوس برای حرکت روی بوم</span>
        <span>•</span>
        <span>چرخ ماوس برای بزرگ‌نمایی</span>
      </div>
    </div>
  );
};
