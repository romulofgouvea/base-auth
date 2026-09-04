import { HttpClient, apiClient } from './ApiClient';
import { STORAGE_KEYS } from '../constants/storage';
import type { User } from '../models/UserModel';
import type { TokenPair, AuthMeResponse } from '../models/AuthModel';

export class AuthService {
  private readonly apiClient: HttpClient;

  constructor(apiClient: HttpClient) {
    this.apiClient = apiClient;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUserFromToken(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);

      return {
        id: decoded.sub || decoded.id,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
      };
    } catch (error) {
      console.error('Failed to parse token', error);
      return null;
    }
  }

  async register(name: string, email: string, password: string): Promise<User> {
    return this.apiClient.post<User>('/auth/register', { email, name, password });
  }

  async login(email: string, password: string): Promise<TokenPair> {
    return this.apiClient.post<TokenPair>('/auth/login', { email, password });
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      await this.apiClient.post<void>('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  async logoutAll(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      await this.apiClient.post<void>('/auth/logout-all', { refreshToken });
    } catch (error) {
      console.error('Logout all failed', error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const refreshToken = this.getRefreshToken() || undefined;
    return this.apiClient.post<void>('/auth/change-password', { currentPassword, newPassword, refreshToken });
  }

  async getMe(): Promise<AuthMeResponse> {
    return this.apiClient.get<AuthMeResponse>('/auth/me');
  }
}

export const authService = new AuthService(apiClient);
