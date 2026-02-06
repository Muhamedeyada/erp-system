import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, setAuthErrorHandler } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  registerCompany: (data: {
    companyName: string;
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'erp_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    tenantId: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      tenantId: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    try {
      const { data } = await authApi.me();
      const user = data as User;
      setState({
        user,
        token,
        tenantId: user.tenantId,
        role: user.role,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({
        user: null,
        token: null,
        tenantId: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    const { user, token } = data;
    localStorage.setItem(TOKEN_KEY, token);
    const u = user as User;
    setState({
      user: u,
      token,
      tenantId: u.tenantId,
      role: u.role,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const registerCompany = useCallback(
    async (data: { companyName: string; email: string; password: string; name?: string }) => {
      const { data: res } = await authApi.registerCompany(data);
      const { user, token } = res as { user: User; token: string };
      localStorage.setItem(TOKEN_KEY, token);
      setState({
        user,
        token,
        tenantId: user.tenantId,
        role: user.role,
        isLoading: false,
        isAuthenticated: true,
      });
    },
    [],
  );

  useEffect(() => {
    setAuthErrorHandler(logout);
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    ...state,
    login,
    registerCompany,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
