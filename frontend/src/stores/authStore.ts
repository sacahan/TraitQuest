import { create } from 'zustand';

interface User {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  exp: number;
  heroClassId?: string;
  heroAvatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, userData) => {
    localStorage.setItem('token', token);
    set({ accessToken: token, user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
