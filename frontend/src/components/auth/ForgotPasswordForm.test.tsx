import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuthStore } from "../../store/authStore";
import { createMockAuthState } from "../../utils/testUtils";
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
    requestPasswordReset: vi.fn(),
  },
}));

// Mock the toast utilities
vi.mock("../../utils/toast", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

// Mock the hook form errors helper
const mockHandleFormError = vi.fn();
vi.mock("../../hooks/useFormError", () => ({
  useFormError: () => ({
    formError: null,
    handleFormError: mockHandleFormError,
    clearFormError: vi.fn(),
  }),
}));

describe("ForgotPasswordForm", () => {
  // Setup variables
  const mockClearError = vi.fn();
  const mockSetError = vi.fn();
  const mockOnSuccess = vi.fn();

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
  const renderForgotPasswordForm = () => {
    return render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);
  };

  it("renders the form fields correctly", () => {
    renderForgotPasswordForm();

    // Check for form elements
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" })
    ).toBeInTheDocument();
  });

  it("validates the email field correctly", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Try with invalid email
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and handles success", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    // Mock successful response
    mockMutateAsync.mockResolvedValueOnce("Password reset email sent");

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify mutateAsync was called with correct arguments
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });

    // Trigger success callback
    await waitFor(() => {
      if (globalThis.mockOnSuccess) {
        globalThis.mockOnSuccess("Password reset email sent", {
          email: "test@example.com",
        });
      }
    });

    // Verify success handlers were called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith("test@example.com");
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Password reset email sent successfully"
      );
    });
  });

  it("shows loading state when submitting", () => {
    // Override React Query mock for this test
    mockUseMutation.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    renderForgotPasswordForm();

    // Verify loading state is displayed
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Verify the button is disabled while loading
    const submitButton = screen.getByRole("button", { name: "Sending..." });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("handles API errors", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    // Setup error scenario
    const errorResponse = {
      type: "resource/not-found",
      message: "User not found with this email",
    };
    mockMutateAsync.mockRejectedValueOnce(errorResponse);

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Fill the form with valid data
    await user.type(emailInput, "nonexistent@example.com");

    // Submit the form
    await user.click(submitButton);

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(errorResponse);
      }
    });

    // Verify error handling
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorResponse);
    });
  });

  it("clears errors when form is submitted", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify errors were cleared
    expect(mockClearError).toHaveBeenCalled();
  });
});
