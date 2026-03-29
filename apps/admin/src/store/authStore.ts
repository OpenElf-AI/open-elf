import { create } from 'zustand';
import { adminApi } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('admin_token'),
  user: localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')!) : null,
  login: async (username: string, password: string) => {
    try {
      const response = await adminApi.login(username, password);
      if (response.data.code === 0) {
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.data.admin));
        set({ isAuthenticated: true, user: response.data.data.admin });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_info');
    set({ isAuthenticated: false, user: null });
  },
}));
