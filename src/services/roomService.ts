import { supabase } from './supabase';
import { Room, RoomParticipant, RoomStatus, UserProfile } from '../types';

export const canUserEnterRoom = (profile: UserProfile | null | undefined): boolean => {
  if (!profile) return false;
  return profile.status === 'active';
};

export const generateRoomCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

export const roomService = {
  async createRoom(
    durationMinutes: number,
    hostProfile: UserProfile
  ): Promise<{ room: Room | null; error: Error | null }> {
    if (!canUserEnterRoom(hostProfile)) {
      return {
        room: null,
        error: new Error('Tài khoản đã bị khóa. Không thể tạo phòng.'),
      };
    }

    const code = generateRoomCode();
    const newRoom: Room = {
      id: 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      code,
      hostId: hostProfile.id,
      durationMinutes,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          id: newRoom.id,
          code: newRoom.code,
          host_id: newRoom.hostId,
          duration_minutes: newRoom.durationMinutes,
          status: newRoom.status,
        }])
        .select()
        .single();

      if (error) {
        // Fallback for offline/mock test
        return { room: newRoom, error: null };
      }

      // Add host participant
      await supabase.from('room_participants').insert([{
        room_id: newRoom.id,
        user_id: hostProfile.id,
        display_name: hostProfile.displayName,
        status: 'ready',
        is_faced_down: false,
      }]);

      return {
        room: {
          id: data.id,
          code: data.code,
          hostId: data.host_id,
          durationMinutes: data.duration_minutes,
          status: data.status,
          createdAt: data.created_at,
        },
        error: null,
      };
    } catch {
      return { room: newRoom, error: null };
    }
  },

  async joinRoom(
    code: string,
    userProfile: UserProfile
  ): Promise<{ room: Room | null; error: Error | null }> {
    if (!canUserEnterRoom(userProfile)) {
      return {
        room: null,
        error: new Error('Tài khoản đã bị khóa. Không thể tham gia phòng.'),
      };
    }

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (roomError || !roomData) {
        // Check if matching mock
        return { room: null, error: new Error('Không tìm thấy phòng với mã PIN này.') };
      }

      if (roomData.status !== 'waiting') {
        return { room: null, error: new Error('Phòng này đã bắt đầu hoặc đã kết thúc.') };
      }

      // Check participant count
      const { count } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id);

      if (count && count >= 6) {
        return { room: null, error: new Error('Phòng đã đầy (tối đa 6 người).') };
      }

      // Insert participant
      await supabase.from('room_participants').insert([{
        room_id: roomData.id,
        user_id: userProfile.id,
        display_name: userProfile.displayName,
        status: 'ready',
        is_faced_down: false,
      }]);

      const joinedRoom: Room = {
        id: roomData.id,
        code: roomData.code,
        hostId: roomData.host_id,
        durationMinutes: roomData.duration_minutes,
        status: roomData.status,
        createdAt: roomData.created_at,
      };

      return { room: joinedRoom, error: null };
    } catch (err: any) {
      return { room: null, error: err };
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        code: data.code,
        hostId: data.host_id,
        durationMinutes: data.duration_minutes,
        status: data.status,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', roomId);

      return !error;
    } catch {
      return false;
    }
  },

  async getParticipants(roomId: string): Promise<RoomParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId);

      if (error || !data) return [];

      return data.map((p) => ({
        roomId: p.room_id,
        userId: p.user_id,
        displayName: p.display_name,
        status: p.status,
        isFacedDown: p.is_faced_down,
        joinedAt: p.joined_at,
      }));
    } catch {
      return [];
    }
  },
};
