import { supabase } from './supabase';
import { UserProfile, UserStatus } from '../types';

export const toggleBanStatus = (status: UserStatus): UserStatus => {
  return status === 'active' ? 'banned' : 'active';
};

export const adminService = {
  async listUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        email: d.email,
        displayName: d.display_name,
        role: d.role,
        status: d.status,
        streak: d.streak || 0,
        totalFocusMinutes: d.total_focus_minutes || 0,
        createdAt: d.created_at,
      }));
    } catch {
      return [];
    }
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      return !error;
    } catch {
      return false;
    }
  },

  async toggleUserBan(
    userId: string,
    currentStatus: UserStatus
  ): Promise<{ newStatus: UserStatus | null; error: Error | null }> {
    const nextStatus = toggleBanStatus(currentStatus);
    const success = await this.updateUserStatus(userId, nextStatus);
    if (!success) {
      return { newStatus: null, error: new Error('Không thể cập nhật trạng thái người dùng.') };
    }
    return { newStatus: nextStatus, error: null };
  },
};
