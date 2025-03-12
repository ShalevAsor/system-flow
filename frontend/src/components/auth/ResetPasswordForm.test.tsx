import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "./ResetPasswordForm";
import * as AuthHook from "../../hooks/useAuth";
import { ErrorType } from "../../types/errors";
import * as ToastUtils from "../../utils/toast";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth", async () => {
  const actual = await vi.importActual("../../hooks/useAuth");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock the toast utilities
vi.mock("../../utils/toast", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

describe("ResetPasswordForm", () => {
  // Setup variables
  const mockResetPassword = vi.fn();
  const mockClearAuthError = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnInvalidToken = vi.fn();
  const mockToken = "valid-reset-token-123";

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      resetPassword: mockResetPassword,
      loading: false,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });
  });

  // Helper function to render the component
  const renderResetPasswordForm = () => {
    return render(
      <ResetPasswordForm
        token={mockToken}
        onSuccess={mockOnSuccess}
        onInvalidToken={mockOnInvalidToken}
      />
    );
  };

  it("renders the form fields correctly", () => {
    renderResetPasswordForm();

    // Use exact text matching instead of regex because confirm new password includes new password
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("validates the password fields correctly", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Get form elements
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Try to submit without filling the form
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please confirm your password/i)
      ).toBeInTheDocument();
    });

    // Try with password that doesn't meet complexity requirements
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });

    // Try with passwords that don't match
    await user.clear(passwordInput);
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "DifferentPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and handles success", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Setup success response
    mockResetPassword.mockResolvedValueOnce("Password reset successfully");

    // Get form elements
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Fill the form with valid data
    await user.type(passwordInput, "ValidPass123");
    await user.type(confirmPasswordInput, "ValidPass123");

    // Submit the form
    await user.click(submitButton);

    // Verify resetPassword was called with correct arguments
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(mockToken, "ValidPass123");
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Password reset successfully"
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("shows loading state when submitting", () => {
    // Set loading state to true
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      resetPassword: mockResetPassword,
      loading: true,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });

    renderResetPasswordForm();

    // Verify loading state is displayed
    expect(screen.getByText(/resetting password.../i)).toBeInTheDocument();

    // Verify the button is disabled while loading
    const submitButton = screen.getByRole("button", {
      name: /resetting password.../i,
    });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("handles invalid token error", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Setup invalid token error
    mockResetPassword.mockRejectedValueOnce({
      type: ErrorType.AUTH_INVALID_RESET_TOKEN,
      message: "Invalid or expired reset token",
    });

    // Get form elements
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Fill the form with valid data
    await user.type(passwordInput, "ValidPass123");
    await user.type(confirmPasswordInput, "ValidPass123");

    // Submit the form
    await user.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(mockOnInvalidToken).toHaveBeenCalled();
      expect(ToastUtils.toastError).toHaveBeenCalledWith(
        "Invalid or expired reset token"
      );
    });
  });

  it("handles generic error", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Setup generic error
    mockResetPassword.mockRejectedValueOnce({
      type: ErrorType.API_SERVER_ERROR,
      message: "Server error occurred",
    });

    // Get form elements
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Fill the form with valid data
    await user.type(passwordInput, "ValidPass123");
    await user.type(confirmPasswordInput, "ValidPass123");

    // Submit the form
    await user.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
      expect(ToastUtils.toastError).toHaveBeenCalledWith(
        "Server error occurred"
      );
      expect(mockOnInvalidToken).not.toHaveBeenCalled(); // Should not trigger invalid token callback
    });
  });

  it("cleans up errors when unmounting", () => {
    const { unmount } = renderResetPasswordForm();

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("clears errors when form is submitted", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Get form elements
    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Fill the form with valid data
    await user.type(passwordInput, "ValidPass123");
    await user.type(confirmPasswordInput, "ValidPass123");

    // Submit the form
    await user.click(submitButton);

    // Verify errors were cleared
    expect(mockClearAuthError).toHaveBeenCalled();
  });
});
