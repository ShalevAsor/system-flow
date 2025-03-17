// frontend/src/services/api/apiClient.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "./apiClient";
import { ErrorType } from "../../types/errors";
import * as authStore from "../../store/authStore";
import { createMockAuthState } from "../../utils/testUtils";

// Create a mock for Axios
const mockAxios = new MockAdapter(apiClient);

// Mock the Zustand store
vi.mock("../../store/authStore", async () => {
  const actual = await vi.importActual("../../store/authStore");
  return {
    ...actual,
    getAuthToken: vi.fn(),
    useAuthStore: {
      getState: vi.fn(),
    },
  };
});

describe("apiClient", () => {
  beforeEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();
  });

  describe("request interceptor", () => {
    it("should add auth token to headers if token exists", async () => {
      // Setup mock token
      const testToken = "test-token-1234";
      vi.mocked(authStore.getAuthToken).mockReturnValueOnce(testToken);

      // Setup mock response
      mockAxios.onGet("/test").reply((config) => {
        // Check if Authorization header was set correctly
        expect(config.headers?.Authorization).toBe(`Bearer ${testToken}`);
        return [200, { data: "success" }];
      });

      // Make request
      await apiClient.get("/test");

      // Verify getAuthToken was called
      expect(authStore.getAuthToken).toHaveBeenCalled();
    });

    it("should not add auth token to headers if token does not exist", async () => {
      // Setup getAuthToken to return null
      vi.mocked(authStore.getAuthToken).mockReturnValueOnce(null);

      // Setup mock response
      mockAxios.onGet("/test").reply((config) => {
        // Check that Authorization header wasn't set
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: "success" }];
      });

      // Make request
      await apiClient.get("/test");

      // Verify getAuthToken was called
      expect(authStore.getAuthToken).toHaveBeenCalled();
    });
  });

  describe("response interceptor", () => {
    it("should pass through successful responses", async () => {
      // Setup mock response
      const responseData = { data: "test data" };
      mockAxios.onGet("/success").reply(200, responseData);

      // Make request
      const response = await apiClient.get("/success");

      // Verify response data
      expect(response.data).toEqual(responseData);
    });

    it("should handle 401 unauthorized errors and call logout", async () => {
      // Setup mock response for unauthorized
      mockAxios.onGet("/secured").reply(401, {
        success: false,
        message: "Unauthorized",
      });

      // Mock logout function
      const mockLogout = vi.fn();
      const mockState = createMockAuthState({ logout: mockLogout });
      vi.mocked(authStore.useAuthStore.getState).mockReturnValue(mockState);

      // Make request that will fail
      try {
        await apiClient.get("/secured");
        expect(true).toBe(false); // Force test to fail
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.AUTH_UNAUTHORIZED);
        expect(error.message).toBe("Unauthorized");
        // Verify logout was called
        expect(mockLogout).toHaveBeenCalled();
      }
    });

    it("should handle 403 with unverified email correctly", async () => {
      // Setup mock response for forbidden due to unverified email
      mockAxios.onGet("/verified-only").reply(403, {
        success: false,
        message: "Email not verified",
      });

      // Make request that will fail
      try {
        await apiClient.get("/verified-only");
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.AUTH_EMAIL_UNVERIFIED);
        expect(error.message).toBe("Email not verified");
      }
    });

    it("should handle 403 forbidden without email verification message", async () => {
      // Setup mock response for general forbidden
      mockAxios.onGet("/forbidden").reply(403, {
        success: false,
        message: "Access denied",
      });

      // Make request that will fail
      try {
        await apiClient.get("/forbidden");
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.AUTH_FORBIDDEN);
        expect(error.message).toBe("Access denied");
      }
    });

    it("should handle 400 with user already exists message", async () => {
      // Setup mock response for email already in use
      mockAxios.onPost("/register").reply(400, {
        success: false,
        message: "User already exists with this email",
      });

      // Make request that will fail
      try {
        await apiClient.post("/register", { email: "test@example.com" });
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.AUTH_EMAIL_ALREADY_IN_USE);
        expect(error.message).toBe("User already exists with this email");
      }
    });

    it("should handle 400 with invalid reset token message", async () => {
      // Setup mock response for invalid reset token
      mockAxios.onPost("/reset-password").reply(400, {
        success: false,
        message: "Invalid or expired reset link",
      });

      // Make request that will fail
      try {
        await apiClient.post("/reset-password", { token: "invalid-token" });
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.AUTH_INVALID_RESET_TOKEN);
        expect(error.message).toBe("Invalid or expired reset link");
      }
    });

    it("should handle 400 with incorrect current password", async () => {
      // Setup mock response for incorrect password
      mockAxios.onPost("/change-password").reply(400, {
        success: false,
        message: "Incorrect current password",
      });

      // Make request that will fail
      try {
        await apiClient.post("/change-password", {
          currentPassword: "wrong",
          newPassword: "newPassword123",
        });
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.PROFILE_INCORRECT_PASSWORD);
        expect(error.message).toBe("Incorrect current password");
      }
    });

    it("should handle 400 with validation errors", async () => {
      const validationErrors = {
        email: "Invalid email format",
        password: "Password too short",
      };

      // Setup mock response for validation error
      mockAxios.onPost("/validate").reply(400, {
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });

      // Make request that will fail
      try {
        await apiClient.post("/validate", { email: "invalid" });
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
        expect(error.message).toBe("Validation failed");
        expect(error.fieldErrors).toEqual(validationErrors);
      }
    });

    it("should handle network connection errors", async () => {
      // Setup mock response for network error
      mockAxios.onGet("/connection-test").networkError();

      // Make request that will fail
      try {
        await apiClient.get("/connection-test");
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.API_CONNECTION_ERROR);
        expect(error.message).toBe("Could not connect to server");
      }
    });

    it("should handle timeout errors", async () => {
      // Setup mock response for timeout
      mockAxios.onGet("/timeout-test").timeout();

      // Make request that will fail
      try {
        await apiClient.get("/timeout-test");
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.API_TIMEOUT_ERROR);
        expect(error.message).toBe("Request timed out");
      }
    });

    it("should handle server errors", async () => {
      // Setup mock response for server error
      mockAxios.onGet("/server-error").reply(500, {
        success: false,
        message: "Internal server error",
      });

      // Make request that will fail
      try {
        await apiClient.get("/server-error");
        expect(true).toBe(false); // Force test to fail if we get here
      } catch (error) {
        // Verify the error type is correct
        expect(error.type).toBe(ErrorType.API_SERVER_ERROR);
        expect(error.message).toBe("Internal server error");
      }
    });
  });
});
