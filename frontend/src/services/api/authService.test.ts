// frontend/src/services/api/authService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import authService, {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  MessageResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
} from "./authService";
import apiClient from "./apiClient";

// Create a mock for Axios
const mockAxios = new MockAdapter(apiClient);

describe("authService", () => {
  // Sample user data for testing
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    token: "mock-token-12345",
    isEmailVerified: true,
  };

  const mockAuthResponse: AuthResponse = {
    success: true,
    message: "Success",
    data: mockUser,
  };

  const mockMessageResponse: MessageResponse = {
    success: true,
    message: "Operation successful",
    data: null,
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockAxios.reset();
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

    it("should handle registration of an unverified user", async () => {
      // Setup mock response with a registered but unverified user
      const unverifiedUser = {
        ...mockUser,
        isEmailVerified: false,
      };

      mockAxios.onPost("/auth/register").reply(200, {
        success: true,
        message: "Registration successful, please verify your email",
        data: unverifiedUser,
      });

      // Call the method
      const result = await authService.register(registerData);

      // Verify the result includes the unverified flag
      expect(result.isEmailVerified).toBe(false);
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

  describe("verifyEmail", () => {
    const verificationToken = "email-verification-token-123";

    it("should make a GET request to /auth/verify-email with token", async () => {
      // Setup mock response
      mockAxios
        .onGet(`/auth/verify-email?token=${verificationToken}`)
        .reply(200, mockMessageResponse);

      // Call the method
      const result = await authService.verifyEmail(verificationToken);

      // Verify the result
      expect(result).toEqual(mockMessageResponse.message);
    });

    it("should throw an error when verification fails", async () => {
      // Setup mock failure response
      mockAxios
        .onGet(`/auth/verify-email?token=${verificationToken}`)
        .reply(400, {
          success: false,
          message: "Invalid or expired verification token",
        });

      // Expect the method to throw
      await expect(
        authService.verifyEmail(verificationToken)
      ).rejects.toThrow();
    });
  });

  describe("resendVerificationEmail", () => {
    const resendData: ResendVerificationRequest = {
      email: "test@example.com",
    };

    it("should make a POST request to /auth/resend-verification with email", async () => {
      // Setup mock response
      mockAxios
        .onPost("/auth/resend-verification")
        .reply(200, mockMessageResponse);

      // Call the method
      const result = await authService.resendVerificationEmail(resendData);

      // Verify the result
      expect(result).toEqual(mockMessageResponse.message);
    });

    it("should throw an error when resend verification fails", async () => {
      // Setup mock failure response
      mockAxios.onPost("/auth/resend-verification").reply(404, {
        success: false,
        message: "User not found",
      });

      // Expect the method to throw
      await expect(
        authService.resendVerificationEmail(resendData)
      ).rejects.toThrow();
    });
  });

  describe("requestPasswordReset", () => {
    const resetRequest: RequestPasswordResetRequest = {
      email: "test@example.com",
    };

    it("should make a POST request to /auth/forgot-password with email", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/forgot-password").reply(200, mockMessageResponse);

      // Call the method
      const result = await authService.requestPasswordReset(resetRequest);

      // Verify the result
      expect(result).toEqual(mockMessageResponse.message);
    });

    it("should throw an error when password reset request fails", async () => {
      // Setup mock failure response
      mockAxios.onPost("/auth/forgot-password").reply(404, {
        success: false,
        message: "User not found",
      });

      // Expect the method to throw
      await expect(
        authService.requestPasswordReset(resetRequest)
      ).rejects.toThrow();
    });
  });

  describe("resetPassword", () => {
    const resetData: ResetPasswordRequest = {
      token: "password-reset-token-123",
      newPassword: "newSecurePassword456",
    };

    it("should make a POST request to /auth/reset-password with token and new password", async () => {
      // Setup mock response
      mockAxios.onPost("/auth/reset-password").reply(200, mockMessageResponse);

      // Call the method
      const result = await authService.resetPassword(resetData);

      // Verify the result
      expect(result).toEqual(mockMessageResponse.message);
    });

    it("should throw an error when password reset fails", async () => {
      // Setup mock failure response
      mockAxios.onPost("/auth/reset-password").reply(400, {
        success: false,
        message: "Invalid or expired reset token",
      });

      // Expect the method to throw
      await expect(authService.resetPassword(resetData)).rejects.toThrow();
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
});
