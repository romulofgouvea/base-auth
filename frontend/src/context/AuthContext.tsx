import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/AuthService';
import { profileService } from '../services/ProfileService';
import { ApiError } from '../services/ApiClient';
import { STORAGE_KEYS } from '../constants/storage';
import type { User } from '../models/UserModel';

export interface LoginResult {
  success: boolean;
  error?: string;
  validationErrors?: { context: string; message: string }[];
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  logoutAll: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permissionKey: string | string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fetchAndApplyUserDetails = async (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  try {
    const [profile, me] = await Promise.all([profileService.get(), authService.getMe()]);

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Usuário';

    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: fullName,
            email: profile.email,
            avatar: profile.avatar,
            roles: me.roles,
            permissions: me.permissions,
          }
        : null,
    );

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to fetch user data', err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getAccessToken();
      if (token) {
        const userData = authService.getUserFromToken(token);
        if (userData) {
          try {
            const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (storedProfile) {
              const parsed = JSON.parse(storedProfile);
              userData.name = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || userData.name;
              userData.avatar = parsed.avatar;
            }
          } catch {
            /* ignore malformed cache */
          }

          setUser(userData);
          setIsAuthenticated(true);

          await fetchAndApplyUserDetails(setUser);
        } else {
          authService.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    const handleLogoutEvent = () => {
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { accessToken, refreshToken } = await authService.login(email, password);
      authService.setTokens(accessToken, refreshToken);

      const userData = authService.getUserFromToken(accessToken);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);

        await fetchAndApplyUserDetails(setUser);

        return { success: true };
      } else {
        throw new Error('Token inválido');
      }
    } catch (error: unknown) {
      const apiErr = error instanceof ApiError ? error : undefined;
      return {
        success: false,
        error: apiErr?.message ?? (error instanceof Error ? error.message : 'Login failed'),
        validationErrors: apiErr?.errors,
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<LoginResult> => {
    try {
      await authService.register(name, email, password);

      return await login(email, password);
    } catch (error: unknown) {
      const apiErr = error instanceof ApiError ? error : undefined;
      return {
        success: false,
        error: apiErr?.message ?? (error instanceof Error ? error.message : 'Registration failed'),
        validationErrors: apiErr?.errors,
      };
    }
  };

  const logout = () => {
    const token = authService.getAccessToken();
    if (token) {
      authService.logout();
    }
    authService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logoutAll = async () => {
    await authService.logoutAll();
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      const newUser = prev ? { ...prev, ...userData } : null;
      if (newUser) {
        try {
          const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            if (userData.avatar !== undefined) profile.avatar = userData.avatar;
            if (userData.name !== undefined) {
              const parts = userData.name.split(' ');
              profile.firstName = parts[0];
              profile.lastName = parts.slice(1).join(' ');
            }
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
          }
        } catch {
          /* ignore malformed cache */
        }
      }
      return newUser;
    });
  };

  const hasPermission = (permissionKey: string | string[]): boolean => {
    if (!user || !user.permissions) return false;
    if (Array.isArray(permissionKey)) {
      return permissionKey.some((key) => user.permissions!.includes(key));
    }
    return user.permissions.includes(permissionKey);
  };

  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissionKeys.every((key) => user.permissions!.includes(key));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, register, logout, logoutAll, updateUser, hasPermission, hasAllPermissions }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
