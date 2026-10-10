import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Workspace,
  WorkspaceItem,
  ViewMode,
  DayPage,
  Journal,
  WorkspaceItemGridLayout,
  WorkspaceItemCanvasLayout,
  CanvasLink,
  CanvasGroup,
  CanvasNote,
} from '../../types';
import {
  loadStoredWorkspaces,
  saveStoredWorkspaces,
  getOrCreateDefaultWorkspace,
  createEmptyDayPage,
} from '../../utils/storage';
import { sound } from '../../utils/audio';
import { debounce } from '../../utils/debounce';

interface WorkspaceContextType {
  workspace: Workspace;
  journal: Journal;
  activeItem: WorkspaceItem | undefined;
  setMode: (mode: ViewMode) => void;
  addItem: (pageId: string, title?: string) => void;
  removeItem: (itemId: string) => void;
  setActiveItem: (itemId: string) => void;
  togglePin: (itemId: string) => void;
  toggleCollapse: (itemId: string) => void;
  reorderFeedItems: (fromIndex: number, toIndex: number) => void;
  updateItemGridLayout: (itemId: string, grid: WorkspaceItemGridLayout) => void;
  updateViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  updateItemCanvasLayout: (itemId: string, canvas: Partial<WorkspaceItemCanvasLayout>) => void;
  addCanvasLink: (fromItemId: string, toItemId: string, label?: string) => void;
  removeCanvasLink: (linkId: string) => void;
  addCanvasGroup: (title: string, color: string) => void;
  updateCanvasGroup: (groupId: string, updates: Partial<CanvasGroup>) => void;
  removeCanvasGroup: (groupId: string) => void;
  addCanvasNote: (note: { x: number; y: number; w: number; h: number; text: string; color: string }) => void;
  updateCanvasNote: (noteId: string, updates: Partial<CanvasNote>) => void;
  removeCanvasNote: (noteId: string) => void;
  autoLayoutCanvas: () => void;
  toggleFocusDim: () => void;
  setWorkspaceTitle: (title: string) => void;
  updatePageData: (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => void;
  onCloseWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

interface WorkspaceProviderProps {
  journal: Journal;
  initialPageId?: string;
  onUpdateJournalPage: (pageId: string, pageData: DayPage) => void;
  onCloseWorkspace: () => void;
  children: React.ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  journal,
  initialPageId,
  onUpdateJournalPage,
  onCloseWorkspace,
  children,
}) => {
  const [workspace, setWorkspace] = useState<Workspace>(() =>
    getOrCreateDefaultWorkspace(journal.id, initialPageId)
  );

  // Sync workspace if journal changes
  useEffect(() => {
    setWorkspace(getOrCreateDefaultWorkspace(journal.id, initialPageId));
  }, [journal.id, initialPageId]);

  // Debounced save of workspace layout (400ms)
  const debouncedSave = useMemo(
    () =>
      debounce((ws: Workspace) => {
        const all = loadStoredWorkspaces();
        all[ws.id] = ws;
        saveStoredWorkspaces(all);
      }, 400),
    []
  );

  useEffect(() => {
    debouncedSave(workspace);
  }, [workspace, debouncedSave]);

  const activeItem = useMemo(() => {
    return workspace.items.find((i: WorkspaceItem) => i.id === workspace.activeItemId) || workspace.items[0];
  }, [workspace.items, workspace.activeItemId]);

  const setMode = useCallback((mode: ViewMode) => {
    sound.playSwoosh();
    setWorkspace((prev: Workspace) => ({
      ...prev,
      mode,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addItem = useCallback((pageId: string, title?: string) => {
    sound.playAdd();
    setWorkspace((prev: Workspace) => {
      // Check if already in items
      const existing = prev.items.find((i: WorkspaceItem) => i.pageId === pageId);
      if (existing) {
        return {
          ...prev,
          activeItemId: existing.id,
        };
      }

      const newItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItems: WorkspaceItem[] = [
        ...prev.items,
        {
          id: newItemId,
          pageId,
          title,
          feed: { order: prev.items.length, collapsed: false, pinned: false },
          grid: {
            x: (prev.items.length % 2) * 6,
            y: Math.floor(prev.items.length / 2) * 4,
            w: 6,
            h: 4,
          },
          canvas: {
            x: 80 + (prev.items.length % 3) * 540,
            y: 80 + Math.floor(prev.items.length / 3) * 640,
            w: 520,
            h: 600,
            z: prev.items.length + 1,
          },
        },
      ];

      return {
        ...prev,
        items: newItems,
        activeItemId: newItemId,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    sound.playTrash();
    setWorkspace((prev: Workspace) => {
      const remaining = prev.items.filter((i: WorkspaceItem) => i.id !== itemId);
      return {
        ...prev,
        items: remaining,
        activeItemId: remaining.length > 0 ? remaining[0].id : undefined,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setActiveItem = useCallback((itemId: string) => {
    setWorkspace((prev: Workspace) => {
      if (prev.activeItemId === itemId) return prev;
      return {
        ...prev,
        activeItemId: itemId,
      };
    });
  }, []);

  const togglePin = useCallback((itemId: string) => {
    sound.playTick(true);
    setWorkspace((prev: Workspace) => ({
      ...prev,
      items: prev.items.map((it: WorkspaceItem) => {
        if (it.id !== itemId) return it;
        const currentFeed = it.feed || { order: 0, collapsed: false, pinned: false };
        return {
          ...it,
          feed: { ...currentFeed, pinned: !currentFeed.pinned },
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const toggleCollapse = useCallback((itemId: string) => {
    sound.playTick(true);
    setWorkspace((prev: Workspace) => ({
      ...prev,
      items: prev.items.map((it: WorkspaceItem) => {
        if (it.id !== itemId) return it;
        const currentFeed = it.feed || { order: 0, collapsed: false, pinned: false };
        return {
          ...it,
          feed: { ...currentFeed, collapsed: !currentFeed.collapsed },
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const reorderFeedItems = useCallback((fromIndex: number, toIndex: number) => {
    sound.playTick(true);
    setWorkspace((prev: Workspace) => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);

      // Reassign order
      const updated = items.map((it: WorkspaceItem, idx: number) => ({
        ...it,
        feed: { ...(it.feed || { collapsed: false, pinned: false }), order: idx },
      }));

      return {
        ...prev,
        items: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateItemGridLayout = useCallback((itemId: string, grid: WorkspaceItemGridLayout) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      items: prev.items.map((it: WorkspaceItem) => (it.id === itemId ? { ...it, grid } : it)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateViewport = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      viewport,
    }));
  }, []);

  const updateItemCanvasLayout = useCallback((itemId: string, canvas: Partial<WorkspaceItemCanvasLayout>) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      items: prev.items.map((it: WorkspaceItem) => {
        if (it.id !== itemId) return it;
        const currentCanvas: WorkspaceItemCanvasLayout = it.canvas || {
          x: 80,
          y: 80,
          w: 520,
          h: 600,
          z: 1,
        };
        return {
          ...it,
          canvas: { ...currentCanvas, ...canvas },
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addCanvasLink = useCallback((fromItemId: string, toItemId: string, label?: string) => {
    sound.playAdd();
    setWorkspace((prev: Workspace) => {
      if (prev.links.some((l: CanvasLink) => l.fromItemId === fromItemId && l.toItemId === toItemId)) {
        return prev;
      }
      const newLink: CanvasLink = {
        id: `link_${Date.now()}`,
        fromItemId,
        toItemId,
        label,
      };
      return {
        ...prev,
        links: [...prev.links, newLink],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeCanvasLink = useCallback((linkId: string) => {
    sound.playTrash();
    setWorkspace((prev: Workspace) => ({
      ...prev,
      links: prev.links.filter((l: CanvasLink) => l.id !== linkId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addCanvasGroup = useCallback((title: string, color: string) => {
    sound.playAdd();
    setWorkspace((prev: Workspace) => {
      const newGroup: CanvasGroup = {
        id: `group_${Date.now()}`,
        title,
        color,
      };
      return {
        ...prev,
        groups: [...prev.groups, newGroup],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateCanvasGroup = useCallback((groupId: string, updates: Partial<CanvasGroup>) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      groups: prev.groups.map((g: CanvasGroup) => (g.id === groupId ? { ...g, ...updates } : g)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeCanvasGroup = useCallback((groupId: string) => {
    sound.playTrash();
    setWorkspace((prev: Workspace) => ({
      ...prev,
      groups: prev.groups.filter((g: CanvasGroup) => g.id !== groupId),
      items: prev.items.map((it: WorkspaceItem) =>
        it.canvas?.groupId === groupId
          ? {
              ...it,
              canvas: { ...it.canvas, groupId: undefined },
            }
          : it
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addCanvasNote = useCallback(
    (note: { x: number; y: number; w: number; h: number; text: string; color: string }) => {
      sound.playAdd();
      setWorkspace((prev: Workspace) => {
        const newNote: CanvasNote = {
          id: `note_${Date.now()}`,
          ...note,
        };
        return {
          ...prev,
          notes: [...prev.notes, newNote],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  const updateCanvasNote = useCallback((noteId: string, updates: Partial<CanvasNote>) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      notes: prev.notes.map((n: CanvasNote) => (n.id === noteId ? { ...n, ...updates } : n)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeCanvasNote = useCallback((noteId: string) => {
    sound.playTrash();
    setWorkspace((prev: Workspace) => ({
      ...prev,
      notes: prev.notes.filter((n: CanvasNote) => n.id !== noteId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const autoLayoutCanvas = useCallback(() => {
    sound.playSwoosh();
    setWorkspace((prev: Workspace) => {
      const cols = Math.max(2, Math.ceil(Math.sqrt(prev.items.length)));
      const updated = prev.items.map((it: WorkspaceItem, idx: number) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        return {
          ...it,
          canvas: {
            x: 80 + col * 550,
            y: 80 + row * 650,
            w: 520,
            h: 600,
            z: idx + 1,
            groupId: it.canvas?.groupId,
          },
        };
      });
      return {
        ...prev,
        items: updated,
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const toggleFocusDim = useCallback(() => {
    sound.playTick(true);
    setWorkspace((prev: Workspace) => ({
      ...prev,
      focusDim: !prev.focusDim,
    }));
  }, []);

  const setWorkspaceTitle = useCallback((title: string) => {
    setWorkspace((prev: Workspace) => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update page data in journal (completely decoupled from workspace layout)
  const updatePageData = useCallback(
    (pageId: string, updater: DayPage | ((prev: DayPage) => DayPage)) => {
      const currentPage = journal.pages[pageId] || createEmptyDayPage();
      const updatedPage = typeof updater === 'function' ? updater(currentPage) : updater;
      onUpdateJournalPage(pageId, updatedPage);
    },
    [journal.pages, onUpdateJournalPage]
  );

  const value = useMemo(
    () => ({
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
      addCanvasGroup,
      updateCanvasGroup,
      removeCanvasGroup,
      addCanvasNote,
      updateCanvasNote,
      removeCanvasNote,
      autoLayoutCanvas,
      toggleFocusDim,
      setWorkspaceTitle,
      updatePageData,
      onCloseWorkspace,
    }),
    [
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
      addCanvasGroup,
      updateCanvasGroup,
      removeCanvasGroup,
      addCanvasNote,
      updateCanvasNote,
      removeCanvasNote,
      autoLayoutCanvas,
      toggleFocusDim,
      setWorkspaceTitle,
      updatePageData,
      onCloseWorkspace,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
