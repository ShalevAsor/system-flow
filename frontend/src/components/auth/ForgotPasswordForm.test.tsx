import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "./ForgotPasswordForm";
import * as AuthHook from "../../hooks/useAuth";
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

describe("ForgotPasswordForm", () => {
  // Setup variables
  const mockRequestPasswordReset = vi.fn();
  const mockClearAuthError = vi.fn();
  const mockOnSuccess = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
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
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
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

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify resetPassword was called with correct arguments
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith("test@example.com");
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Password reset email sent successfully"
      );
      expect(mockOnSuccess).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows loading state when submitting", () => {
    // Set loading state to true
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
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
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
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
    const errorMessage = "User not found with this email";
    mockRequestPasswordReset.mockRejectedValueOnce({
      type: "resource/not-found",
      message: errorMessage,
    });

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    // Fill the form with valid data
    await user.type(emailInput, "nonexistent@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
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
    expect(mockClearAuthError).toHaveBeenCalled();
  });
});
