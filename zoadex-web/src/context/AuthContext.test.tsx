import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    getToken: vi.fn(),
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides isAuthenticated=false initially with no token', async () => {
    mockedAuthService.getToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });

  it('restores session from localStorage on mount', async () => {
    const mockUser = {
      id: 'u1',
      username: 'RestoredUser',
      email: 'restored@test.com',
      plan: 'FREE',
      activeRegionId: null,
      activeRegionName: null,
      totalSightings: 0,
      uniqueSpeciesDiscovered: 0,
      createdAt: '2026-01-01',
    };
    mockedAuthService.getToken.mockReturnValue('saved-token');
    mockedAuthService.getMe.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('RestoredUser');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('login() updates user state', async () => {
    const mockUser = {
      id: 'u2',
      username: 'LoggedIn',
      email: 'login@test.com',
      plan: 'PRO',
      activeRegionId: null,
      activeRegionName: null,
      totalSightings: 10,
      uniqueSpeciesDiscovered: 5,
      createdAt: '2026-01-01',
    };
    mockedAuthService.getToken.mockReturnValue(null);
    mockedAuthService.login.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('LoggedIn');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('logout() clears user state', async () => {
    const mockUser = {
      id: 'u1',
      username: 'TestUser',
      email: 'test@test.com',
      plan: 'FREE',
      activeRegionId: null,
      activeRegionName: null,
      totalSightings: 0,
      uniqueSpeciesDiscovered: 0,
      createdAt: '2026-01-01',
    };
    mockedAuthService.getToken.mockReturnValue('token');
    mockedAuthService.getMe.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('TestUser');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(mockedAuthService.logout).toHaveBeenCalled();
  });

  it('handles failed getMe() gracefully', async () => {
    mockedAuthService.getToken.mockReturnValue('expired-token');
    mockedAuthService.getMe.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(mockedAuthService.logout).toHaveBeenCalled();
  });
});
