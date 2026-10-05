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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ff6438] dark:text-orange-400 flex items-center justify-center mb-1">
            {mode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {mode === 'login' ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری جدید'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'برای دسترسی به پنل مدیریت با حساب ادمین خود وارد شوید'
              : 'اولین کاربری که ثبت‌نام کند به عنوان مدیر کل (Admin) تعیین خواهد شد'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ثبت‌نام حساب جدید
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نام و نام خانوادگی</label>
              <div className="relative">
                <User size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: علی رضایی"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ایمیل</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] focus:bg-white dark:focus:bg-slate-800 transition-all text-left font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رمز عبور</label>
            <div className="relative">
              <Lock size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#ff6438] focus:bg-white dark:focus:bg-slate-800 transition-all text-left font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#ff6438] hover:bg-[#f05427] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'در حال برقراری ارتباط...' : mode === 'login' ? 'ورود به پنل' : 'ایجاد حساب کاربری'}
          </button>
        </form>
      </div>
    </div>
  );
};
