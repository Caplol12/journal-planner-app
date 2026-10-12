import React, { useState, useEffect } from 'react';
import {
  Shield,
  Upload,
  Users,
  Database,
  Layers,
  Check,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  LogOut,
  LogIn,
  Key,
  Globe,
  FileCode,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
} from '../../utils/supabase';
import {
  CloudTemplate,
  fetchCloudTemplates,
  createCloudTemplate,
  updateCloudTemplate,
  deleteCloudTemplate,
} from '../../utils/supabaseTemplates';
import {
  UserProfile,
  getAllProfiles,
  updateUserRole,
} from '../../utils/supabaseAuth';
import { toPersianDigits, formatJalaliShort } from '../../utils/jalali';
import { sound } from '../../utils/audio';
import { AuthModal } from './AuthModal';

export const AdminPanel: React.FC<{ onBackToApp: () => void }> = ({ onBackToApp }) => {
  const { user, profile, isAdmin, logout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'users' | 'settings'>('templates');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Supabase Settings state
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseCredentials().anonKey);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    hasStorage?: boolean;
    hasTables?: boolean;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Cloud Templates state
  const [templates, setTemplates] = useState<CloudTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<CloudTemplate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadBadge, setUploadBadge] = useState('قالب اختصاصی');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadIcon, setUploadIcon] = useState('📝');
  const [uploadCategory, setUploadCategory] = useState('daily');
  const [uploadHtmlContent, setUploadHtmlContent] = useState('');
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Users State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [userRoleUpdatingId, setUserRoleUpdatingId] = useState<string | null>(null);

  // Load Data
  const loadTemplates = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingTemplates(true);
    try {
      const data = await fetchCloudTemplates();
      setTemplates(data);
    } catch (e) {
      console.warn('Could not load templates:', e);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadUsers = async () => {
    if (!isSupabaseConfigured() || !isAdmin) return;
    setIsLoadingProfiles(true);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (e) {
      console.warn('Could not load users:', e);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      saveCustomSupabaseConfig(supabaseUrl, supabaseKey);
      const res = await testSupabaseConnection();
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
        hasStorage: res.hasStorage,
        hasTables: res.hasTables,
      });
      if (res.success) {
        sound.playTick(true);
        loadTemplates();
        refreshProfile();
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    saveCustomSupabaseConfig(supabaseUrl, supabaseKey);
    sound.playTick(true);
    handleTestConnection();
  };

  const handleClearConfig = () => {
    clearCustomSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
    sound.playSwoosh();
  };

  // Handle template file pick
  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHtmlFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadHtmlContent((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleUploadTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadTitle.trim()) {
      setUploadError('لطفاً عنوان قالب را وارد کنید.');
      return;
    }

    if (!uploadHtmlContent.trim() && !htmlFile) {
      setUploadError('لطفاً فایل HTML یا محتوای کد قالب را قرار دهید.');
      return;
    }

    setIsSubmittingTemplate(true);
    try {
      await createCloudTemplate({
        title: uploadTitle,
        badge: uploadBadge,
        description: uploadDesc,
        icon: uploadIcon,
        category: uploadCategory,
        htmlContent: uploadHtmlContent,
        htmlFile: htmlFile || undefined,
        previewImage: coverFile || undefined,
      });

      sound.playAdd();
      setIsUploadModalOpen(false);
      // Reset form
      setUploadTitle('');
      setUploadDesc('');
      setUploadHtmlContent('');
      setHtmlFile(null);
      setCoverFile(null);
      loadTemplates();
    } catch (err: any) {
      setUploadError(err.message || 'خطا در آپلود قالب.');
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const handleToggleTemplateActive = async (template: CloudTemplate) => {
    try {
      await updateCloudTemplate(template.id, { is_active: !template.is_active });
      sound.playTick(true);
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, is_active: !t.is_active } : t))
      );
    } catch (e: any) {
      alert(`خطا در تغییر وضعیت: ${e.message}`);
    }
  };

  const handleDeleteTemplate = async (template: CloudTemplate) => {
    if (!window.confirm(`آیا از حذف قالب "${template.title}" اطمینان دارید؟`)) return;
    try {
      await deleteCloudTemplate(template.id, template.storage_path);
      sound.playSwoosh();
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (e: any) {
      alert(`خطا در حذف: ${e.message}`);
    }
  };

  const handleToggleUserRole = async (targetUser: UserProfile) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg =
      newRole === 'admin'
        ? `آیا می‌خواهید دسترسی مدیر کل (Admin) را به کاربر "${targetUser.email}" اعطا کنید؟`
        : `آیا می‌خواهید دسترسی ادمین کاربر "${targetUser.email}" را لغو کنید؟`;

    if (!window.confirm(confirmMsg)) return;

    setUserRoleUpdatingId(targetUser.id);
    try {
      await updateUserRole(targetUser.id, newRole);
      sound.playTick(true);
      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUser.id ? { ...p, role: newRole } : p))
      );
    } catch (e: any) {
      alert(`خطا در تغییر نقش کاربر: ${e.message}`);
    } finally {
      setUserRoleUpdatingId(null);
    }
  };

  const sqlSchemaSnippet = `-- ساخت باکت ذخیره‌سازی
insert into storage.buckets (id, name, public) values ('templates', 'templates', true) on conflict do nothing;
create policy "Public view" on storage.objects for select using (bucket_id = 'templates');
create policy "Auth upload" on storage.objects for insert with check (bucket_id = 'templates');

-- جدول پروفایل‌ها
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- جدول قالب‌ها
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  badge text default 'قالب ابری',
  description text,
  icon text default '📑',
  category text default 'daily',
  storage_path text,
  html_content text,
  preview_url text,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
alter table public.templates enable row level security;
create policy "Templates select" on public.templates for select using (is_active = true);
create policy "Templates admin all" on public.templates for all using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Profiles select" on public.profiles for select using (true);
create policy "Profiles update admin" on public.profiles for update using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- تریگر ثبت نام خودکار اولین کاربر به عنوان ادمین
create or replace function public.handle_new_user() returns trigger as $$
declare is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), case when is_first then 'admin' else 'user' end);
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Header */}
      <header className="bg-white dark:bg-[#1a1a19] border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Shield size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">پنل مدیریت سیستم</h1>
              <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 font-mono font-medium px-2 py-0.5 rounded-md">
                Supabase BaaS
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              مدیریت و بارگذاری قالب‌های آنلاین، فایل‌های Storage و کنترل کاربران
            </p>
          </div>
        </div>

        {/* User / Auth Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 rounded-xl transition-all cursor-pointer"
          >
            ← بازگشت به برنامه
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 p-1.5 pr-3 rounded-xl">
              <div className="text-right">
                <span className="block text-xs font-bold text-stone-900 dark:text-stone-100">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${
                    isAdmin
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {isAdmin ? 'مدیر کل (Admin)' : 'کاربر عادی'}
                </span>
              </div>
              <button
                onClick={logout}
                title="خروج از حساب"
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-rose-600 text-stone-500 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              <LogIn size={14} />
              <span>ورود ادمین</span>
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[#1a1a19] border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-6 flex items-center gap-2 sm:gap-4 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 py-3 px-3 text-xs transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'border-b-2 border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-bold'
              : 'border-b-2 border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
        >
          <Layers size={15} />
          <span>مدیریت و بارگذاری قالب‌ها</span>
          <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md">
            {toPersianDigits(templates.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-3 text-xs transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-b-2 border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-bold'
              : 'border-b-2 border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
        >
          <Users size={15} />
          <span>مدیریت کاربران و دسترسی‌ها</span>
          {profiles.length > 0 && (
            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md">
              {toPersianDigits(profiles.length)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-3 text-xs transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-b-2 border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-bold'
              : 'border-b-2 border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
          }`}
        >
          <Database size={15} />
          <span>تنظیمات اتصال Supabase</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
        {/* ===================== TAB: TEMPLATES ===================== */}
        {activeTab === 'templates' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1a1a19] p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xs">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">قالب‌های ثبت‌شده در سرور Supabase</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  فایل‌های قالب در باکت ذخیره‌سازی ابری (`templates`) بارگذاری شده و به صورت پویا در دسترس قرار می‌گیرند.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={loadTemplates}
                  disabled={isLoadingTemplates}
                  className="p-2 sm:px-3 sm:py-2 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200/60 dark:border-stone-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تازه‌سازی لیست"
                >
                  <RefreshCw size={14} className={isLoadingTemplates ? 'animate-spin' : ''} />
                  <span>تازه‌سازی</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    setIsUploadModalOpen(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>آپلود قالب جدید</span>
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            {isLoadingTemplates ? (
              <div className="flex flex-col items-center justify-center p-12 text-stone-400 gap-3">
                <RefreshCw size={24} className="animate-spin text-stone-600 dark:text-stone-300" />
                <span className="text-xs font-medium">در حال دریافت قالب‌ها از Supabase...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white dark:bg-[#1a1a19] rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8 sm:p-12 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">هیچ قالبی در دیتابیس ابری ثبت نشده است</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mt-1 leading-relaxed">
                    می‌توانید با زدن دکمه «آپلود قالب جدید»، فایل‌های HTML یا کدهای سفارشی خود را در باکت Storage ذخیره کنید.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all"
                >
                  اولین قالب را اضافه کنید
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white dark:bg-[#1a1a19] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all gap-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-2 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-700/60">
                            {tpl.icon || '📑'}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tpl.title}</h3>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {tpl.created_at ? formatJalaliShort(new Date(tpl.created_at)) : ''}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md ${
                            tpl.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {tpl.is_active ? 'فعال در برنامه' : 'غیرفعال'}
                        </span>
                      </div>

                      {tpl.description && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}

                      {/* Storage path badge */}
                      {tpl.storage_path && (
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 font-mono bg-stone-50 dark:bg-stone-850 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60 truncate">
                          <FileCode size={13} className="shrink-0 text-stone-400" />
                          <span className="truncate">{tpl.storage_path}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsPreviewOpen(tpl)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>پیش‌نمایش</span>
                        </button>

                        <button
                          onClick={() => handleToggleTemplateActive(tpl)}
                          className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          {tpl.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteTemplate(tpl)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="حذف قالب"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: USERS ===================== */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            {!isAdmin ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-4">
                <AlertTriangle size={32} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">دسترسی به بخش کاربران محدود است</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md leading-relaxed">
                  تنها کاربرانی با نقش «مدیر کل» (Admin) امکان مشاهده و تغییر نقش کاربران را دارند. لطفاً با حساب ادمین وارد شوید.
                </p>
                {!user && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    ورود به حساب ادمین
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a1a19] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-2xs">
                <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">لیست کاربران سیستم</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      مشاهده کاربران عضو و مدیریت دسترسی ادمین
                    </p>
                  </div>
                  <button
                    onClick={loadUsers}
                    disabled={isLoadingProfiles}
                    className="p-2 sm:px-3 sm:py-1.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl border border-stone-200/60 dark:border-stone-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className={isLoadingProfiles ? 'animate-spin' : ''} />
                    <span>تازه‌سازی</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800/80 text-stone-500 dark:text-stone-400 font-bold">
                      <tr>
                        <th className="py-3 px-4">کاربر</th>
                        <th className="py-3 px-4">ایمیل</th>
                        <th className="py-3 px-4">نقش</th>
                        <th className="py-3 px-4">تاریخ ثبت‌نام</th>
                        <th className="py-3 px-4 text-center">عملیات دسترسی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/70">
                      {profiles.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-850/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                            {p.display_name || 'بدون نام'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-400" dir="ltr">
                            {p.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-md font-semibold text-[10px] ${
                                p.role === 'admin'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              {p.role === 'admin' ? 'مدیر کل (Admin)' : 'کاربر عادی'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-400 font-mono">
                            {p.created_at ? formatJalaliShort(new Date(p.created_at)) : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              disabled={userRoleUpdatingId === p.id || p.id === user?.id}
                              onClick={() => handleToggleUserRole(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                                p.role === 'admin'
                                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60'
                                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700'
                              }`}
                            >
                              {p.role === 'admin' ? 'تبدیل به کاربر عادی' : 'ارتقا به مدیر کل'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6">
            {/* Supabase API Connection Card */}
            <div className="bg-white dark:bg-[#1a1a19] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-5 sm:p-6 flex flex-col gap-5 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Database size={16} className="text-stone-500 dark:text-stone-400" />
                    <span>تنظیمات و احراز هویت Supabase</span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    آدرس پروژه (Project URL) و کلید عمومی (anon key) را وارد کنید تا اتصال ذخیره‌سازی ابری و پایگاه‌داده فعال شود.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    {isSupabaseConfigured() ? 'پیکربندی شده' : 'نیازمند تنظیم'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Globe size={13} className="text-stone-400" />
                    <span>آدرس پروژه (Project URL)</span>
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    dir="ltr"
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-mono outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Key size={13} className="text-stone-400" />
                    <span>کلید عمومی ناشناس (anon key)</span>
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    dir="ltr"
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-mono outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleSaveConfig}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <Check size={14} />
                  <span>ذخیره و آزمایش اتصال</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                  <span>{isTesting ? 'در حال تست...' : 'تست مجدد اتصال'}</span>
                </button>

                {isSupabaseConfigured() && (
                  <button
                    onClick={handleClearConfig}
                    className="text-stone-400 hover:text-rose-600 text-xs font-medium px-2 py-1.5 transition-colors cursor-pointer"
                  >
                    حذف تنظیمات ذخیره‌شده
                  </button>
                )}
              </div>

              {/* Diagnostic Test Result Box */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>

                  {testResult.hasStorage !== undefined && (
                    <div className="flex items-center gap-4 text-[11px] font-mono mt-1 pt-2 border-t border-current/10">
                      <span>
                        باکت ذخیره‌سازی templates:{' '}
                        {testResult.hasStorage ? '✅ موجود است' : '❌ یافت نشد'}
                      </span>
                      <span>
                        جدول قالب‌ها:{' '}
                        {testResult.hasTables ? '✅ موجود است' : '❌ ایجاد نشده'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SQL Migration Schema & Instructions */}
            <div className="bg-white dark:bg-[#1a1a19] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FileCode size={16} className="text-stone-500 dark:text-stone-400" />
                    <span>اسکریپت ساخت دیتابیس و باکت Storage در Supabase</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    کد زیر را کپی کرده و در بخش <b>SQL Editor</b> پنل Supabase دکمه <b>Run</b> را بزنید تا جداول و باکت به صورت خودکار ایجاد شوند.
                  </p>
                </div>

                <button
                  onClick={copySqlToClipboard}
                  className="bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedSql ? 'کپی شد!' : 'کپی اسکریپت SQL'}</span>
                </button>
              </div>

              <div className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-[11px] max-h-64 overflow-y-auto leading-relaxed text-left border border-stone-800" dir="ltr">
                <pre>{sqlSchemaSnippet}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== UPLOAD MODAL ===================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a19] rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-xl border border-stone-200/80 dark:border-stone-800/80 flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center">
                  <Upload size={17} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">آپلود و انتشار قالب جدید</h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400">ذخیره در Storage و همگام‌سازی ابری</span>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadTemplateSubmit} className="flex flex-col gap-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">عنوان قالب</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="مثلاً: پلنر هفتگی اولویت‌ها"
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">نشان / برچسب (Badge)</label>
                  <input
                    type="text"
                    value={uploadBadge}
                    onChange={(e) => setUploadBadge(e.target.value)}
                    placeholder="مثلاً: قالب اختصاصی"
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">آیکون (ایموجی)</label>
                  <input
                    type="text"
                    value={uploadIcon}
                    onChange={(e) => setUploadIcon(e.target.value)}
                    placeholder="📑"
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">دسته‌بندی</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-stone-600 cursor-pointer"
                  >
                    <option value="daily">برنامه روزانه (Daily)</option>
                    <option value="weekly">برنامه هفتگی (Weekly)</option>
                    <option value="tracker">ردیاب و عادات (Tracker)</option>
                    <option value="study">مطالعه و پژوهش (Study)</option>
                    <option value="work">کاری و مدیریت پروژه (Work)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">توضیحات کوتاه</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="توضیح کوتاه درباره کاربرد و نحوه تکمیل این برگه..."
                  className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20"
                />
              </div>

              {/* Upload File Box */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  انتخاب فایل HTML قالب (اختیاری در صورت نوشتن مستقیم کد)
                </label>
                <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-3.5 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between">
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleHtmlFileChange}
                    className="text-xs text-stone-600 dark:text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-stone-100 dark:file:bg-stone-100 dark:file:text-stone-900 hover:file:bg-stone-800 cursor-pointer"
                  />
                  {htmlFile && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {htmlFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Raw HTML Code Editor / Paste Box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  محتوای کد HTML قالب
                </label>
                <textarea
                  value={uploadHtmlContent}
                  onChange={(e) => setUploadHtmlContent(e.target.value)}
                  rows={6}
                  dir="ltr"
                  placeholder="<!DOCTYPE html>..."
                  className="w-full bg-stone-900 text-stone-100 font-mono text-xs p-3 rounded-xl outline-none border border-stone-800 focus:border-stone-600"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTemplate}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingTemplate ? 'در حال آپلود...' : 'ذخیره و انتشار قالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== PREVIEW MODAL ===================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a19] rounded-2xl p-5 max-w-3xl w-full shadow-xl border border-stone-200/80 dark:border-stone-800/80 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{isPreviewOpen.icon}</span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{isPreviewOpen.title}</h3>
                <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-stone-700/60">
                  {isPreviewOpen.badge}
                </span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden min-h-[450px]">
              <iframe
                srcDoc={isPreviewOpen.html_content}
                title={isPreviewOpen.title}
                sandbox="allow-scripts"
                className="w-full h-full min-h-[450px] border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          loadTemplates();
          loadUsers();
        }}
      />
    </div>
  );
};
