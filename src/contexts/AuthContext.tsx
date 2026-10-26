import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { getLocal } from '../lib/utils';

export interface AdminUserItem {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  account_status: 'active' | 'blocked';
  created_at: string;
}

const DEFAULT_ADMIN_STAFF: AdminUserItem[] = [
  {
    id: '39f7a1b8-17a1-4833-b4c3-8dcf20132805',
    full_name: 'Super Admin Sohel',
    email: 'sohel229229@gmail.com',
    phone: '01700-000000',
    role: 'super_admin',
    account_status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b71bb7ff-ee0a-4a20-ba72-a85178349a12',
    full_name: 'alamin',
    email: 'hello.alaminmkt@gmail.com',
    phone: '01833729229',
    role: 'admin',
    account_status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e43a0724-5a82-4ae1-bef0-4a55b1e41b50',
    full_name: 'alamin',
    email: 'sohel229@gmail.com',
    phone: '01833729229',
    role: 'admin',
    account_status: 'active',
    created_at: new Date().toISOString(),
  },
];

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole;
  isCustomer: boolean;
  isRegularAdmin: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear any legacy demo admin state
  useEffect(() => {
    localStorage.removeItem('stylehut_demo_admin');
  }, []);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          }
        } catch (e) {
          console.warn('Auth session check error', e);
        }
      } else {
        // Local mode fallback
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
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  async function fetchProfile(userId: string, userEmail?: string): Promise<Profile | null> {
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    // Check known admin list for guaranteed role matching
    let knownAdmins = getLocal<AdminUserItem[]>('admin_staff', DEFAULT_ADMIN_STAFF);
    if (!knownAdmins || knownAdmins.length === 0) {
      try {
        const raw = localStorage.getItem('stylehut_admin_staff') || localStorage.getItem('stylehut_stylehut_admin_staff');
        if (raw) knownAdmins = JSON.parse(raw);
      } catch (e) {}
    }
    const matchedAdmin = (knownAdmins || []).find(a => a.email.toLowerCase() === cleanEmail);

    let prof: Profile | null = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) {
          prof = data as Profile;
        }
      } catch (e) {
        console.warn('Profile fetch error', e);
      }
    }

    // Determine exact role according to 3 tiers
    let finalRole: UserRole = 'customer';
    if (
      cleanEmail === 'sohel229229@gmail.com' ||
      prof?.role === 'super_admin' ||
      matchedAdmin?.role === 'super_admin'
    ) {
      finalRole = 'super_admin';
    } else if (
      prof?.role === 'admin' ||
      prof?.role === 'manager' ||
      matchedAdmin?.role === 'admin' ||
      cleanEmail === 'hello.alaminmkt@gmail.com' ||
      cleanEmail === 'sohel229@gmail.com'
    ) {
      finalRole = 'admin';
    }

    if (!prof) {
      prof = {
        id: userId,
        full_name: matchedAdmin?.full_name || cleanEmail.split('@')[0],
        phone: matchedAdmin?.phone || '',
        email: cleanEmail,
        role: finalRole,
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      prof.role = finalRole;
      if (!prof.email) prof.email = cleanEmail;
    }

    setProfile(prof);
    return prof;
  }

  const login = async (email: string, password = ''): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id, data.user.email);
        return { success: true, role: p?.role || 'customer' };
      }
      return { success: true, role: 'customer' };
    }

    // Local authentication fallback
    let knownAdmins = getLocal<AdminUserItem[]>('admin_staff', DEFAULT_ADMIN_STAFF);
    if (!knownAdmins || knownAdmins.length === 0) {
      try {
        const raw = localStorage.getItem('stylehut_admin_staff') || localStorage.getItem('stylehut_stylehut_admin_staff');
        if (raw) knownAdmins = JSON.parse(raw);
      } catch (e) {}
    }
    const matchedAdmin = (knownAdmins || []).find(a => a.email.toLowerCase() === cleanEmail);

    const isRoot = cleanEmail === 'sohel229229@gmail.com';
    const isKnownAdmin = Boolean(matchedAdmin);

    if (isRoot || isKnownAdmin || password === 'shariar123' || password === 'password123') {
      const determinedRole: UserRole = isRoot ? 'super_admin' : (isKnownAdmin ? (matchedAdmin?.role || 'admin') : 'customer');
      const simulatedProfile: Profile = {
        id: matchedAdmin?.id || 'usr-' + Date.now(),
        full_name: isRoot ? 'Super Admin Sohel' : (matchedAdmin?.full_name || cleanEmail.split('@')[0]),
        phone: matchedAdmin?.phone || '01700-000000',
        email: cleanEmail,
        role: determinedRole,
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const simulatedUser = {
        id: simulatedProfile.id,
        email: cleanEmail,
        profile: simulatedProfile,
      };
      setUser(simulatedUser);
      setProfile(simulatedProfile);
      localStorage.setItem('stylehut_auth_user', JSON.stringify(simulatedUser));
      return { success: true, role: determinedRole };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const register = async (name: string, email: string, phone: string, password = '') => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
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
        await fetchProfile(data.user.id, data.user.email);
      }
      return { success: true };
    }

    const simulatedProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: name,
      phone,
      email: cleanEmail,
      role: 'customer',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const simulatedUser = {
      id: simulatedProfile.id,
      email: cleanEmail,
      profile: simulatedProfile,
    };
    setUser(simulatedUser);
    setProfile(simulatedProfile);
    localStorage.setItem('stylehut_auth_user', JSON.stringify(simulatedUser));
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error', e);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('stylehut_auth_user');
  };

  // 3-Tier Role Evaluation
  const role: UserRole = profile?.role || (user?.email?.toLowerCase() === 'sohel229229@gmail.com' ? 'super_admin' : 'customer');
  const isSuperAdmin = role === 'super_admin';
  const isRegularAdmin = role === 'admin' || role === 'manager';
  const isAdmin = isSuperAdmin || isRegularAdmin;
  const isCustomer = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isCustomer,
        isRegularAdmin,
        isSuperAdmin,
        isAdmin,
        login,
        register,
        logout,
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
