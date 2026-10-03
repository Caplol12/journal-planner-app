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
      console.error(e);
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
      console.error(e);
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff6438] flex items-center justify-center shadow-xs">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">پنل مدیریت سیستم</h1>
              <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full">
                Supabase BaaS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              مدیریت و بارگذاری قالب‌های آنلاین، فایل‌های Storage و کنترل کاربران
            </p>
          </div>
        </div>

        {/* User / Auth Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            ← بازگشت به برنامه
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 pr-3 rounded-2xl">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isAdmin
                      ? 'bg-orange-100 text-[#ff6438]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isAdmin ? 'مدیر کل (Admin)' : 'کاربر عادی'}
                </span>
              </div>
              <button
                onClick={logout}
                title="خروج از حساب"
                className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#ff6438] hover:bg-[#f05427] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <LogIn size={15} />
              <span>ورود ادمین</span>
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-4 shrink-0">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'border-[#ff6438] text-[#ff6438]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers size={16} />
          <span>مدیریت و بارگذاری قالب‌ها</span>
          <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full">
            {toPersianDigits(templates.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#ff6438] text-[#ff6438]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>مدیریت کاربران و دسترسی‌ها</span>
          {profiles.length > 0 && (
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full">
              {toPersianDigits(profiles.length)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#ff6438] text-[#ff6438]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database size={16} />
          <span>تنظیمات اتصال Supabase</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto">
        {/* ===================== TAB: TEMPLATES ===================== */}
        {activeTab === 'templates' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div>
                <h2 className="text-base font-black text-slate-900">قالب‌های ثبت‌شده در سرور Supabase</h2>
                <p className="text-xs text-slate-500 mt-1">
                  فایل‌های قالب در باکت ذخیره‌سازی ابری (`templates`) بارگذاری شده و به صورت پویا در برنامه در دسترس قرار می‌گیرند.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={loadTemplates}
                  disabled={isLoadingTemplates}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تازه‌سازی لیست"
                >
                  <RefreshCw size={15} className={isLoadingTemplates ? 'animate-spin' : ''} />
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
                  className="bg-[#ff6438] hover:bg-[#f05427] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>آپلود و ثبت قالب جدید</span>
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            {isLoadingTemplates ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                <RefreshCw size={28} className="animate-spin text-[#ff6438]" />
                <span className="text-xs font-bold">در حال دریافت قالب‌ها از Supabase...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#ff6438] flex items-center justify-center">
                  <Upload size={30} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">هیچ قالبی در دیتابیس ابری ثبت نشده است</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                    می‌توانید با زدن دکمه «آپلود و ثبت قالب جدید»، فایل‌های HTML یا کدهای سفارشی خود را در باکت Storage ذخیره کنید تا به برنامه اضافه شوند.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-2 bg-[#ff6438] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:bg-[#f05427]"
                >
                  اولین قالب را اضافه کنید
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all gap-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 rounded-2xl bg-slate-50 border border-slate-100">
                            {tpl.icon || '📑'}
                          </span>
                          <div>
                            <h3 className="text-sm font-black text-slate-900">{tpl.title}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tpl.created_at ? formatJalaliShort(new Date(tpl.created_at)) : ''}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            tpl.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {tpl.is_active ? 'فعال در برنامه' : 'غیرفعال'}
                        </span>
                      </div>

                      {tpl.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}

                      {/* Storage path badge */}
                      {tpl.storage_path && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                          <FileCode size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{tpl.storage_path}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsPreviewOpen(tpl)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>پیش‌نمایش</span>
                        </button>

                        <button
                          onClick={() => handleToggleTemplateActive(tpl)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                        >
                          {tpl.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteTemplate(tpl)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="حذف قالب"
                      >
                        <Trash2 size={16} />
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
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center flex flex-col items-center gap-4">
                <AlertTriangle size={36} className="text-amber-600" />
                <h3 className="text-base font-black text-amber-900">دسترسی به بخش کاربران محدود است</h3>
                <p className="text-xs text-amber-700 max-w-md leading-relaxed">
                  تنها کاربرانی با نقش «مدیر کل» (Admin) امکان مشاهده و تغییر نقش کاربران را دارند. لطفاً با حساب ادمین وارد شوید.
                </p>
                {!user && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-700"
                  >
                    ورود به حساب ادمین
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">لیست کاربران سیستم</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      مشاهده کاربران عضو و مدیریت دسترسی ادمین
                    </p>
                  </div>
                  <button
                    onClick={loadUsers}
                    disabled={isLoadingProfiles}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} className={isLoadingProfiles ? 'animate-spin' : ''} />
                    <span>تازه‌سازی</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">کاربر</th>
                        <th className="py-3 px-4">ایمیل</th>
                        <th className="py-3 px-4">نقش</th>
                        <th className="py-3 px-4">تاریخ ثبت‌نام</th>
                        <th className="py-3 px-4 text-center">عملیات دسترسی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profiles.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {p.display_name || 'بدون نام'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600" dir="ltr">
                            {p.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                p.role === 'admin'
                                  ? 'bg-orange-100 text-[#ff6438]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.role === 'admin' ? 'مدیر کل (Admin)' : 'کاربر عادی'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {p.created_at ? formatJalaliShort(new Date(p.created_at)) : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              disabled={userRoleUpdatingId === p.id || p.id === user?.id}
                              onClick={() => handleToggleUserRole(p)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-40 ${
                                p.role === 'admin'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                                  : 'bg-orange-50 hover:bg-orange-100 text-[#ff6438]'
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-5 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Database size={18} className="text-[#ff6438]" />
                    <span>تنظیمات و احراز هویت Supabase</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    آدرس پروژه (Project URL) و کلید عمومی (anon key) را وارد کنید تا اتصال ذخیره‌سازی ابری و دیتابیس فعال شود.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Globe size={14} className="text-slate-400" />
                    <span>آدرس پروژه (Project URL)</span>
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-[#ff6438] focus:bg-white transition-all text-left"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Key size={14} className="text-slate-400" />
                    <span>کلید عمومی ناشناس (anon key)</span>
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono outline-none focus:border-[#ff6438] focus:bg-white transition-all text-left"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="bg-[#ff6438] hover:bg-[#f05427] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Check size={16} />
                  <span>ذخیره و آزمایش اتصال</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                  <span>{isTesting ? 'در حال تست...' : 'تست مجدد اتصال'}</span>
                </button>

                {isSupabaseConfigured() && (
                  <button
                    onClick={handleClearConfig}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold px-3 py-2 transition-colors cursor-pointer"
                  >
                    حذف تنظیمات ذخیره‌شده
                  </button>
                )}
              </div>

              {/* Diagnostic Test Result Box */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileCode size={18} className="text-[#ff6438]" />
                    <span>اسکریپت ساخت دیتابیس و باکت Storage در Supabase</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    کد زیر را کپی کرده و در بخش <b>SQL Editor</b> پنل Supabase دکمه <b>Run</b> را بزنید تا جداول و باکت به صورت خودکار ایجاد شوند.
                  </p>
                </div>

                <button
                  onClick={copySqlToClipboard}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'کپی شد!' : 'کپی کل اسکریپت SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] max-h-64 overflow-y-auto leading-relaxed text-left" dir="ltr">
                <pre>{sqlSchemaSnippet}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== UPLOAD MODAL ===================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff6438] flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">آپلود و انتشار قالب جدید</h3>
                  <span className="text-xs text-slate-500">ذخیره در Storage و همگام‌سازی ابری</span>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadTemplateSubmit} className="flex flex-col gap-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">عنوان قالب</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="مثلاً: پلنر هفتگی اولویت‌ها"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff6438] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">نشان / برچسب (Badge)</label>
                  <input
                    type="text"
                    value={uploadBadge}
                    onChange={(e) => setUploadBadge(e.target.value)}
                    placeholder="مثلاً: قالب اختصاصی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff6438] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">آیکون (ایموجی)</label>
                  <input
                    type="text"
                    value={uploadIcon}
                    onChange={(e) => setUploadIcon(e.target.value)}
                    placeholder="📑"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff6438] focus:bg-white text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">دسته‌بندی</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff6438] focus:bg-white cursor-pointer"
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
                <label className="text-xs font-bold text-slate-700">توضیحات کوتاه</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="توضیح کوتاه درباره کاربرد و نحوه تکمیل این برگه..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#ff6438] focus:bg-white"
                />
              </div>

              {/* Upload File Box */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">
                  انتخاب فایل HTML قالب (اختیاری در صورت نوشتن مستقیم کد)
                </label>
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex items-center justify-between">
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleHtmlFileChange}
                    className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ff6438] file:text-white hover:file:bg-[#f05427] cursor-pointer"
                  />
                  {htmlFile && (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ {htmlFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Raw HTML Code Editor / Paste Box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  محتوای کد HTML قالب
                </label>
                <textarea
                  value={uploadHtmlContent}
                  onChange={(e) => setUploadHtmlContent(e.target.value)}
                  rows={6}
                  dir="ltr"
                  placeholder="<!DOCTYPE html>..."
                  className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#ff6438]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTemplate}
                  className="bg-[#ff6438] hover:bg-[#f05427] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmittingTemplate ? 'در حال آپلود در Storage...' : 'ذخیره و انتشار قالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== PREVIEW MODAL ===================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{isPreviewOpen.icon}</span>
                <h3 className="text-sm font-black text-slate-900">{isPreviewOpen.title}</h3>
                <span className="text-[10px] bg-orange-100 text-[#ff6438] font-bold px-2 py-0.5 rounded-full">
                  {isPreviewOpen.badge}
                </span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden min-h-[450px]">
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
