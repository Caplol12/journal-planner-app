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
    <div className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-8 bg-[#f5f7f9] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playSwoosh();
                onBackToApp();
              }}
              title="بازگشت به ژورنال‌ها"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowRight size={18} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>صفحه ثبت‌نام و فهرست کاربران</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#ff6438]/10 text-[#ff6438] border border-[#ff6438]/30">
                DB
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 mr-11">
            ثبت کاربران جدید در پایگاه‌داده و مشاهده فهرست کاربران ثبت‌شده
          </p>
        </div>

        {/* Stats Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-2xs">
            <Users size={17} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              کل کاربران ثبت‌شده:{' '}
              <b className="font-mono text-blue-600 dark:text-blue-400 mr-1 text-sm">
                {toPersianDigits(users.length)}
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (Left) & User Directory List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            1. REGISTRATION FORM (4 Cols)
           ======================================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6 relative">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#ffece5] dark:bg-orange-950/50 text-[#ff6438] dark:text-orange-400 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                ثبت‌نام کاربر جدید
              </h2>
              <p className="text-xs text-slate-400">اطلاعات را وارد کنید تا در دیتابیس ثبت شود</p>
            </div>
          </div>

          {/* Feedback banner */}
          {formFeedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                formFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {formFeedback.type === 'success' ? (
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <UserIcon size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed font-semibold">{formFeedback.message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon size={14} className="text-slate-400" />
                <span>نام و نام خانوادگی</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی رضایی"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] dark:focus:border-[#ff6438] transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>نشانی ایمیل</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] dark:focus:border-[#ff6438] transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key size={14} className="text-slate-400" />
                <span>رمز عبور</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key size={14} className="text-slate-400" />
                <span>تکرار رمز عبور</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full bg-[#ff6438] hover:bg-[#f05427] text-white py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              <span>ثبت‌نام کاربر در دیتابیس</span>
            </button>
          </form>
        </div>

        {/* ========================================================
            2. REGISTERED USERS DIRECTORY LIST (7 Cols)
           ======================================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          {/* List Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={19} className="text-[#ff6438]" />
                <span>فهرست کاربران ثبت‌شده در پایگاه‌داده</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعداد {toPersianDigits(filteredUsers.length)} کاربر در پایگاه‌داده ثبت شده است
              </p>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-60">
              <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام یا ایمیل..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#ff6438] rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Users Table / Grid */}
          <div className="flex flex-col gap-3">
            {filteredUsers.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                <Users size={32} className="stroke-1 opacity-60" />
                <p className="text-xs">هیچ کاربری با مشخصات جستجو شده یافت نشد.</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl border bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {u.displayName.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {u.displayName}
                        </span>

                        {/* Email & copy */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span dir="ltr">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(u.email)}
                            title="کپی نشانی ایمیل"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800 shrink-0">
                      {/* Created date */}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {u.createdAt ? formatJalaliShort(new Date(u.createdAt)) : '-'}
                      </span>

                      {/* Delete user button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        title="حذف کاربر از دیتابیس"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
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
