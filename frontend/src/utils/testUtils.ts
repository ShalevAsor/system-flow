// frontend/src/utils/testUtils.ts
import { vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a mock auth state for testing
 */
export const createMockAuthState = (overrides = {}) => ({
  isAuthenticated: false,
  isLoading: false,
  token: null,
  error: null,
  user: null,
  isEmailVerified: false,
  isRegistered: false,
  showVerificationAlert: false,

  // Auth actions
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  resetPassword: vi.fn(),

  // State setters
  setIsAuthenticated: vi.fn(),
  setIsLoading: vi.fn(),
  setToken: vi.fn(),
  setError: vi.fn(),
  setUser: vi.fn(),
  setIsEmailVerified: vi.fn(),
  setIsRegistered: vi.fn(),
  setShowVerificationAlert: vi.fn(),
  clearError: vi.fn(),

  ...overrides,
});

/**
 * Creates a test query client for React Query tests
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // cacheTime is now gcTime in React Query v5
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * Creates a mock API response
 */
export const createApiResponse = <T>(data: T, message = "Success") => ({
  data: {
    success: true,
    message,
    data,
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {},
});

/**
 * Creates a mock API error response
 */
export const createApiErrorResponse = (
  status = 400,
  message = "Error",
  errors?: Record<string, string>
) => ({
  response: {
    data: {
      success: false,
      message,
      errors,
    },
    status,
    statusText: status === 400 ? "Bad Request" : "Error",
    headers: {},
    config: {},
  },
});
