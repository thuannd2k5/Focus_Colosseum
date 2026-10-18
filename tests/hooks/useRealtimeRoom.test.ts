import { renderHook, act } from '@testing-library/react-native';
import { useRealtimeRoom, HEARTBEAT_TIMEOUT_MS } from '../../src/hooks/useRealtimeRoom';
import { supabase } from '../../src/services/supabase';
import { roomService } from '../../src/services/roomService';
import { UserProfile } from '../../src/types';

describe('useRealtimeRoom presence and 15s heartbeat timeout', () => {
  const mockUser: UserProfile = {
    id: 'user-self',
    email: 'self@test.com',
    displayName: 'MyWarrior',
    role: 'user',
    status: 'active',
    streak: 2,
    totalFocusMinutes: 50,
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should export HEARTBEAT_TIMEOUT_MS as 15000', () => {
    expect(HEARTBEAT_TIMEOUT_MS).toBe(15000);
  });

  it('should mark a peer as disconnected when heartbeat exceeds 15 seconds', async () => {
    let mockTime = 100000;
    jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

    jest.spyOn(roomService, 'getRoom').mockResolvedValue({
      id: 'room-abc',
      code: '123456',
      hostId: 'user-self',
      durationMinutes: 25,
      status: 'active',
    });
    jest.spyOn(roomService, 'getParticipants').mockResolvedValue([]);

    let syncCallback: any = null;
    let currentPresence: any = {};

    const mockChannelInstance: any = {
      on: jest.fn().mockImplementation((type, filter, cb) => {
        if (type === 'presence' && filter?.event === 'sync') {
          syncCallback = cb;
        }
        return mockChannelInstance;
      }),
      subscribe: jest.fn().mockImplementation((cb) => {
        if (cb) cb('SUBSCRIBED');
        return mockChannelInstance;
      }),
      unsubscribe: jest.fn(),
      track: jest.fn().mockResolvedValue({}),
      send: jest.fn().mockResolvedValue({}),
      presenceState: jest.fn().mockImplementation(() => currentPresence),
    };

    jest.spyOn(supabase, 'channel').mockReturnValue(mockChannelInstance as any);

    const onParticipantDisconnected = jest.fn();

    const { result, unmount } = renderHook(() =>
      useRealtimeRoom({
        roomId: 'room-abc',
        currentUser: mockUser,
        onParticipantDisconnected,
      })
    );

    // Initial presence with a peer participant at time 100000
    currentPresence = {
      'user-peer': [
        {
          userId: 'user-peer',
          displayName: 'RemoteFriend',
          status: 'focusing',
          isFacedDown: true,
          lastHeartbeat: mockTime,
        },
      ],
    };

    act(() => {
      if (syncCallback) syncCallback();
    });

    expect(result.current.participants.some((p) => p.userId === 'user-peer')).toBe(true);

    // Advance mock time by 16 seconds (exceeding 15s) and trigger timers
    mockTime += 16000;
    act(() => {
      jest.advanceTimersByTime(16000);
    });

    const peer = result.current.participants.find((p) => p.userId === 'user-peer');
    expect(peer?.status).toBe('disconnected');
    expect(onParticipantDisconnected).toHaveBeenCalled();

    unmount();
  });
});
