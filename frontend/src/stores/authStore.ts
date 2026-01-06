import { create } from 'zustand';

interface User {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  exp: number;
  heroClassId?: string;
  heroAvatarUrl?: string;
  questMode?: {
    mode: string;
    name: string;
    description: string;
  };
  questionCount?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  fetchUser: async () => {
    const token = get().accessToken;
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isAuthenticated: true });
      } else {
        // If token is invalid, logout
        if (response.status === 401) {
          get().logout();
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  }
}));
