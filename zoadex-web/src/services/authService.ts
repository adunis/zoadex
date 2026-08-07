import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/user';

export const authService = {
  async login(data: LoginRequest): Promise<User> {
    // Step 1: Authenticate
    let token: string;
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      token = response.data.token;
    } catch (error: any) {
      // Login itself failed - throw with backend message
      const message = error.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    }

    // Step 2: Store token
    localStorage.setItem('zoadex_token', token);

    // Step 3: Fetch profile (if this fails, user is still logged in)
    try {
      const meResponse = await api.get<User>('/users/me');
      return meResponse.data;
    } catch {
      // Token is stored, return minimal user from login response
      return {
        id: '',
        username: data.email.split('@')[0],
        email: data.email,
        plan: 'FREE',
        activeRegionId: null,
        activeRegionName: null,
        totalSightings: 0,
        uniqueSpeciesDiscovered: 0,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async register(data: RegisterRequest): Promise<User> {
    // Step 1: Register
    let token: string;
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      token = response.data.token;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }

    // Step 2: Store token
    localStorage.setItem('zoadex_token', token);

    // Step 3: Fetch profile (if this fails, user is still registered)
    try {
      const meResponse = await api.get<User>('/users/me');
      return meResponse.data;
    } catch {
      return {
        id: '',
        username: data.username,
        email: data.email,
        plan: 'FREE',
        activeRegionId: null,
        activeRegionName: null,
        totalSightings: 0,
        uniqueSpeciesDiscovered: 0,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('zoadex_token');
  },

  getToken(): string | null {
    return localStorage.getItem('zoadex_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('zoadex_token');
  },
};
