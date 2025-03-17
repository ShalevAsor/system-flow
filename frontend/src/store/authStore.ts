// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppError } from "../types/errors";

interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  error: AppError | null;

  // Actions
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: AppError | null) => void;
  setToken: (token: string | null) => void;

  // Auth operations
  login: (token: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      token: null,
      error: null,

      // Actions to update state
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setToken: (token) => set({ token }),

      // Auth operations
      login: (token) => {
        set({
          isAuthenticated: true,
          token,
          error: null,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
        });
        // We don't need to remove from localStorage directly anymore,
        // as the persist middleware will handle that
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // Name for localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }), // Persist both authentication state and token
    }
  )
);

// Export a helper function to get the token for API client
export const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
};
