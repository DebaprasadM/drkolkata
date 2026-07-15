import api from './api';

export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export async function checkSessions(email: string) {
  const { data } = await api.post('/auth/check-sessions', { email });
  return data.data as { hasActiveSession: boolean; deviceCount: number };
}

export async function switchClinic(clinicId?: string) {
  const { data } = await api.post('/auth/switch-clinic', { clinicId });
  const { accessToken, refreshToken, user } = data.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  return user;
}
