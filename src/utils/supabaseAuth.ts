import { User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  const profile = data as UserProfile;
  if (profile.email?.toLowerCase() === 'montypop353@gmail.com') {
    profile.role = 'admin';
  }

  return profile;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName || email.split('@')[0],
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Could not fetch profiles:', error.message || error);
    return [];
  }

  const list = (data || []) as UserProfile[];
  for (const p of list) {
    if (p.email?.toLowerCase() === 'montypop353@gmail.com') {
      p.role = 'admin';
    }
  }

  return list;
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase پیکربندی نشده است.');

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
  return data;
}
