import { isUserBanned, authService } from '../../src/services/authService';
import { UserProfile } from '../../src/types';

describe('authService.isUserBanned', () => {
  it('should return true if user status is banned', () => {
    const bannedUser: UserProfile = {
      id: '1',
      email: 'banned@test.com',
      displayName: 'BadActor',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    };
    expect(isUserBanned(bannedUser)).toBe(true);
  });

  it('should return false if user status is active', () => {
    const activeUser: UserProfile = {
      id: '2',
      email: 'good@test.com',
      displayName: 'GoodCitizen',
      role: 'user',
      status: 'active',
      streak: 3,
      totalFocusMinutes: 75,
    };
    expect(isUserBanned(activeUser)).toBe(false);
  });

  it('should return false if user is null or undefined', () => {
    expect(isUserBanned(null)).toBe(false);
    expect(isUserBanned(undefined)).toBe(false);
  });
});

describe('authService', () => {
  it('should have authentication methods', () => {
    expect(typeof authService.signUp).toBe('function');
    expect(typeof authService.signIn).toBe('function');
    expect(typeof authService.signOut).toBe('function');
    expect(typeof authService.getProfile).toBe('function');
  });
});
