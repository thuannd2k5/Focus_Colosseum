import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { toggleBanStatus, adminService } from '../../src/services/adminService';
import { AdminDashboardScreen } from '../../src/screens/AdminDashboardScreen';
import { UserProfile } from '../../src/types';

describe('adminService: toggleBanStatus', () => {
  it('should switch active to banned and banned to active', () => {
    expect(toggleBanStatus('active')).toBe('banned');
    expect(toggleBanStatus('banned')).toBe('active');
  });

  it('should expose listUsers and updateUserStatus methods', () => {
    expect(typeof adminService.listUsers).toBe('function');
    expect(typeof adminService.updateUserStatus).toBe('function');
  });
});

describe('AdminDashboardScreen', () => {
  const mockUsers: UserProfile[] = [
    {
      id: 'u1',
      displayName: 'LegitWarrior',
      email: 'warrior@test.com',
      role: 'user',
      status: 'active',
      streak: 4,
      totalFocusMinutes: 100,
    },
    {
      id: 'u2',
      displayName: 'CheaterUser',
      email: 'cheater@test.com',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    },
  ];

  it('should render user list with status badges and ban action buttons', () => {
    const onToggleBan = jest.fn();
    const onBack = jest.fn();

    const { getByText, getAllByText } = render(
      <AdminDashboardScreen
        users={mockUsers}
        onToggleBan={onToggleBan}
        onBack={onBack}
      />
    );

    expect(getByText(/bảng điều khiển quản trị/i)).toBeTruthy();
    expect(getByText(/LegitWarrior/i)).toBeTruthy();
    expect(getByText(/CheaterUser/i)).toBeTruthy();
    expect(getAllByText(/Khóa tài khoản/i).length).toBeGreaterThan(0);
    expect(getByText(/Mở khóa/i)).toBeTruthy();
  });
});
