import { canUserEnterRoom, generateRoomCode, roomService } from '../../src/services/roomService';
import { UserProfile } from '../../src/types';

describe('canUserEnterRoom', () => {
  it('should reject banned users from entering or creating rooms', () => {
    const bannedUser: UserProfile = {
      id: '2',
      email: 'banned@test.com',
      displayName: 'Cheater',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    };
    expect(canUserEnterRoom(bannedUser)).toBe(false);
  });

  it('should allow active users to enter or create rooms', () => {
    const activeUser: UserProfile = {
      id: '1',
      email: 'legit@test.com',
      displayName: 'Warrior',
      role: 'user',
      status: 'active',
      streak: 1,
      totalFocusMinutes: 25,
    };
    expect(canUserEnterRoom(activeUser)).toBe(true);
  });

  it('should reject null or undefined users', () => {
    expect(canUserEnterRoom(null)).toBe(false);
    expect(canUserEnterRoom(undefined)).toBe(false);
  });
});

describe('generateRoomCode', () => {
  it('should generate a 6-digit numeric string', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });
});

describe('roomService API methods', () => {
  it('should expose createRoom, joinRoom, getRoom, and updateRoomStatus', () => {
    expect(typeof roomService.createRoom).toBe('function');
    expect(typeof roomService.joinRoom).toBe('function');
    expect(typeof roomService.getRoom).toBe('function');
    expect(typeof roomService.updateRoomStatus).toBe('function');
  });

  it('should reject banned user in joinRoom with an explicit error', async () => {
    const bannedUser: UserProfile = {
      id: 'banned-1',
      email: 'banned@test.com',
      displayName: 'BannedGuy',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    };
    const result = await roomService.joinRoom('123456', bannedUser);
    expect(result.room).toBeNull();
    expect(result.error?.message).toMatch(/bị khóa/i);
  });
});
