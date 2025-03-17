import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "./ResetPasswordForm";
import { useAuthStore } from "../../store/authStore";
import { createMockAuthState } from "../../utils/testUtils";
import { ErrorType } from "../../types/errors";
import * as ToastUtils from "../../utils/toast";

// Mock React Query
const mockMutateAsync = vi.fn();
const mockUseMutation = vi.fn().mockImplementation(({ onSuccess, onError }) => {
  // Store callback references for testing
  if (onSuccess) globalThis.mockOnSuccess = onSuccess;
  if (onError) globalThis.mockOnError = onError;

  return {
    mutateAsync: mockMutateAsync,
    isPending: false,
  };
});

vi.mock("@tanstack/react-query", () => ({
  useMutation: (options) => mockUseMutation(options),
}));

// Mock the Zustand store
vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock the auth service
vi.mock("../../services/api/authService", () => ({
  default: {
    resetPassword: vi.fn(),
  },
}));

// Mock the toast utilities
vi.mock("../../utils/toast", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

// Mock the hook form errors helper
const mockHandleFormError = vi.fn().mockImplementation((error) => {
  // If it's an invalid token error, return that type so component can handle it
  if (error.type === ErrorType.AUTH_INVALID_RESET_TOKEN) {
    return error.type;
  }
  return null;
});

vi.mock("../../hooks/useFormError", () => ({
  useFormError: () => ({
    formError: null,
    handleFormError: mockHandleFormError,
    clearFormError: vi.fn(),
  }),
}));

describe("ResetPasswordForm", () => {
  // Setup variables
  const mockClearError = vi.fn();
  const mockSetError = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnInvalidToken = vi.fn();
  const mockToken = "valid-reset-token-123";

  // Setup for manually triggering callbacks
  globalThis.mockOnSuccess = null;
  globalThis.mockOnError = null;

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset global callbacks
    globalThis.mockOnSuccess = null;
    globalThis.mockOnError = null;

    // Mock auth store with default state
    const mockState = createMockAuthState({
      clearError: mockClearError,
      setError: mockSetError,
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
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
    mockMutateAsync.mockResolvedValueOnce("Password reset successfully");

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

    // Verify mutateAsync was called with correct arguments
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        token: mockToken,
        newPassword: "ValidPass123",
      });
    });

    // Trigger the success callback
    await waitFor(() => {
      if (globalThis.mockOnSuccess) {
        globalThis.mockOnSuccess("Password reset successfully");
      }
    });

    await waitFor(() => {
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Password reset successfully"
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("shows loading state when submitting", () => {
    // Override React Query mock for this test
    mockUseMutation.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
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
    const invalidTokenError = {
      type: ErrorType.AUTH_INVALID_RESET_TOKEN,
      message: "Invalid or expired reset token",
    };
    mockMutateAsync.mockRejectedValueOnce(invalidTokenError);

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

    // The mockHandleFormError function will automatically trigger mockOnInvalidToken
    // when it detects an ERROR_AUTH_INVALID_RESET_TOKEN

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(invalidTokenError);
      }
    });

    // Verify error handling
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(invalidTokenError);
      expect(ToastUtils.toastError).toHaveBeenCalledWith(
        "Invalid or expired reset token"
      );
      expect(mockOnInvalidToken).toHaveBeenCalled();
    });
  });

  it("handles generic error", async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    // Setup generic error
    const serverError = {
      type: ErrorType.API_SERVER_ERROR,
      message: "Server error occurred",
    };
    mockMutateAsync.mockRejectedValueOnce(serverError);

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

    // Manually trigger the onError callback to simulate what happens in the component
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(serverError);
      }
    });

    // Verify error handling
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(serverError);
      expect(ToastUtils.toastError).toHaveBeenCalledWith(
        "Server error occurred"
      );
      expect(mockOnInvalidToken).not.toHaveBeenCalled(); // Should not trigger invalid token callback
    });
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
    expect(mockClearError).toHaveBeenCalled();
  });
});
