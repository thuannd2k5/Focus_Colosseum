import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';

describe('Application Root Navigation', () => {
  it('should render login screen when unauthenticated', async () => {
    const { getAllByText } = render(<App />);
    await waitFor(() => {
      expect(getAllByText(/đăng nhập/i).length).toBeGreaterThan(0);
    });
  });

  it('should allow toggling between login and register views', async () => {
    const { getByText, getAllByText } = render(<App />);
    await waitFor(() => {
      expect(getByText(/đăng ký ngay/i)).toBeTruthy();
    });

    const registerLink = getByText(/đăng ký ngay/i);
    fireEvent.press(registerLink);

    await waitFor(() => {
      expect(getAllByText(/đăng ký/i).length).toBeGreaterThan(0);
      expect(getByText(/chiến binh mới/i)).toBeTruthy();
    });
  });
});
