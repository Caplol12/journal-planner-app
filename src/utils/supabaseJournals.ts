import { getSupabase } from './supabase';
import { Journal } from '../types';

export interface CloudJournalRow {
  id: string;
  user_id: string;
  title: string;
  color: string;
  theme: string;
  starred: boolean;
  cover_image?: string | null;
  created_at: string;
  pages: any;
  updated_at?: string;
}

/**
 * دریافت ژورنال‌های کاربر از پایگاه‌داده Supabase
 */
export async function fetchCloudJournals(): Promise<{
  data: Journal[] | null;
  error: string | null;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: 'اتصال به Supabase برقرار نیست.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'کاربر لاگین نکرده است.' };
  }

  try {
    const { data, error } = await supabase
      .from('user_journals')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch cloud journals:', error.message || error);
      return { data: null, error: error.message };
    }

    if (!data) return { data: [], error: null };

    const journals: Journal[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      color: row.color || '#5fa8e8',
      theme: row.theme || 'sage',
      coverImage: row.cover_image || undefined,
      starred: Boolean(row.starred),
      createdAt: row.created_at || '',
      pages: typeof row.pages === 'object' && row.pages !== null ? row.pages : {},
    }));

    return { data: journals, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'خطای ناشناخته در دریافت اطلاعات ابری' };
  }
}

/**
 * ذخیره و همگام‌سازی ژورنال‌ها در Supabase
 */
export async function saveCloudJournals(journals: Journal[]): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase در دسترس نیست.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'کاربر وارد نشده است.' };

  try {
    const rows = journals.map((j) => ({
      id: j.id,
      user_id: user.id,
      title: j.title,
      color: j.color,
      theme: j.theme || 'sage',
      starred: j.starred,
      cover_image: j.coverImage || null,
      created_at: j.createdAt,
      pages: j.pages || {},
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('user_journals')
      .upsert(rows, { onConflict: 'id,user_id' });

    if (error) {
      console.warn('Could not sync journals to cloud:', error.message || error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطا در همگام‌سازی ابری' };
  }
}

/**
 * حذف یک ژورنال از Supabase
 */
export async function deleteCloudJournal(journalId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    const { error } = await supabase
      .from('user_journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', user.id);

    return !error;
  } catch {
    return false;
  }
}
