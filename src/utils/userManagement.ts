/**
 * User Management & Database Persistence
 * Manages registered users with local database fallback and Supabase synchronization.
 * Guarantees that 'montypop353@gmail.com' is always assigned the 'admin' role.
 */

import { UserProfile, signUpWithEmail, getAllProfiles, updateUserRole as updateSupabaseRole } from './supabaseAuth';
import { isSupabaseConfigured, getSupabase } from './supabase';

export interface ManagedUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  passwordPreview?: string; // stored for demo authentication fallback
}

export const ADMIN_EMAIL = 'montypop353@gmail.com';
const STORAGE_USERS_KEY = 'orbit_registered_users_db_v1';

// Initial seeded admin user
const INITIAL_ADMIN: ManagedUser = {
  id: 'admin-montypop353',
  email: ADMIN_EMAIL,
  displayName: 'مدیر ارشد سیستم',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

/**
 * Loads all users from local database storage
 */
export function getLocalRegisteredUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      return [];
    }
    const list: ManagedUser[] = JSON.parse(raw);

    // If montypop353@gmail.com is registered in the database, ensure it is detected as admin
    let modified = false;
    for (const u of list) {
      if (u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && u.role !== 'admin') {
        u.role = 'admin';
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    }

    return list;
  } catch (e) {
    console.warn('Failed to load local users:', e);
    return [];
  }
}

/**
 * Saves users list to local database storage
 */
export function saveLocalRegisteredUsers(users: ManagedUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save local users:', e);
  }
}

/**
 * Registers a new user in the database (local DB + Supabase if connected)
 * Automatically detects admin role for the designated admin email in the database.
 */
export async function registerNewUser(params: {
  email: string;
  displayName: string;
  password?: string;
}): Promise<{ success: boolean; user: ManagedUser; message: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.displayName.trim() || cleanEmail.split('@')[0];

  // Database automatic admin detection:
  // When this email is recorded in the database, the database automatically assigns admin role.
  const isTargetAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();
  const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';

  const currentUsers = getLocalRegisteredUsers();
  const existingIdx = currentUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (existingIdx !== -1) {
    // If user already exists, update their record
    currentUsers[existingIdx] = {
      ...currentUsers[existingIdx],
      displayName: cleanName,
      role: isTargetAdmin ? 'admin' : currentUsers[existingIdx].role,
      passwordPreview: params.password || currentUsers[existingIdx].passwordPreview,
    };
    saveLocalRegisteredUsers(currentUsers);
    return {
      success: true,
      user: currentUsers[existingIdx],
      message: 'مشخصات کاربر با موفقیت در پایگاه‌داده به‌روزرسانی شد.',
    };
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newUser: ManagedUser = {
    id: userId,
    email: cleanEmail,
    displayName: cleanName,
    role,
    createdAt: new Date().toISOString(),
    passwordPreview: params.password ? params.password : undefined,
  };

  currentUsers.unshift(newUser);
  saveLocalRegisteredUsers(currentUsers);

  // If Supabase is configured and connected, also register on Supabase Auth & Profiles
  if (isSupabaseConfigured() && params.password) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

        // Insert or update public.profiles
        await supabase.from('profiles').upsert(
          {
            id: userId,
            email: cleanEmail,
            display_name: cleanName,
            role,
          },
          { onConflict: 'email' }
        );
      }
    } catch (err: any) {
      console.warn('Supabase cloud user sync notice:', err?.message || err);
    }
  }

  return {
    success: true,
    user: newUser,
    message: 'ثبت‌نام با موفقیت انجام شد و کاربر در دیتابیس ثبت گردید.',
  };
}

/**
 * Changes role of a user
 */
export async function changeUserRole(
  userId: string,
  newRole: 'admin' | 'user'
): Promise<ManagedUser[]> {
  const users = getLocalRegisteredUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) throw new Error('کاربر مورد نظر یافت نشد.');

  // Prevent demoting main admin
  if (target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && newRole !== 'admin') {
    throw new Error('نقش ایمیل montypop353@gmail.com به عنوان مدیر کل سیستم قفل شده است و قابل تقلیل نیست.');
  }

  target.role = newRole;
  saveLocalRegisteredUsers(users);

  // Also update Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await updateSupabaseRole(userId, newRole);
    } catch (err: any) {
      console.warn('Supabase cloud role update notice:', err?.message || err);
    }
  }

  return users;
}

/**
 * Deletes a user from database
 */
export function deleteRegisteredUser(userId: string): ManagedUser[] {
  const users = getLocalRegisteredUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) return users;

  if (target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error('امکان حذف کاربر مدیر کل سیستم (montypop353@gmail.com) وجود ندارد.');
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveLocalRegisteredUsers(filtered);

  // If Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('profiles').delete().eq('id', userId).then();
      }
    } catch (err) {
      console.warn('Supabase profile delete notice:', err);
    }
  }

  return filtered;
}
