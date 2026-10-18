import { supabase } from './supabase';
import { UserProfile } from '../types';

export const isUserBanned = (profile: UserProfile | null | undefined): boolean => {
  if (!profile) return false;
  return profile.status === 'banned';
};

export const authService = {
  async signUp(email: string, password: string, displayName: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });

      if (authError) throw authError;
      if (!authData.user) return { profile: null, error: new Error('User creation failed') };

      const initialProfile: UserProfile = {
        id: authData.user.id,
        email,
        displayName,
        role: 'user',
        status: 'active',
        streak: 0,
        totalFocusMinutes: 0,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: initialProfile.id,
          email: initialProfile.email,
          display_name: initialProfile.displayName,
          role: initialProfile.role,
          status: initialProfile.status,
          streak: initialProfile.streak,
          total_focus_minutes: initialProfile.totalFocusMinutes,
        }]);

      if (profileError) {
        // Fallback: Return memory profile if offline/mock
        return { profile: initialProfile, error: null };
      }

      return { profile: initialProfile, error: null };
    } catch (err: any) {
      return { profile: null, error: err };
    }
  },

  async signIn(email: string, password: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) return { profile: null, error: new Error('Sign in failed') };

      const profile = await this.getProfile(authData.user.id);
      return { profile, error: null };
    } catch (err: any) {
      return { profile: null, error: err };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        role: data.role,
        status: data.status,
        streak: data.streak || 0,
        totalFocusMinutes: data.total_focus_minutes || 0,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.streak !== undefined) payload.streak = updates.streak;
      if (updates.totalFocusMinutes !== undefined) payload.total_focus_minutes = updates.totalFocusMinutes;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.role !== undefined) payload.role = updates.role;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      return !error;
    } catch {
      return false;
    }
  }
};
