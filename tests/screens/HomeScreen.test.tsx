import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { LobbyScreen } from '../../src/screens/LobbyScreen';
import { ResultScreen } from '../../src/screens/ResultScreen';

describe('HomeScreen', () => {
  it('should render user streak and action buttons', () => {
    const mockProfile = {
      id: '1',
      displayName: 'Warrior',
      streak: 5,
      totalFocusMinutes: 120,
      role: 'user',
      status: 'active',
      email: 'w@test.com',
    };
    const { getByText } = render(
      <HomeScreen profile={mockProfile as any} onNavigate={jest.fn()} />
    );
    expect(getByText(/5 ngày/i)).toBeTruthy();
    expect(getByText(/tạo phòng/i)).toBeTruthy();
    expect(getByText(/vào phòng/i)).toBeTruthy();
  });
});

describe('LobbyScreen', () => {
  it('should display room code and participant count', () => {
    const mockRoom = {
      id: 'room-1',
      code: '889900',
      hostId: 'user-1',
      durationMinutes: 25,
      status: 'waiting' as const,
    };
    const mockParticipants = [
      { roomId: 'room-1', userId: 'user-1', displayName: 'Host Warrior', status: 'ready' as const, isFacedDown: false },
      { roomId: 'room-1', userId: 'user-2', displayName: 'Allied Fighter', status: 'ready' as const, isFacedDown: false }
    ];

    const { getByText } = render(
      <LobbyScreen
        room={mockRoom}
        participants={mockParticipants}
        isHost={true}
        onStartSession={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );

    expect(getByText(/889900/)).toBeTruthy();
    expect(getByText(/2\/6/)).toBeTruthy();
  });
});

describe('ResultScreen', () => {
  it('should show victory UI when session is completed', () => {
    const { getByText } = render(
      <ResultScreen
        status="completed"
        durationMinutes={25}
        onBackHome={jest.fn()}
      />
    );
    expect(getByText(/chiến thắng/i)).toBeTruthy();
  });

  it('should show defeat UI with violator name when session failed', () => {
    const { getByText } = render(
      <ResultScreen
        status="failed"
        durationMinutes={25}
        failedBy={{ userId: '99', displayName: 'XaoNhangBoy', reason: 'Lật máy' }}
        onBackHome={jest.fn()}
      />
    );
    expect(getByText(/thất bại/i)).toBeTruthy();
    expect(getByText(/XaoNhangBoy/i)).toBeTruthy();
  });
});
