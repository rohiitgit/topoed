import { create } from 'zustand';
import { User } from '../types';
import { onAuthStateChange, getCurrentUser, signOutUser } from '../services/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initialize: () => {
    onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser();
        set({ user: userData, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  logout: async () => {
    await signOutUser();
    set({ user: null, isAuthenticated: false });
  },
}));