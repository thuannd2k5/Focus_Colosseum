export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  streak: number;
  totalFocusMinutes: number;
  createdAt?: string;
}

export type RoomStatus = 'waiting' | 'active' | 'completed' | 'failed';

export interface Room {
  id: string;
  code: string;
  hostId: string;
  durationMinutes: number;
  status: RoomStatus;
  createdAt?: string;
}

export type ParticipantStatus = 'ready' | 'focusing' | 'failed' | 'disconnected';

export interface RoomParticipant {
  roomId: string;
  userId: string;
  displayName: string;
  status: ParticipantStatus;
  isFacedDown: boolean;
  joinedAt?: string;
  lastHeartbeat?: number;
}

export interface SessionResult {
  roomId: string;
  durationMinutes: number;
  status: 'completed' | 'failed';
  failedBy?: {
    userId: string;
    displayName: string;
    reason?: string;
  };
  completedAt: string;
  savedMinutes?: number;
}
