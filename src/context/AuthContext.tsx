import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../utils/supabase';
import {
  UserProfile,
  getCurrentUser,
  getUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from '../utils/supabaseAuth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const p = await getUserProfile(currentUser.id);
      if (p) {
        setProfile(p);
      } else {
        // Fallback profile if record is still being created
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          display_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
          role: 'user',
          created_at: currentUser.created_at,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    const u = await getCurrentUser();
    setUser(u);
    await fetchProfile(u);
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const u = await getCurrentUser();
        if (mounted) {
          setUser(u);
          if (u) await fetchProfile(u);
        }
      } catch (err) {
        console.error('Init auth error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }

      const client = getSupabase();
      if (client) {
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (_event, session) => {
            const newUser = session?.user || null;
            if (mounted) {
              setUser(newUser);
              await fetchProfile(newUser);
              setIsLoading(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmail(email, pass);
      setUser(res.user);
      await fetchProfile(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await signUpWithEmail(email, pass, name);
      setUser(res.user);
      await fetchProfile(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
