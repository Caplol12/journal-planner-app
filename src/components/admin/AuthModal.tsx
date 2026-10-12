import React, { useState } from 'react';
import { LogIn, UserPlus, X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured()) {
      setErrorMsg('ابتدا لازم است پروژه Supabase را در تب تنظیمات سرور پیکربندی کنید.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('لطفاً ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('ورود با موفقیت انجام شد.');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        await register(email, password, fullName);
        setSuccessMsg('حساب کاربری با موفقیت ساخته شد.');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err: any) {
      console.warn('Auth error:', err?.message || err);
      setErrorMsg(err.message || 'خطایی در احراز هویت رخ داد.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1a1a19] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl border border-stone-200/80 dark:border-stone-800/80 flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-200 text-stone-900 dark:text-stone-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center mb-1 shadow-2xs">
            {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {mode === 'login' ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری جدید'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs">
            {mode === 'login'
              ? 'برای دسترسی به پنل مدیریت با حساب ادمین خود وارد شوید'
              : 'اولین کاربری که ثبت‌نام کند به عنوان مدیر کل (Admin) تعیین خواهد شد'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-100 dark:bg-stone-850 p-1 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            ورود به سیستم
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            ثبت‌نام حساب جدید
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-right">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">نام و نام خانوادگی</label>
              <div className="relative">
                <User size={15} className="absolute right-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: علی رضایی"
                  className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">ایمیل</label>
            <div className="relative">
              <Mail size={15} className="absolute right-3.5 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">رمز عبور</label>
            <div className="relative">
              <Lock size={15} className="absolute right-3.5 top-3 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-600 focus:ring-1 focus:ring-stone-400/20 transition-all text-left font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-900 py-2.5 rounded-xl text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'در حال برقراری ارتباط...' : mode === 'login' ? 'ورود به پنل' : 'ایجاد حساب کاربری'}
          </button>
        </form>
      </div>
    </div>
  );
};
