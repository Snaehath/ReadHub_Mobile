import { create } from "zustand";
import { User } from "../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string | null) => void;
  setGuest: (isGuest: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isGuest: false,
  setUser: (user) => set({ user }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  setToken: (token) => set({ token, isGuest: false }),
  setGuest: (isGuest) => set({ isGuest }),
  logout: () => set({ user: null, token: null, isGuest: false }),
}));
