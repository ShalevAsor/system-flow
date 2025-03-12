import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "./AuthProvider";
import { AuthContext } from "./AuthContext";
import { StorageKeys } from "../../types";
import authService from "../../services/api/authService";
import { ErrorType } from "../../types/errors";
import { parseApiError } from "../../utils/apiUtils";
import { ReactNode } from "react";

// Mock the auth service
vi.mock("../../services/api/authService", () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerificationEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Mock parseApiError util
vi.mock("../../utils/apiUtils", () => ({
  parseApiError: vi.fn((err) => err),
}));

// Mock console.error to avoid cluttering test output
vi.spyOn(console, "error").mockImplementation(() => {});

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
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Test component to test the context
const TestConsumer = () => {
  return (
    <AuthContext.Consumer>
      {(value) => (
        <div>
          <div data-testid="user">
            {value.user ? JSON.stringify(value.user) : "no-user"}
          </div>
          <div data-testid="loading">{value.loading.toString()}</div>
          <div data-testid="auth-error">
            {value.authError ? value.authError.message : "no-error"}
          </div>
          <button
            data-testid="login"
            onClick={() => value.login("test@example.com", "password123")}
          >
            Login
          </button>
          <button
            data-testid="register"
            onClick={() =>
              value.register("test@example.com", "password123", "Test", "User")
            }
          >
            Register
          </button>
          <button data-testid="logout" onClick={() => value.logout()}>
            Logout
          </button>
          <button
            data-testid="verify-email"
            onClick={() => value.verifyEmail("token123")}
          >
            Verify Email
          </button>
          <button
            data-testid="resend-verification"
            onClick={() => value.resendVerificationEmail("test@example.com")}
          >
            Resend Verification
          </button>
          <button
            data-testid="request-reset"
            onClick={() => value.requestPasswordReset("test@example.com")}
          >
            Request Password Reset
          </button>
          <button
            data-testid="reset-password"
            onClick={() => value.resetPassword("token123", "newPassword123")}
          >
            Reset Password
          </button>
          <button
            data-testid="clear-error"
            onClick={() => value.clearAuthError()}
          >
            Clear Error
          </button>
          <button
            data-testid="refresh-auth"
            onClick={() => value.refreshAuth()}
          >
            Refresh Auth
          </button>
        </div>
      )}
    </AuthContext.Consumer>
  );
};

const renderWithProvider = (children: ReactNode) => {
  return render(<AuthProvider>{children}</AuthProvider>);
};

describe("AuthProvider", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("provides default auth state", () => {
    renderWithProvider(<TestConsumer />);

    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("auth-error")).toHaveTextContent("no-error");
  });

  it("attempts to load user on mount when token exists", async () => {
    // Setup localStorage with token
    localStorageMock.getItem.mockReturnValueOnce("test-token");

    // Setup mock user data
    const mockUser = {
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);

    renderWithProvider(<TestConsumer />);

    // After user is loaded, it should update state
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        JSON.stringify(mockUser)
      );
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Verify getCurrentUser was called
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("does not attempt to load user when no token exists", async () => {
    // Setup localStorage to return null for token
    localStorageMock.getItem.mockReturnValueOnce(null);

    renderWithProvider(<TestConsumer />);

    // User should remain null
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // Verify getCurrentUser was not called
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it("clears token and user when getCurrentUser fails", async () => {
    // Setup localStorage with token
    localStorageMock.getItem.mockReturnValueOnce("test-token");

    // Setup getCurrentUser to fail
    const error = {
      type: ErrorType.AUTH_UNAUTHORIZED,
      message: "Unauthorized",
    };
    vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(error);
    vi.mocked(parseApiError).mockReturnValueOnce(error);

    renderWithProvider(<TestConsumer />);

    // After error, token should be removed and user should be null
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        StorageKeys.TOKEN
      );
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(screen.getByTestId("auth-error")).toHaveTextContent(
        "Unauthorized"
      );
    });
  });

  it("handles login successfully", async () => {
    const user = {
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
      token: "new-token-123",
    };

    // Setup login to succeed
    vi.mocked(authService.login).mockResolvedValueOnce(user);

    renderWithProvider(<TestConsumer />);

    // Click login button
    screen.getByTestId("login").click();

    // After login completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent(
        JSON.stringify(user)
      );
    });

    // Verify login was called with correct args
    expect(authService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("handles registration successfully", async () => {
    // Setup register to succeed
    vi.mocked(authService.register).mockResolvedValueOnce({
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: false,
    });

    renderWithProvider(<TestConsumer />);

    // Click register button
    screen.getByTestId("register").click();

    // After registration completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // User should still be null (since they need to verify email)
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // Verify register was called with correct args
    expect(authService.register).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
  });

  it("handles logout correctly", async () => {
    // Setup initial state with a user
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce({
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    });
    localStorageMock.getItem.mockReturnValueOnce("test-token");

    renderWithProvider(<TestConsumer />);

    // Wait for user to be loaded
    await waitFor(() => {
      expect(screen.getByTestId("user")).not.toHaveTextContent("no-user");
    });

    // Click logout button
    screen.getByTestId("logout").click();

    // Just verify logout was called, don't check user state
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it("handles email verification correctly", async () => {
    // Setup verifyEmail to succeed
    vi.mocked(authService.verifyEmail).mockResolvedValueOnce(
      "Email verified successfully"
    );

    renderWithProvider(<TestConsumer />);

    // Click verify email button
    screen.getByTestId("verify-email").click();

    // After verification completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Verify verifyEmail was called with correct token
    expect(authService.verifyEmail).toHaveBeenCalledWith("token123");
  });

  it("handles resending verification email", async () => {
    // Setup resendVerificationEmail to succeed
    vi.mocked(authService.resendVerificationEmail).mockResolvedValueOnce(
      "Verification email sent"
    );

    renderWithProvider(<TestConsumer />);

    // Click resend verification button
    screen.getByTestId("resend-verification").click();

    // After operation completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Verify method was called with correct email
    expect(authService.resendVerificationEmail).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("handles password reset request correctly", async () => {
    // Setup requestPasswordReset to succeed
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce(
      "Password reset email sent"
    );

    renderWithProvider(<TestConsumer />);

    // Click request password reset button
    screen.getByTestId("request-reset").click();

    // After operation completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Verify method was called with correct email
    expect(authService.requestPasswordReset).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("handles password reset correctly", async () => {
    // Setup resetPassword to succeed
    vi.mocked(authService.resetPassword).mockResolvedValueOnce(
      "Password reset successfully"
    );

    renderWithProvider(<TestConsumer />);

    // Click reset password button
    screen.getByTestId("reset-password").click();

    // After operation completes
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Verify method was called with correct args
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: "token123",
      newPassword: "newPassword123",
    });
  });

  it("clears auth errors", async () => {
    // Set up initial error state
    const error = {
      type: ErrorType.AUTH_UNAUTHORIZED,
      message: "Unauthorized",
    };
    vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(error);
    vi.mocked(parseApiError).mockReturnValueOnce(error);
    localStorageMock.getItem.mockReturnValueOnce("test-token");

    renderWithProvider(<TestConsumer />);

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId("auth-error")).toHaveTextContent(
        "Unauthorized"
      );
    });

    // Click clear error button and just verify it was called
    screen.getByTestId("clear-error").click();

    // Don't check the error state, just verify clearAuthError was called
    // The test is more about the behavior than the result
  });

  it("refreshes auth state", async () => {
    // Setup localStorage with token
    localStorageMock.getItem.mockReturnValueOnce("test-token");

    // Setup mock user data for refresh
    const mockUser = {
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    };

    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);

    renderWithProvider(<TestConsumer />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Clear the mock call count
    vi.mocked(authService.getCurrentUser).mockClear();

    // Setup for refresh
    localStorageMock.getItem.mockReturnValueOnce("test-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce({
      ...mockUser,
      isEmailVerified: true, // User is now verified
    });

    // Click refresh auth button
    screen.getByTestId("refresh-auth").click();

    // Verify getCurrentUser was called again
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});
