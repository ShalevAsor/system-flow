// frontend/src/components/auth/LoginForm.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
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
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

// Mock the Zustand store
vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock the auth service
vi.mock("../../services/api/authService", () => ({
  default: {
    login: vi.fn(),
  },
}));

// Mock reactQuery.ts
vi.mock("../../lib/reactQuery", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
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

describe("LoginForm", () => {
  // Setup variables
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockSetError = vi.fn();
  const mockOnUnverifiedEmail = vi.fn();

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
      login: mockLogin,
      clearError: mockClearError,
      setError: mockSetError,
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    // Reset form error handling behavior
    mockHandleFormError.mockImplementation((error) => {
      // Return the error type for component to handle
      return error.type;
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
  });

  // it("validates the form fields correctly", async () => {
  //   const user = userEvent.setup();
  //   renderLoginForm();

  //   // Get form elements
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const passwordInput = screen.getByLabelText(/password/i);
  //   const submitButton = screen.getByRole("button", { name: /sign in/i });

  //   // Try to submit without filling the form
  //   await user.click(submitButton);

  //   // Check for validation errors
  //   await waitFor(() => {
  //     expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  //     expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  //   });

  //   // Try with invalid email
  //   await user.type(emailInput, "invalid-email");
  //   await user.click(submitButton);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/please enter a valid email address/i)
  //     ).toBeInTheDocument();
  //   });

  //   // Try with short password (if your schema validates password length)
  //   await user.clear(emailInput);
  //   await user.type(emailInput, "valid@example.com");
  //   await user.type(passwordInput, "short");
  //   await user.click(submitButton);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/password must be at least 8 characters/i)
  //     ).toBeInTheDocument();
  //   });
  // });

  // it("submits the form with valid data and handles success", async () => {
  //   const user = userEvent.setup();
  //   renderLoginForm();

  //   // Mock successful login with user that has token
  //   const mockUserData = {
  //     id: "user123",
  //     email: "test@example.com",
  //     firstName: "Test",
  //     lastName: "User",
  //     isEmailVerified: true,
  //     token: "valid-token-123",
  //   };
  //   mockMutateAsync.mockResolvedValueOnce(mockUserData);

  //   // Get form elements
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const passwordInput = screen.getByLabelText(/password/i);
  //   const submitButton = screen.getByRole("button", { name: /sign in/i });

  //   // Fill the form with valid data
  //   await user.type(emailInput, "test@example.com");
  //   await user.type(passwordInput, "password12345");

  //   // Submit the form
  //   await user.click(submitButton);

  //   // Verify mutateAsync was called with correct arguments
  //   await waitFor(() => {
  //     expect(mockMutateAsync).toHaveBeenCalledWith({
  //       email: "test@example.com",
  //       password: "password12345",
  //     });
  //   });

  //   // Trigger success callback
  //   await waitFor(() => {
  //     if (globalThis.mockOnSuccess) {
  //       globalThis.mockOnSuccess(mockUserData);
  //     }
  //   });

  //   // Verify login was called with token and success toast was shown
  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalledWith("valid-token-123");
  //     expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
  //       "Logged in successfully!"
  //     );
  //   });
  // });

  it("shows loading state when submitting", () => {
    // Override React Query mock for this test
    mockUseMutation.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
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
    const authError = {
      type: ErrorType.AUTH_INVALID_CREDENTIALS,
      message: "Invalid email or password",
    };
    mockMutateAsync.mockRejectedValueOnce(authError);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill the form and submit
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password12345");
    await user.click(submitButton);

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(authError);
      }
    });

    // Verify error handling
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(authError);
    });
  });

  // it("handles unverified email error and calls the callback", async () => {
  //   const user = userEvent.setup();
  //   renderLoginForm();

  //   // Setup unverified email error scenario
  //   const unverifiedError = {
  //     type: ErrorType.AUTH_EMAIL_UNVERIFIED,
  //     message: "Please verify your email before logging in",
  //   };
  //   mockMutateAsync.mockRejectedValueOnce(unverifiedError);

  //   // Get form elements
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const passwordInput = screen.getByLabelText(/password/i);
  //   const submitButton = screen.getByRole("button", { name: /sign in/i });

  //   // Fill the form and submit
  //   await user.type(emailInput, "unverified@example.com");
  //   await user.type(passwordInput, "password12345");
  //   await user.click(submitButton);

  //   // Verify onUnverifiedEmail callback is called
  //   await waitFor(() => {
  //     expect(mockOnUnverifiedEmail).toHaveBeenCalledWith(
  //       "unverified@example.com"
  //     );
  //   });
  // });

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
    expect(mockClearError).toHaveBeenCalled();
  });
});
