import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { useWorkspace } from './WorkspaceProvider';
import { ModeSwitcher } from './ModeSwitcher';
import { AddPageDrawer } from './AddPageDrawer';
import { FeedMode } from './modes/FeedMode';
import { GridMode } from './modes/GridMode';
import { CanvasMode } from './modes/CanvasMode';
import { SplitMode } from './modes/SplitMode';
import { TabsMode } from './modes/TabsMode';
import { BookMode } from './modes/BookMode';
import { FloatingMode } from './modes/FloatingMode';
import { StackMode } from './modes/StackMode';
import { WorkspaceItem } from '../../types';
import { sound } from '../../utils/audio';

export const WorkspaceShell: React.FC = () => {
  const {
    workspace,
    journal,
    activeItem,
    setMode,
    addItem,
    removeItem,
    setActiveItem,
    togglePin,
    toggleCollapse,
    reorderFeedItems,
    updateItemGridLayout,
    updateViewport,
    updateItemCanvasLayout,
    addCanvasLink,
    removeCanvasLink,
    addCanvasNote,
    updateCanvasNote,
    removeCanvasNote,
    autoLayoutCanvas,
    toggleFocusDim,
    setWorkspaceTitle,
    updatePageData,
    onCloseWorkspace,
  } = useWorkspace();

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(workspace.title);

  const currentWorkspacePageIds = workspace.items.map((i: WorkspaceItem) => i.pageId);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      setWorkspaceTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const modeKeys: Record<string, import('../../types').ViewMode> = {
        '1': 'feed',
        '2': 'grid',
        '3': 'canvas',
        '4': 'split',
        '5': 'tabs',
        '6': 'book',
        '7': 'floating',
        '8': 'stack',
      };

      if (modeKeys[e.key]) {
        e.preventDefault();
        setMode(modeKeys[e.key]);
      } else if (e.key === 'Escape') {
        if (isAddDrawerOpen) {
          setIsAddDrawerOpen(false);
        } else if (isEditingTitle) {
          setIsEditingTitle(false);
        }
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFocusDim();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode, isAddDrawerOpen, isEditingTitle, toggleFocusDim]);

  const isEdgeToEdgeMode = workspace.mode === 'canvas' || workspace.mode === 'floating';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#f6f5f1] dark:bg-[#121211] flex flex-col text-stone-900 dark:text-stone-100 transition-colors duration-200"
    >
      {/* Top Workspace Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#181816]/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Right Section (in RTL): Back button + Workspace Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playSwoosh();
              onCloseWorkspace();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
            title="بازگشت به نمای تک‌برگه پلنر"
          >
            <ArrowRight size={14} />
            <span>خروج از فضای کار</span>
          </button>

          <div className="flex items-center gap-1.5">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="bg-stone-100 dark:bg-stone-800 text-xs font-bold px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 outline-none w-36"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTitleInput(workspace.title);
                  setIsEditingTitle(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:text-stone-500 cursor-pointer"
                title="ویرایش نام فضای کار"
              >
                <span>{workspace.title}</span>
                <Edit2 size={11} className="text-stone-400" />
              </button>
            )}

            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full border border-stone-200/60 dark:border-stone-700/60">
              {workspace.items.length} برگه
            </span>
          </div>
        </div>

        {/* Center Section: View Mode Switcher */}
        <div className="flex items-center">
          <ModeSwitcher currentMode={workspace.mode} onSelectMode={setMode} />
        </div>

        {/* Left Section (in RTL): Controls & Add Button */}
        <div className="flex items-center gap-2">
          {/* Focus Dim Toggle Button */}
          <button
            type="button"
            onClick={toggleFocusDim}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              workspace.focusDim
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-200/60 dark:border-stone-700/60 text-stone-600 dark:text-stone-300'
            }`}
            title={workspace.focusDim ? 'روشن کردن همه برگه‌ها' : 'تاریک کردن برگه‌های غیرفعال (Focus Dim)'}
          >
            {workspace.focusDim ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden md:inline">Focus Dim</span>
          </button>

          {/* Add Sheet Button */}
          <button
            type="button"
            onClick={() => {
              sound.playAdd();
              setIsAddDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ برگه جدید</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Mode Content View */}
      <main
        className={`flex-1 w-full flex flex-col ${
          isEdgeToEdgeMode ? 'max-w-none' : 'max-w-7xl mx-auto'
        }`}
      >
        {workspace.mode === 'grid' ? (
          <GridMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'canvas' ? (
          <CanvasMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            viewport={workspace.viewport || { x: 0, y: 0, zoom: 1 }}
            links={workspace.links || []}
            notes={workspace.notes || []}
            groups={workspace.groups || []}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdateViewport={updateViewport}
            onUpdateCanvasLayout={updateItemCanvasLayout}
            onAddLink={addCanvasLink}
            onRemoveLink={removeCanvasLink}
            onAddNote={addCanvasNote}
            onUpdateNote={updateCanvasNote}
            onRemoveNote={removeCanvasNote}
            onAutoLayout={autoLayoutCanvas}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'split' ? (
          <SplitMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'tabs' ? (
          <TabsMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'book' ? (
          <BookMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'floating' ? (
          <FloatingMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : workspace.mode === 'stack' ? (
          <StackMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        ) : (
          <FeedMode
            items={workspace.items}
            journal={journal}
            activeItemId={activeItem?.id}
            focusDim={workspace.focusDim}
            onSelectItem={setActiveItem}
            onRemoveItem={removeItem}
            onTogglePin={togglePin}
            onToggleCollapse={toggleCollapse}
            onReorder={reorderFeedItems}
            onUpdatePageData={updatePageData}
            onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          />
        )}
      </main>

      {/* Add Page Drawer */}
      <AddPageDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        journal={journal}
        currentWorkspacePageIds={currentWorkspacePageIds}
        onAddExistingPage={(pageId) => addItem(pageId)}
        onAddNewPageWithTemplate={(pageId, pageData, title) => {
          updatePageData(pageId, pageData);
          addItem(pageId, title);
        }}
      />
    </div>
  );
};
