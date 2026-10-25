import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('stylehut_demo_admin') === 'true';
  });

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          }
        } catch (e) {
          console.warn('Auth session check error', e);
        }
      } else {
        // Local mode
        const localUser = localStorage.getItem('stylehut_auth_user');
        if (localUser) {
          const u = JSON.parse(localUser);
          setUser(u);
          setProfile(u.profile);
        }
      }
      setLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.warn('Profile fetch error', e);
    }
  }

  const login = async (email: string, password = 'password123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { success: true };
    }

    // Local authentication fallback
    const simulatedProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: email.split('@')[0],
      phone: '01711-000000',
      role: email.includes('admin') ? 'admin' : 'customer',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const simulatedUser = {
      id: simulatedProfile.id,
      email,
      profile: simulatedProfile,
    };
    setUser(simulatedUser);
    setProfile(simulatedProfile);
    localStorage.setItem('stylehut_auth_user', JSON.stringify(simulatedUser));
    return { success: true };
  };

  const register = async (name: string, email: string, phone: string, password = 'password123') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
          },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { success: true };
    }

    const simulatedProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: name,
      phone,
      role: 'customer',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const simulatedUser = {
      id: simulatedProfile.id,
      email,
      profile: simulatedProfile,
    };
    setUser(simulatedUser);
    setProfile(simulatedProfile);
    localStorage.setItem('stylehut_auth_user', JSON.stringify(simulatedUser));
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('stylehut_auth_user');
  };

  const toggleDemoAdmin = () => {
    const nextVal = !isDemoAdmin;
    setIsDemoAdmin(nextVal);
    localStorage.setItem('stylehut_demo_admin', String(nextVal));
  };

  const isAdmin = isDemoAdmin || profile?.role === 'admin' || profile?.role === 'manager';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        register,
        logout,
        toggleDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
