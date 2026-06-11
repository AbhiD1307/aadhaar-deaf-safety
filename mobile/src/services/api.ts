import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string) =>
    request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),

  // Alerts
  getAlerts: (params?: { riskLevel?: string; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>(`/api/alerts${qs}`);
  },

  dismissAlert: (alertId: string) =>
    request(`/api/alerts/${alertId}/dismiss`, { method: 'POST' }),

  simulateAlert: (type: string, location?: string) =>
    request('/api/alerts/simulate', {
      method: 'POST',
      body: JSON.stringify({ type, location }),
    }),

  // Devices
  getDevices: () => request<any[]>('/api/devices'),
  updateDevice: (id: string, updates: any) =>
    request(`/api/devices/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  addDevice: (device: any) =>
    request('/api/devices', { method: 'POST', body: JSON.stringify(device) }),

  // User
  getUser: (id = 'user_demo') => request<any>(`/api/users/${id}`),
  updateSettings: (settings: any) =>
    request('/api/users/user_demo/settings', { method: 'PATCH', body: JSON.stringify(settings) }),
  addContact: (contact: any) =>
    request('/api/users/user_demo/contacts', { method: 'POST', body: JSON.stringify(contact) }),

  // SOS
  triggerSOS: (latitude?: number, longitude?: number) =>
    request('/api/sos/trigger', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, userId: 'user_demo' }),
    }),
};
