import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../api';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      isLoggedIn: false,
      setUser: user =>
        set({
          user,
          isLoggedIn: !!user,
        }),
      login: user =>
        set({
          user,
          isLoggedIn: true,
        }),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: updates =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'open-elf-user-storage',
    }
  )
);
