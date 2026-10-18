import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { authService, isUserBanned } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setMockProfile?: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentProfile = async (userId: string) => {
    const fetched = await authService.getProfile(userId);
    setProfile(fetched);
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchCurrentProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchCurrentProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { profile: resProfile, error } = await authService.signIn(email, password);
    setLoading(false);
    if (error || !resProfile) {
      return { success: false, error: error?.message || 'Đăng nhập thất bại' };
    }
    setProfile(resProfile);
    return { success: true };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    const { profile: resProfile, error } = await authService.signUp(email, password, displayName);
    setLoading(false);
    if (error || !resProfile) {
      return { success: false, error: error?.message || 'Đăng ký thất bại' };
    }
    setProfile(resProfile);
    return { success: true };
  };

  const signOut = async () => {
    await authService.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (profile?.id) {
      const updated = await authService.getProfile(profile.id);
      if (updated) setProfile(updated);
    }
  };

  const isAuthenticated = Boolean(profile);
  const isAdmin = profile?.role === 'admin';
  const isBanned = isUserBanned(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isAuthenticated,
        isAdmin,
        isBanned,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        setMockProfile: setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
