import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BannedModal } from '../../src/components/BannedModal';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { RegisterScreen } from '../../src/screens/RegisterScreen';

describe('BannedModal', () => {
  it('should display ban notification when visible', () => {
    const { getByText } = render(<BannedModal visible={true} onSignOut={jest.fn()} />);
    expect(getByText(/tài khoản của bạn đã bị khóa/i)).toBeTruthy();
  });

  it('should call onSignOut when sign out button is pressed', () => {
    const handleSignOut = jest.fn();
    const { getByText } = render(<BannedModal visible={true} onSignOut={handleSignOut} />);
    const button = getByText(/đăng xuất/i);
    fireEvent.press(button);
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });
});

describe('LoginScreen and RegisterScreen', () => {
  it('should render login form with inputs and submit button', () => {
    const onLogin = jest.fn();
    const onGoToRegister = jest.fn();
    const { getAllByText, getByPlaceholderText } = render(
      <LoginScreen onLogin={onLogin} onGoToRegister={onGoToRegister} />
    );

    expect(getByPlaceholderText(/email/i)).toBeTruthy();
    expect(getByPlaceholderText(/mật khẩu/i)).toBeTruthy();
    expect(getAllByText(/đăng nhập/i).length).toBeGreaterThan(0);
  });

  it('should render register form with display name input', () => {
    const onRegister = jest.fn();
    const onGoToLogin = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen onRegister={onRegister} onGoToLogin={onGoToLogin} />
    );

    expect(getByPlaceholderText(/tên hiển thị/i)).toBeTruthy();
    expect(getByPlaceholderText(/email/i)).toBeTruthy();
    expect(getByText(/đăng ký/i)).toBeTruthy();
  });
});
