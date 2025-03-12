import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResendVerificationForm from "./ResendVerificationForm";
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

describe("ResendVerificationForm", () => {
  // Setup variables
  const mockResendVerificationEmail = vi.fn();
  const mockClearAuthError = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnAlreadyVerified = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      resendVerificationEmail: mockResendVerificationEmail,
      loading: false,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });
  });

  // Helper function to render the component
  const renderResendVerificationForm = () => {
    return render(
      <ResendVerificationForm
        onSuccess={mockOnSuccess}
        onAlreadyVerified={mockOnAlreadyVerified}
      />
    );
  };

  it("renders the form fields correctly", () => {
    renderResendVerificationForm();

    // Check for form elements
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Verification Email" })
    ).toBeInTheDocument();
  });

  it("validates the email field correctly", async () => {
    const user = userEvent.setup();
    renderResendVerificationForm();

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Verification Email",
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
    renderResendVerificationForm();

    // Setup success response
    mockResendVerificationEmail.mockResolvedValueOnce(
      "Verification email sent successfully"
    );

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Verification Email",
    });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify resendVerificationEmail was called with correct arguments
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(mockOnSuccess).toHaveBeenCalledWith("test@example.com");
      expect(mockOnAlreadyVerified).not.toHaveBeenCalled();
    });
  });

  it("handles already verified email response", async () => {
    const user = userEvent.setup();
    renderResendVerificationForm();

    // Setup already verified response
    mockResendVerificationEmail.mockResolvedValueOnce(
      "Email is already verified"
    );

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Verification Email",
    });

    // Fill the form with valid data
    await user.type(emailInput, "verified@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify onAlreadyVerified was called instead of onSuccess
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith(
        "verified@example.com"
      );
      expect(mockOnAlreadyVerified).toHaveBeenCalledWith(
        "verified@example.com"
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it("shows loading state when submitting", () => {
    // Set loading state to true
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      resendVerificationEmail: mockResendVerificationEmail,
      loading: true,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });

    renderResendVerificationForm();

    // Verify loading state is displayed
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Verify the button is disabled while loading
    const submitButton = screen.getByRole("button", { name: "Sending..." });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("handles API errors", async () => {
    const user = userEvent.setup();
    renderResendVerificationForm();

    // Setup error scenario
    const errorMessage = "User not found with this email";
    mockResendVerificationEmail.mockRejectedValueOnce({
      type: "resource/not-found",
      message: errorMessage,
    });

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Verification Email",
    });

    // Fill the form with valid data
    await user.type(emailInput, "nonexistent@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify error is displayed and error toast is shown
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(ToastUtils.toastError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("clears errors when form is submitted", async () => {
    const user = userEvent.setup();
    renderResendVerificationForm();

    // Get form elements
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Verification Email",
    });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(submitButton);

    // Verify errors were cleared
    expect(mockClearAuthError).toHaveBeenCalled();
  });
});
