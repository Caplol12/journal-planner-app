/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Journal, DayPage, AppSettings, JournalTheme, TemplateType } from './types';
import {
  loadStoredJournals,
  saveStoredJournals,
  loadStoredSettings,
  saveStoredSettings,
  exportJournalToMarkdown,
  createEmptyDayPage,
} from './utils/storage';
import { formatJalaliShort, getDateKey, toPersianDigits } from './utils/jalali';
import { sound } from './utils/audio';
import { debounce } from './utils/debounce';
import { useAuth } from './context/AuthContext';
import {
  fetchCloudJournals,
  saveCloudJournals,
  deleteCloudJournal,
} from './utils/supabaseJournals';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PagesOverview } from './components/PagesOverview';
import { PlannerView } from './components/PlannerView';
import { AdminPanel } from './components/admin/AdminPanel';
import { OrbitCalendar } from './components/calendar/OrbitCalendar';
import { UserRegistrationView } from './components/users/UserRegistrationView';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SettingsView } from './components/SettingsView';
import {
  NewJournalModal,
  EditCoverModal,
  SettingsModal,
  MarkdownModal,
  BackupModal,
} from './components/Modals';

export default function App() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>(() => loadStoredJournals());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [currentView, setCurrentView] = useState<'dashboard' | 'pages-overview' | 'planner' | 'admin' | 'calendar' | 'users' | 'settings'>(() => {
    try {
      const saved = localStorage.getItem('planner_current_view');
      if (saved && ['dashboard', 'pages-overview', 'planner', 'admin', 'calendar', 'users', 'settings'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      localStorage.setItem('planner_current_view', currentView);
    } catch {}
  }, [currentView]);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'all' | 'templates' | 'favorites'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [calendarReturnView, setCalendarReturnView] = useState<'dashboard' | 'settings'>('settings');
  const [isWorkspaceOpenDirectly, setIsWorkspaceOpenDirectly] = useState(false);

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

  // Listen for storage quota or save errors
  useEffect(() => {
    const handleStorageError = (e: any) => {
      showToast(e.detail?.message || 'خطا در ذخیره‌سازی داده‌ها!');
    };
    window.addEventListener('planner_storage_error', handleStorageError);
    return () => window.removeEventListener('planner_storage_error', handleStorageError);
  }, []);

  // Sync settings with audio engine
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    sound.volume = settings.soundVolume;
    saveStoredSettings(settings);
  }, [settings]);

  // Sync language and layout direction (fa -> rtl, en -> ltr) with HTML document
  useEffect(() => {
    const lang = settings.language || 'fa';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // Sync color mode (light / dark / system) with DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    };

    if (settings.colorMode === 'dark') {
      applyTheme(true);
    } else if (settings.colorMode === 'light') {
      applyTheme(false);
    } else {
      // 'system'
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.colorMode]);

  const handleToggleColorMode = () => {
    const nextMode = settings.colorMode === 'dark' ? 'light' : 'dark';
    setSettings((prev) => ({ ...prev, colorMode: nextMode }));
    sound.playTick(true);
    showToast(nextMode === 'dark' ? 'حالت تاریک فعال شد 🌙' : 'حالت روشن فعال شد ☀️');
  };

  // Debounced save for local storage (500ms)
  const debouncedLocalSave = useMemo(
    () => debounce((data: Journal[]) => saveStoredJournals(data), 500),
    []
  );

  // Debounced save for cloud storage (1000ms)
  const debouncedCloudSave = useMemo(
    () =>
      debounce((data: Journal[]) => {
        saveCloudJournals(data);
      }, 1000),
    []
  );

  // Load cloud journals when user logs in
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    fetchCloudJournals().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('Could not sync cloud journals:', error);
      } else if (data && data.length > 0) {
        setJournals(data);
        saveStoredJournals(data);
        showToast('ژورنال‌های شما از سرور ابری همگام‌سازی شد ✨');
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save journals when state changes
  useEffect(() => {
    debouncedLocalSave(journals);
    if (user) {
      debouncedCloudSave(journals);
    }
  }, [journals, user, debouncedLocalSave, debouncedCloudSave]);

  const selectedJournal = journals.find((j) => j.id === selectedJournalId) || null;

  // Handlers
  const handleOpenJournal = (id: string) => {
    sound.playSwoosh();
    setSelectedJournalId(id);
    setCurrentView('pages-overview'); // First show the pages overview!
  };

  const handleOpenPage = (dateKey: string) => {
    sound.playSwoosh();
    setIsWorkspaceOpenDirectly(false);
    setSelectedDateKey(dateKey);
    setCurrentView('planner');
  };

  const handleAddNewPage = (dateKey: string, templateType?: string, initialData?: DayPage) => {
    if (!selectedJournalId) return;
    setIsWorkspaceOpenDirectly(false);

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
                  ? structuredClone(initialData)
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

  const handleOpenJournalWithPage = (journalId: string, dateKey: string) => {
    sound.playTick(true);
    setSelectedJournalId(journalId);
    setSelectedDateKey(dateKey);
    setCurrentView('planner');
  };

  const handleUpdateAnyJournalPage = (journalId: string, dateKey: string, pageData: DayPage) => {
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === journalId) {
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

  const handleBackToPagesOverview = () => {
    setCurrentView('pages-overview');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedJournalId(null);
    setSelectedDateKey(null);
  };

  const handleOpenCalendarDateInJournal = (dateKey: string) => {
    sound.playSwoosh();
    let targetJournal = selectedJournal;
    if (!targetJournal) {
      if (journals.length > 0) {
        targetJournal = journals[0];
        setSelectedJournalId(targetJournal.id);
      } else {
        const newId = Date.now().toString(36);
        const newJ: Journal = {
          id: newId,
          title: 'ژورنال کیهانی من',
          color: '#0d2244',
          theme: 'midnight',
          starred: false,
          createdAt: new Date().toISOString(),
          pages: {},
        };
        setJournals([newJ]);
        targetJournal = newJ;
        setSelectedJournalId(newId);
      }
    }

    if (!targetJournal.pages[dateKey]) {
      const pageData = createEmptyDayPage('template-4-celestial-todo');
      setJournals((prev) =>
        prev.map((j) => {
          if (j.id === targetJournal!.id) {
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
    }

    setSelectedDateKey(dateKey);
    setCurrentView('planner');
    showToast(`برگه تاریخ ${toPersianDigits(dateKey)} در پلنر باز شد ✨`);
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
      ...structuredClone(src),
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
      if (user) {
        deleteCloudJournal(journalId);
      }
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
        [todayKey]: initialPage ? structuredClone(initialPage) : createEmptyDayPage(),
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
              [chosenKey]: structuredClone(sheetData),
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
      {currentView === 'users' ? (
        <div className="flex min-h-screen w-full relative overflow-x-hidden">
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileTopBar
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onNewJournal={() => {
                setCurrentView('dashboard');
                setIsNewJournalOpen(true);
              }}
              isDarkMode={settings.colorMode === 'dark'}
              onToggleColorMode={handleToggleColorMode}
              title="STRATEGY"
            />
            <div className="flex-1 min-w-0 pb-20 lg:pb-0">
              <UserRegistrationView
                onBackToApp={handleBackToDashboard}
                onSelectUserToLogin={(userEmail) => {
                  showToast(`ورود به عنوان کاربر ${userEmail} انجام شد.`);
                  setCurrentView('dashboard');
                }}
              />
            </div>
          </div>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            journalCount={journals.length}
            starredCount={journals.filter((j) => j.starred).length}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenBackup={() => {
              setIsBackupOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => {
              setCurrentView('settings');
              setIsMobileMenuOpen(false);
            }}
            isSettingsActive={false}
            onOpenAdmin={() => {
              setCurrentView('admin');
              setIsMobileMenuOpen(false);
            }}
            isAdminActive={false}
            onOpenCalendar={() => {
              setCurrentView('calendar');
              setIsMobileMenuOpen(false);
            }}
            isCalendarActive={false}
            onOpenUsers={() => {
              setCurrentView('users');
              setIsMobileMenuOpen(false);
            }}
            isUsersActive={true}
            onToggleColorMode={handleToggleColorMode}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
          <MobileBottomNav
            currentTab={currentTab}
            isCalendarActive={false}
            isSettingsActive={false}
            language={settings.language}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
            }}
            onOpenCalendar={() => setCurrentView('calendar')}
            onOpenSettings={() => setCurrentView('settings')}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
            }}
          />
        </div>
      ) : currentView === 'calendar' ? (
        <OrbitCalendar
          onBackToApp={() => setCurrentView(calendarReturnView)}
          onOpenJournalDate={handleOpenCalendarDateInJournal}
          journals={journals}
        />
      ) : currentView === 'planner' && selectedJournal ? (
        <PlannerView
          journal={selectedJournal}
          initialDateKey={selectedDateKey || undefined}
          initialWorkspaceActive={isWorkspaceOpenDirectly}
          onBackToPagesOverview={handleBackToPagesOverview}
          onBackToDashboard={handleBackToDashboard}
          onUpdateJournalPage={handleUpdateJournalPage}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMarkdownModal={handleOpenMarkdownModal}
          settings={settings}
          onUpdateSettings={setSettings}
          onOpenCalendar={() => setCurrentView('calendar')}
        />
      ) : currentView === 'pages-overview' && selectedJournal ? (
        <PagesOverview
          journal={selectedJournal}
          onBackToDashboard={handleBackToDashboard}
          onOpenPage={handleOpenPage}
          onOpenWorkspace={() => {
            sound.playSwoosh();
            setIsWorkspaceOpenDirectly(true);
            setCurrentView('planner');
          }}
          onAddNewPage={handleAddNewPage}
          onDeletePage={handleDeletePage}
          onEditCover={() => setEditingJournal(selectedJournal)}
          colorMode={settings.colorMode}
          onToggleColorMode={handleToggleColorMode}
        />
      ) : currentView === 'admin' ? (
        <div className="flex min-h-screen w-full relative overflow-x-hidden">
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileTopBar
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onNewJournal={() => {
                setCurrentView('dashboard');
                setIsNewJournalOpen(true);
              }}
              isDarkMode={settings.colorMode === 'dark'}
              onToggleColorMode={handleToggleColorMode}
              title="STRATEGY"
            />
            <div className="flex-1 min-w-0 pb-20 lg:pb-0">
              <AdminPanel onBackToApp={() => setCurrentView('dashboard')} />
            </div>
          </div>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            journalCount={journals.length}
            starredCount={journals.filter((j) => j.starred).length}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenBackup={() => {
              setIsBackupOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => {
              setCurrentView('settings');
              setIsMobileMenuOpen(false);
            }}
            isSettingsActive={false}
            onOpenAdmin={() => {
              setCurrentView('admin');
              setIsMobileMenuOpen(false);
            }}
            isAdminActive={true}
            onOpenCalendar={() => {
              setCurrentView('calendar');
              setIsMobileMenuOpen(false);
            }}
            isCalendarActive={false}
            onOpenUsers={() => {
              setCurrentView('users');
              setIsMobileMenuOpen(false);
            }}
            isUsersActive={false}
            onToggleColorMode={handleToggleColorMode}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
          <MobileBottomNav
            currentTab={currentTab}
            isCalendarActive={false}
            isSettingsActive={false}
            language={settings.language}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
            }}
            onOpenCalendar={() => setCurrentView('calendar')}
            onOpenSettings={() => setCurrentView('settings')}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
            }}
          />
        </div>
      ) : currentView === 'settings' ? (
        <div className="flex min-h-screen w-full relative overflow-x-hidden">
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileTopBar
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onNewJournal={() => {
                setCurrentView('dashboard');
                setIsNewJournalOpen(true);
              }}
              isDarkMode={settings.colorMode === 'dark'}
              onToggleColorMode={handleToggleColorMode}
              title="STRATEGY"
            />
            <div className="flex-1 min-w-0 pb-20 lg:pb-0">
              <SettingsView
                settings={settings}
                onUpdateSettings={setSettings}
                journals={journals}
                onUpdateJournals={setJournals}
                onBackToDashboard={() => setCurrentView('dashboard')}
                onToggleColorMode={handleToggleColorMode}
                onOpenCalendar={() => {
                  setCalendarReturnView('settings');
                  setCurrentView('calendar');
                }}
              />
            </div>
          </div>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            journalCount={journals.length}
            starredCount={journals.filter((j) => j.starred).length}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenBackup={() => {
              setIsBackupOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => {
              setCurrentView('settings');
              setIsMobileMenuOpen(false);
            }}
            isSettingsActive={true}
            onOpenAdmin={() => {
              setCurrentView('admin');
              setIsMobileMenuOpen(false);
            }}
            isAdminActive={false}
            onOpenCalendar={() => {
              setCurrentView('calendar');
              setIsMobileMenuOpen(false);
            }}
            isCalendarActive={false}
            onOpenUsers={() => {
              setCurrentView('users');
              setIsMobileMenuOpen(false);
            }}
            isUsersActive={false}
            onToggleColorMode={handleToggleColorMode}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
          <MobileBottomNav
            currentTab={currentTab}
            isCalendarActive={false}
            isSettingsActive={true}
            language={settings.language}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
            }}
            onOpenCalendar={() => setCurrentView('calendar')}
            onOpenSettings={() => setCurrentView('settings')}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="flex min-h-screen w-full relative overflow-x-hidden">
          {/* Main Dashboard Layout */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileTopBar
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onNewJournal={() => {
                setCurrentView('dashboard');
                setIsNewJournalOpen(true);
              }}
              isDarkMode={settings.colorMode === 'dark'}
              onToggleColorMode={handleToggleColorMode}
              title="STRATEGY"
            />
            <div className="flex-1 min-w-0 pb-20 lg:pb-0">
              <Dashboard
                journals={journals}
                currentTab={currentTab}
                language={settings.language}
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
                colorMode={settings.colorMode}
                onToggleColorMode={handleToggleColorMode}
                onOpenUsers={() => setCurrentView('users')}
                onOpenJournalPage={handleOpenJournalWithPage}
                onUpdateJournalPage={handleUpdateAnyJournalPage}
              />
            </div>
          </div>

          {/* Right Sidebar in RTL (Desktop docked, Mobile drawer) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            onNewJournal={() => {
              setIsNewJournalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            journalCount={journals.length}
            starredCount={journals.filter((j) => j.starred).length}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenBackup={() => {
              setIsBackupOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => {
              setCurrentView('settings');
              setIsMobileMenuOpen(false);
            }}
            isSettingsActive={false}
            onOpenAdmin={() => {
              setCurrentView('admin');
              setIsMobileMenuOpen(false);
            }}
            isAdminActive={false}
            onOpenCalendar={() => {
              setCurrentView('calendar');
              setIsMobileMenuOpen(false);
            }}
            isCalendarActive={false}
            onOpenUsers={() => {
              setCurrentView('users');
              setIsMobileMenuOpen(false);
            }}
            isUsersActive={false}
            onToggleColorMode={handleToggleColorMode}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomNav
            currentTab={currentTab}
            isCalendarActive={false}
            isSettingsActive={false}
            language={settings.language}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setCurrentView('dashboard');
            }}
            onOpenSettings={() => setCurrentView('settings')}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNewJournal={() => {
              setCurrentView('dashboard');
              setIsNewJournalOpen(true);
            }}
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
