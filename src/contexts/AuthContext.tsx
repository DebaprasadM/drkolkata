'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getAccessToken, clearAuthData, switchClinic as apiSwitchClinic } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchClinic: (clinicId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.get('/auth/profile')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        clearAuthData();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    toast({ title: 'Welcome back', description: `Logged in as ${userData.role.replace('_', ' ')}`, variant: 'success' });
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    router.push('/login');
  }, [router]);

  const switchClinicCtx = useCallback(async (clinicId?: string) => {
    const userData = await apiSwitchClinic(clinicId);
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, switchClinic: switchClinicCtx }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
