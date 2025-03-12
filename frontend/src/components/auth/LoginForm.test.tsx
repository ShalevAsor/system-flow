// frontend/src/components/auth/LoginForm.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
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

describe("LoginForm", () => {
  // Setup variables
  const mockLogin = vi.fn();
  const mockClearAuthError = vi.fn();
  const mockOnUnverifiedEmail = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });
  });

  // Helper function to render the component
  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm onUnverifiedEmail={mockOnUnverifiedEmail} />
      </BrowserRouter>
    );
  };

  it("renders the form fields correctly", () => {
    renderLoginForm();

    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();

    // Check for the forgot password link
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i).closest("a")).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("validates the form fields correctly", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Try to submit without filling the form
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // Try with invalid email
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    // Try with short password
    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and handles success", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill the form with valid data
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password12345");

    // Submit the form
    await user.click(submitButton);

    // Verify login was called with correct arguments
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "test@example.com",
        "password12345"
      );
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Logged in successfully!"
      );
    });
  });

  it("shows loading state when submitting", async () => {
    // Set loading state to true
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      login: mockLogin,
      loading: true,
      clearAuthError: mockClearAuthError,
      user: null,
      authError: null,
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });

    renderLoginForm();

    // Verify loading state is displayed
    expect(screen.getByText(/logging in.../i)).toBeInTheDocument();

    // Verify the button is disabled while loading
    const submitButton = screen.getByRole("button", { name: /logging in.../i });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("handles authentication error", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Setup error scenario
    mockLogin.mockRejectedValueOnce({
      type: ErrorType.AUTH_INVALID_CREDENTIALS,
      message: "Invalid email or password",
    });

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill the form and submit
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password12345");
    await user.click(submitButton);

    // Verify error is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });

  it("handles unverified email error and calls the callback", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Setup unverified email error scenario
    mockLogin.mockRejectedValueOnce({
      type: ErrorType.AUTH_EMAIL_UNVERIFIED,
      message: "Please verify your email before logging in",
    });

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill the form and submit
    await user.type(emailInput, "unverified@example.com");
    await user.type(passwordInput, "password12345");
    await user.click(submitButton);

    // Verify error is displayed and callback is called
    await waitFor(() => {
      expect(
        screen.getByText(/please verify your email before logging in/i)
      ).toBeInTheDocument();
      expect(mockOnUnverifiedEmail).toHaveBeenCalledWith(
        "unverified@example.com"
      );
    });
  });

  it("cleans up errors when unmounting", async () => {
    const { unmount } = renderLoginForm();

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("clears errors when form is submitted", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill the form and submit
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password12345");
    await user.click(submitButton);

    // Verify errors were cleared
    expect(mockClearAuthError).toHaveBeenCalled();
  });
});
