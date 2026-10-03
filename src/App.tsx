/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Journal, DayPage, AppSettings, JournalTheme, TemplateType } from './types';
import {
  loadStoredJournals,
  saveStoredJournals,
  loadStoredSettings,
  saveStoredSettings,
  exportJournalToMarkdown,
  createEmptyDayPage,
} from './utils/storage';
import { formatJalaliShort, getDateKey } from './utils/jalali';
import { sound } from './utils/audio';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PagesOverview } from './components/PagesOverview';
import { PlannerView } from './components/PlannerView';
import {
  NewJournalModal,
  EditCoverModal,
  SettingsModal,
  MarkdownModal,
  BackupModal,
} from './components/Modals';

export default function App() {
  const [journals, setJournals] = useState<Journal[]>(() => loadStoredJournals());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [currentView, setCurrentView] = useState<'dashboard' | 'pages-overview' | 'planner'>('dashboard');
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'all' | 'templates' | 'favorites'>('all');

  // Modal states
  const [isNewJournalOpen, setIsNewJournalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [markdownModalData, setMarkdownModalData] = useState<{
    isOpen: boolean;
    content: string;
    filename: string;
  }>({
    isOpen: false,
    content: '',
    filename: '',
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Sync settings with audio engine
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    sound.volume = settings.soundVolume;
    saveStoredSettings(settings);
  }, [settings]);

  // Save journals when state changes
  useEffect(() => {
    saveStoredJournals(journals);
  }, [journals]);

  const selectedJournal = journals.find((j) => j.id === selectedJournalId) || null;

  // Handlers
  const handleOpenJournal = (id: string) => {
    sound.playSwoosh();
    setSelectedJournalId(id);
    setCurrentView('pages-overview'); // First show the pages overview!
  };

  const handleOpenPage = (dateKey: string) => {
    sound.playSwoosh();
    setSelectedDateKey(dateKey);
    setCurrentView('planner');
  };

  const handleAddNewPage = (dateKey: string, templateType?: string, initialData?: DayPage) => {
    if (!selectedJournalId) return;

    const tType: TemplateType =
      templateType === 'template-4-celestial-todo'
        ? 'template-4-celestial-todo'
        : templateType === 'template-3-writing-plans'
        ? 'template-3-writing-plans'
        : templateType === 'template-2-one-big-thing'
        ? 'template-2-one-big-thing'
        : templateType === 'template-custom-html'
        ? 'template-custom-html'
        : 'template-1-green';

    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === selectedJournalId) {
          if (!j.pages[dateKey]) {
            return {
              ...j,
              pages: {
                ...j.pages,
                [dateKey]: initialData
                  ? JSON.parse(JSON.stringify(initialData))
                  : createEmptyDayPage(tType),
              },
            };
          }
        }
        return j;
      })
    );

    setSelectedDateKey(dateKey);
    setCurrentView('planner');
    showToast('برگه باز شد ✨');
  };

  const handleDeletePage = (dateKey: string) => {
    if (!selectedJournalId) return;

    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === selectedJournalId) {
          const updatedPages = { ...j.pages };
          delete updatedPages[dateKey];
          return {
            ...j,
            pages: updatedPages,
          };
        }
        return j;
      })
    );

    showToast('برگه حذف شد.');
  };

  const handleBackToPagesOverview = () => {
    setCurrentView('pages-overview');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedJournalId(null);
    setSelectedDateKey(null);
  };

  const handleToggleStar = (journalId: string) => {
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === journalId) {
          const starred = !j.starred;
          if (starred) sound.playStar();
          else sound.playTick(false);
          return { ...j, starred };
        }
        return j;
      })
    );
  };

  const handleDuplicate = (journalId: string) => {
    const src = journals.find((j) => j.id === journalId);
    if (!src) return;

    sound.playAdd();
    const cloned: Journal = {
      ...JSON.parse(JSON.stringify(src)),
      id: `journal_${Date.now()}`,
      title: `${src.title} (کپی)`,
      createdAt: formatJalaliShort(new Date()),
      starred: false,
    };

    setJournals((prev) => [cloned, ...prev]);
    showToast('ژورنال با موفقیت تکثیر شد! ✨');
  };

  const handleDelete = (journalId: string) => {
    if (journals.length <= 1) {
      showToast('حداقل یک ژورنال باید در سیستم باقی بماند.');
      return;
    }
    if (window.confirm('آیا از حذف این ژورنال و تمام برگه‌های داخل آن اطمینان دارید؟')) {
      sound.playTick(false);
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
      if (selectedJournalId === journalId) {
        handleBackToDashboard();
      }
      showToast('ژورنال حذف شد.');
    }
  };

  const handleCreateJournal = (
    title: string,
    color: string,
    theme: JournalTheme,
    coverImage?: string,
    initialPage?: DayPage
  ) => {
    sound.playAdd();
    const todayKey = getDateKey(new Date());
    const newJournal: Journal = {
      id: `journal_${Date.now()}`,
      title,
      color,
      theme,
      coverImage,
      starred: false,
      createdAt: formatJalaliShort(new Date()),
      pages: {
        [todayKey]: initialPage ? JSON.parse(JSON.stringify(initialPage)) : createEmptyDayPage(),
      },
    };

    setJournals((prev) => [newJournal, ...prev]);
    setIsNewJournalOpen(false);
    showToast('ژورنال جدید ساخته شد! 📘');
  };

  const handleSaveCover = (
    journalId: string,
    title: string,
    color: string,
    theme: JournalTheme,
    coverImage?: string
  ) => {
    sound.playTick(true);
    setJournals((prev) =>
      prev.map((j) => (j.id === journalId ? { ...j, title, color, theme, coverImage } : j))
    );
    setEditingJournal(null);
    showToast('مشخصات ژورنال ویرایش شد.');
  };

  const handleAddSheetTemplateToJournal = (
    journalId: string,
    sheetData: DayPage,
    sheetTitle: string,
    customDateKey?: string
  ) => {
    sound.playAdd();
    const todayKey = getDateKey(new Date());
    let targetKey = customDateKey || todayKey;
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === journalId) {
          let chosenKey = targetKey;
          if (!customDateKey && j.pages[chosenKey]) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            chosenKey = getDateKey(d);
          }
          targetKey = chosenKey;
          return {
            ...j,
            pages: {
              ...j.pages,
              [chosenKey]: JSON.parse(JSON.stringify(sheetData)),
            },
          };
        }
        return j;
      })
    );
    setSelectedJournalId(journalId);
    setSelectedDateKey(targetKey);
    setCurrentView('planner');
    showToast(`برگه «${sheetTitle}» به ژورنال اضافه شد ✨`);
  };

  const handleUpdateJournalPage = (dateKey: string, pageData: DayPage) => {
    if (!selectedJournalId) return;

    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === selectedJournalId) {
          return {
            ...j,
            pages: {
              ...j.pages,
              [dateKey]: pageData,
            },
          };
        }
        return j;
      })
    );
  };

  const handleOpenMarkdownModal = (date: Date, pageData: DayPage) => {
    if (!selectedJournal) return;
    sound.playAdd();
    const content = exportJournalToMarkdown(selectedJournal, date, pageData);
    const filename = `planner-${selectedJournal.title}-${getDateKey(date)}.md`;
    setMarkdownModalData({
      isOpen: true,
      content,
      filename,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-800 flex flex-col antialiased">
      {/* 3-Tier Navigation View Routing */}
      {currentView === 'planner' && selectedJournal ? (
        <PlannerView
          journal={selectedJournal}
          initialDateKey={selectedDateKey || undefined}
          onBackToPagesOverview={handleBackToPagesOverview}
          onBackToDashboard={handleBackToDashboard}
          onUpdateJournalPage={handleUpdateJournalPage}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMarkdownModal={handleOpenMarkdownModal}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      ) : currentView === 'pages-overview' && selectedJournal ? (
        <PagesOverview
          journal={selectedJournal}
          onBackToDashboard={handleBackToDashboard}
          onOpenPage={handleOpenPage}
          onAddNewPage={handleAddNewPage}
          onDeletePage={handleDeletePage}
          onEditCover={() => setEditingJournal(selectedJournal)}
        />
      ) : (
        <div className="flex min-h-screen w-full">
          {/* Main Dashboard Layout */}
          <Dashboard
            journals={journals}
            currentTab={currentTab}
            onOpenJournal={handleOpenJournal}
            onEditCover={(id) => {
              const target = journals.find((j) => j.id === id);
              if (target) setEditingJournal(target);
            }}
            onToggleStar={handleToggleStar}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCreateFromTemplate={(title, color, templateType) => {
              const initialPage = createEmptyDayPage(
                templateType === 'template-4-celestial-todo'
                  ? 'template-4-celestial-todo'
                  : templateType === 'template-3-writing-plans'
                  ? 'template-3-writing-plans'
                  : templateType === 'template-2-one-big-thing'
                  ? 'template-2-one-big-thing'
                  : 'template-1-green'
              );
              handleCreateJournal(title, color, 'midnight', undefined, initialPage);
            }}
            onAddSheetTemplateToJournal={handleAddSheetTemplateToJournal}
            onCreateJournalWithTemplate={(title, color, pageData) => {
              handleCreateJournal(title, color, 'midnight', undefined, pageData);
            }}
          />

          {/* Right Sidebar in RTL */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onNewJournal={() => setIsNewJournalOpen(true)}
            journalCount={journals.length}
            starredCount={journals.filter((j) => j.starred).length}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenBackup={() => setIsBackupOpen(true)}
          />
        </div>
      )}

      {/* Modals */}
      <NewJournalModal
        isOpen={isNewJournalOpen}
        onClose={() => setIsNewJournalOpen(false)}
        onCreate={handleCreateJournal}
      />

      <EditCoverModal
        journal={editingJournal}
        isOpen={Boolean(editingJournal)}
        onClose={() => setEditingJournal(null)}
        onSave={handleSaveCover}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <MarkdownModal
        isOpen={markdownModalData.isOpen}
        onClose={() => setMarkdownModalData((prev) => ({ ...prev, isOpen: false }))}
        markdownContent={markdownModalData.content}
        filename={markdownModalData.filename}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        journals={journals}
        onImportJournals={(imported) => {
          setJournals(imported);
          showToast('اطلاعات با موفقیت بازیابی شد! 🎉');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
