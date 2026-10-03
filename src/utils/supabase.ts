import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage keys for runtime configuration overrides
const STORAGE_URL_KEY = 'sp_custom_supabase_url';
const STORAGE_ANON_KEY = 'sp_custom_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 10);
}

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    supabaseInstance = null; // Reset cached client
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    supabaseInstance = null;
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseCredentials();
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  hasStorage?: boolean;
  hasTables?: boolean;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'تنظیمات Supabase (URL یا Anon Key) هنوز وارد نشده است.',
    };
  }

  try {
    // 1. Test database connection
    const { data: dbData, error: dbError } = await client
      .from('templates')
      .select('id')
      .limit(1);

    // 2. Test storage bucket
    const { data: buckets, error: storageError } = await client.storage.listBuckets();
    const hasTemplatesBucket = Boolean(buckets?.some((b) => b.name === 'templates'));

    if (dbError && dbError.code === '42P01') {
      // Table does not exist
      return {
        success: false,
        message: 'اتصال به پروژه برقرار شد، اما جداول پایگاه‌داده هنوز ایجاد نشده‌اند. لطفاً فایل supabase_schema.sql را در SQL Editor اجرا کنید.',
        hasStorage: hasTemplatesBucket,
        hasTables: false,
      };
    }

    if (dbError) {
      return {
        success: false,
        message: `خطا در برقراری ارتباط با دیتابیس: ${dbError.message}`,
        hasStorage: hasTemplatesBucket,
        hasTables: false,
      };
    }

    return {
      success: true,
      message: 'اتصال به پایگاه‌داده و سرور Supabase با موفقیت برقرار شد!',
      hasStorage: hasTemplatesBucket,
      hasTables: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `خطای اتصال: ${err?.message || 'پاسخی از سرور دریافت نشد.'}`,
    };
  }
}
