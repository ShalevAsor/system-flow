// frontend/src/services/api/authService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import authService, {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  AuthResponse,
} from "./authService";
import apiClient from "./apiClient";

// Create a mock for Axios
const mockAxios = new MockAdapter(apiClient);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Replace the real localStorage with our mock
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("authService", () => {
  // Sample user data for testing
  const mockUser: UserResponse = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    token: "mock-token-12345",
  };

  const mockAuthResponse: AuthResponse = {
    success: true,
    message: "Success",
    data: mockUser,
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockAxios.reset();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("login", () => {
    const loginCredentials: LoginRequest = {
      email: "test@example.com",
      password: "password123",
    };

    it("should make a POST request to /auth/login with credentials", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/login").reply(200, mockAuthResponse);

      // Call the method
      const result = await authService.login(loginCredentials);

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should store token in localStorage upon successful login", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/login").reply(200, mockAuthResponse);

      // Call the method
      await authService.login(loginCredentials);

      // Verify localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        mockUser.token
      );
    });

    it("should throw an error when login fails", async () => {
      // Setup mock failure response
      mockAxios.onPost("/auth/login").reply(401, {
        success: false,
        message: "Invalid credentials",
      });

      // Expect the method to throw
      await expect(authService.login(loginCredentials)).rejects.toThrow();
    });
  });

  describe("register", () => {
    const registerData: RegisterRequest = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    };

    it("should make a POST request to /auth/register with user data", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/register").reply(200, mockAuthResponse);

      // Call the method
      const result = await authService.register(registerData);

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should store token in localStorage upon successful registration", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/register").reply(200, mockAuthResponse);

      // Call the method
      await authService.register(registerData);

      // Verify localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        mockUser.token
      );
    });

    it("should throw an error when registration fails", async () => {
      // Setup mock failure response
      mockAxios.onPost("/auth/register").reply(400, {
        success: false,
        message: "Email already in use",
      });

      // Expect the method to throw
      await expect(authService.register(registerData)).rejects.toThrow();
    });
  });

  describe("getCurrentUser", () => {
    it("should make a GET request to /auth/me", async () => {
      // Setup mock response
      mockAxios.onGet("/auth/me").reply(200, mockAuthResponse);

      // Call the method
      const result = await authService.getCurrentUser();

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should throw an error when getting current user fails", async () => {
      // Setup mock failure response
      mockAxios.onGet("/auth/me").reply(401, {
        success: false,
        message: "Unauthorized",
      });

      // Expect the method to throw
      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe("logout", () => {
    it("should remove token from localStorage", () => {
      // Setup localStorage with a token
      localStorage.setItem("token", "some-token");

      // Call the method
      authService.logout();

      // Verify localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });
});
