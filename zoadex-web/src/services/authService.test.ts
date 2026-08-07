import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import api from './api';

vi.mock('./api');

const mockedApi = vi.mocked(api);

const mockUser = {
  id: 'u1',
  username: 'TestUser',
  email: 'test@test.com',
  plan: 'FREE',
  activeRegionId: null,
  activeRegionName: null,
  totalSightings: 5,
  uniqueSpeciesDiscovered: 3,
  createdAt: '2026-01-01',
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('stores token in localStorage and returns User', async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: { token: 'jwt-token-123', username: 'TestUser', email: 'test@test.com' },
      });
      mockedApi.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login({ email: 'test@test.com', password: 'pass123' });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'pass123',
      });
      expect(localStorage.getItem('zoadex_token')).toBe('jwt-token-123');
      expect(result).toEqual(mockUser);
    });

    it('throws on 400 (invalid credentials)', async () => {
      mockedApi.post.mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Invalid credentials' } },
      });

      await expect(
        authService.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toBeDefined();
      expect(localStorage.getItem('zoadex_token')).toBeNull();
    });
  });

  describe('register', () => {
    it('stores token and returns User', async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: { token: 'reg-token-456', username: 'NewUser', email: 'new@test.com' },
      });
      mockedApi.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.register({
        username: 'NewUser',
        email: 'new@test.com',
        password: 'securepass',
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
        username: 'NewUser',
        email: 'new@test.com',
        password: 'securepass',
      });
      expect(localStorage.getItem('zoadex_token')).toBe('reg-token-456');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getMe', () => {
    it('returns user when token is valid', async () => {
      localStorage.setItem('zoadex_token', 'valid-token');
      mockedApi.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getMe();

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('throws when API returns error', async () => {
      mockedApi.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      await expect(authService.getMe()).rejects.toBeDefined();
    });
  });

  describe('logout', () => {
    it('clears localStorage', () => {
      localStorage.setItem('zoadex_token', 'some-token');

      authService.logout();

      expect(localStorage.getItem('zoadex_token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns stored token', () => {
      localStorage.setItem('zoadex_token', 'my-token');

      expect(authService.getToken()).toBe('my-token');
    });

    it('returns null when no token stored', () => {
      expect(authService.getToken()).toBeNull();
    });
  });
});
