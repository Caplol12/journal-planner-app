import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  User as UserIcon,
  Trash2,
  Check,
  Search,
  ArrowRight,
  Mail,
  Copy,
  RefreshCw,
  Key,
  ShieldCheck,
} from 'lucide-react';
import {
  ManagedUser,
  ADMIN_EMAIL,
  getLocalRegisteredUsers,
  registerNewUser,
  deleteRegisteredUser,
} from '../../utils/userManagement';
import { formatJalaliShort, toPersianDigits } from '../../utils/jalali';
import { sound } from '../../utils/audio';

interface UserRegistrationViewProps {
  onBackToApp: () => void;
  onSelectUserToLogin?: (email: string) => void;
}

export const UserRegistrationView: React.FC<UserRegistrationViewProps> = ({
  onBackToApp,
  onSelectUserToLogin,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>(() => getLocalRegisteredUsers());
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Copied indicator
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Reload users from storage
  const reloadUsers = () => {
    setUsers(getLocalRegisteredUsers());
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormFeedback({ type: 'error', message: 'لطفاً یک نشانی ایمیل معتبر وارد کنید.' });
      return;
    }

    if (password && password.length < 6) {
      setFormFeedback({ type: 'error', message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setFormFeedback({ type: 'error', message: 'رمز عبور و تکرار آن یکسان نیستند.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // The database automatically checks the email and assigns the admin role internally
      const res = await registerNewUser({
        email: cleanEmail,
        displayName: name.trim() || cleanEmail.split('@')[0],
        password: password || '123456',
      });

      sound.playAdd();
      setFormFeedback({
        type: 'success',
        message: 'ثبت‌نام با موفقیت انجام شد و کاربر در پایگاه‌داده ذخیره گردید.',
      });

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      reloadUsers();
    } catch (err: any) {
      sound.playTick(false);
      setFormFeedback({
        type: 'error',
        message: err?.message || 'خطایی در ثبت کاربر رخ داد.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (user: ManagedUser) => {
    if (window.confirm(`آیا از حذف کاربر «${user.displayName}» با ایمیل ${user.email} اطمینان دارید؟`)) {
      try {
        sound.playSwoosh();
        const updated = deleteRegisteredUser(user.id);
        setUsers([...updated]);
      } catch (err: any) {
        alert(err?.message || 'خطایی در حذف کاربر رخ داد.');
      }
    }
  };

  const handleCopyEmail = (emailToCopy: string) => {
    navigator.clipboard.writeText(emailToCopy);
    setCopiedEmail(emailToCopy);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 max-w-[1360px] w-full mx-auto text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200/80 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت به برنامه"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowRight size={16} />
              <span className="hidden sm:inline">بازگشت</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 tracking-tight">
              <span>مدیریت و ثبت‌نام کاربران</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                DB
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5 mr-1 sm:mr-10">
            ثبت کاربران جدید در پایگاه‌داده و مشاهده فهرست اعضای ثبت‌شده
          </p>
        </div>

        {/* Stats Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1a19] border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-2 shadow-2xs">
            <Users size={16} className="text-stone-500 dark:text-stone-400" />
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
              کل کاربران ثبت‌شده:{' '}
              <b className="font-mono text-stone-900 dark:text-stone-100 mr-1 text-sm font-bold">
                {toPersianDigits(users.length)}
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (Left) & User Directory List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ========================================================
            1. REGISTRATION FORM (5 Cols)
           ======================================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1a1a19] rounded-2xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800/70 pb-4">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center shrink-0">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                ثبت‌نام کاربر جدید
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">اطلاعات را وارد کنید تا در دیتابیس ثبت شود</p>
            </div>
          </div>

          {/* Feedback banner */}
          {formFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                formFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
              }`}
            >
              {formFeedback.type === 'success' ? (
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <UserIcon size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed font-semibold">{formFeedback.message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <UserIcon size={13} className="text-stone-400" />
                <span>نام و نام خانوادگی</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی رضایی"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Mail size={13} className="text-stone-400" />
                <span>نشانی ایمیل</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                dir="ltr"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-mono placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Key size={13} className="text-stone-400" />
                <span>رمز عبور</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Key size={13} className="text-stone-400" />
                <span>تکرار رمز عبور</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور"
                dir="ltr"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-98 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <UserPlus size={15} />
              )}
              <span>ثبت‌نام کاربر در پایگاه‌داده</span>
            </button>
          </form>
        </div>

        {/* ========================================================
            2. REGISTERED USERS DIRECTORY LIST (7 Cols)
           ======================================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1a1a19] rounded-2xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs flex flex-col gap-5">
          {/* List Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800/70">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users size={17} className="text-stone-500 dark:text-stone-400" />
                <span>فهرست اعضای پایگاه‌داده</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تعداد {toPersianDigits(filteredUsers.length)} کاربر در پایگاه‌داده ثبت شده است
              </p>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام یا ایمیل..."
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 focus:border-stone-400 dark:focus:border-stone-600 rounded-xl pr-8.5 pl-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Users Table / Grid */}
          <div className="flex flex-col gap-2.5">
            {filteredUsers.length === 0 ? (
              <div className="p-10 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 text-stone-400">
                <Users size={28} className="stroke-1 opacity-50" />
                <p className="text-xs">هیچ کاربری با مشخصات جستجو شده یافت نشد.</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                return (
                  <div
                    key={u.id}
                    className="p-3.5 sm:p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/30 border-stone-200/70 dark:border-stone-800/70 hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {u.displayName.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                          {u.displayName}
                        </span>

                        {/* Email & copy */}
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono">
                          <span dir="ltr">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(u.email)}
                            title="کپی نشانی ایمیل"
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {copiedEmail === u.email ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 dark:border-stone-800/60 shrink-0">
                      {/* Created date */}
                      <span className="text-[11px] text-stone-400 font-mono">
                        {u.createdAt ? formatJalaliShort(new Date(u.createdAt)) : '-'}
                      </span>

                      {/* Delete user button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        title="حذف کاربر از دیتابیس"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
