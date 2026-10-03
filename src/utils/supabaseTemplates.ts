import { getSupabase } from './supabase';

export interface CloudTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  category: string;
  storage_path?: string;
  html_content: string;
  preview_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchCloudTemplates(): Promise<CloudTemplate[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cloud templates:', error);
    return [];
  }

  return (data || []) as CloudTemplate[];
}

export async function uploadTemplateFile(
  file: File | Blob,
  path: string,
  contentType: string = 'text/html'
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { error: uploadError } = await supabase.storage
    .from('templates')
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`خطا در آپلود فایل در باکت ذخیره‌سازی: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('templates').getPublicUrl(path);
  return data.publicUrl;
}

export async function createCloudTemplate(params: {
  title: string;
  badge?: string;
  description?: string;
  icon?: string;
  category?: string;
  htmlContent: string;
  htmlFile?: File;
  previewImage?: File;
}): Promise<CloudTemplate> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { data: { user } } = await supabase.auth.getUser();

  const id = crypto.randomUUID();
  let storagePath: string | undefined = undefined;
  let previewUrl: string | undefined = undefined;

  // 1. Upload HTML file to Supabase Storage if file or content exists
  try {
    const blob = params.htmlFile || new Blob([params.htmlContent], { type: 'text/html' });
    const filePath = `html/${id}.html`;
    await uploadTemplateFile(blob, filePath, 'text/html;charset=utf-8');
    storagePath = filePath;
  } catch (err: any) {
    console.warn('Storage upload warning (proceeding with db record):', err.message);
  }

  // 2. Upload Preview image if provided
  if (params.previewImage) {
    try {
      const ext = params.previewImage.name.split('.').pop() || 'png';
      const imagePath = `covers/${id}.${ext}`;
      previewUrl = await uploadTemplateFile(params.previewImage, imagePath, params.previewImage.type);
    } catch (imgErr: any) {
      console.warn('Preview image upload warning:', imgErr.message);
    }
  }

  // 3. Insert record into templates table
  const newRecord = {
    id,
    title: params.title.trim(),
    badge: params.badge?.trim() || 'قالب ابری',
    description: params.description?.trim() || '',
    icon: params.icon || '📑',
    category: params.category || 'daily',
    storage_path: storagePath,
    html_content: params.htmlContent,
    preview_url: previewUrl,
    is_active: true,
    created_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from('templates')
    .insert([newRecord])
    .select()
    .single();

  if (error) {
    throw new Error(`خطا در ثبت قالب در پایگاه داده: ${error.message}`);
  }

  return data as CloudTemplate;
}

export async function updateCloudTemplate(
  id: string,
  updates: Partial<CloudTemplate>
): Promise<CloudTemplate> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { data, error } = await supabase
    .from('templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`خطا در به‌روزرسانی قالب: ${error.message}`);
  }

  return data as CloudTemplate;
}

export async function deleteCloudTemplate(id: string, storagePath?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  // 1. Delete from storage if path exists
  if (storagePath) {
    try {
      await supabase.storage.from('templates').remove([storagePath]);
    } catch (e) {
      console.warn('Could not remove file from storage:', e);
    }
  }

  // 2. Delete from DB
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`خطا در حذف قالب: ${error.message}`);
  }
}
