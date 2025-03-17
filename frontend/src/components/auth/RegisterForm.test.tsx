// frontend/src/components/auth/RegisterForm.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "./RegisterForm";
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
    register: vi.fn(),
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

describe("RegisterForm", () => {
  // Setup variables
  const mockClearError = vi.fn();
  const mockSetError = vi.fn();
  const mockOnRegistrationSuccess = vi.fn();

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
  const renderRegisterForm = () => {
    return render(
      <RegisterForm onRegistrationSuccess={mockOnRegistrationSuccess} />
    );
  };

  it("renders all form fields correctly", () => {
    renderRegisterForm();

    // Check for form elements
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Check for password requirements text
    expect(
      screen.getByText(/Password must be at least 8 characters/i)
    ).toBeInTheDocument();

    // Check for email verification notice
    expect(
      screen.getByText(/By registering, you'll need to verify your email/i)
    ).toBeInTheDocument();

    // Check for submit button
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("validates the form fields correctly", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    // Get submit button
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Try to submit without filling the form
    await user.click(submitButton);

    // Check for validation errors (assuming all fields are required)
    await waitFor(() => {
      // These assertions depend on your registerSchema
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // Get form inputs to test more specific validations
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Test invalid email
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });

    // Test password validation (assuming min length of 8 and complexity requirements)
    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    // Test passwords don't match
    await user.clear(passwordInput);
    await user.type(passwordInput, "ValidPass123");
    await user.type(confirmPasswordInput, "DifferentPass123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and handles success", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    // Mock successful user registration
    const mockRegisteredUser = {
      id: "user-123",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      isEmailVerified: false,
    };
    mockMutateAsync.mockResolvedValueOnce(mockRegisteredUser);

    // Get form inputs
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill the form with valid data
    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john.doe@example.com");
    await user.type(passwordInput, "SecurePass123");
    await user.type(confirmPasswordInput, "SecurePass123");

    // Submit the form
    await user.click(submitButton);

    // Verify mutateAsync was called with correct arguments
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "john.doe@example.com",
        password: "SecurePass123",
        firstName: "John",
        lastName: "Doe",
      });
    });

    // Trigger success callback
    await waitFor(() => {
      if (globalThis.mockOnSuccess) {
        globalThis.mockOnSuccess(mockRegisteredUser);
      }
    });

    // Verify success handlers were called
    await waitFor(() => {
      expect(mockOnRegistrationSuccess).toHaveBeenCalledWith(
        "john.doe@example.com"
      );
      expect(ToastUtils.toastSuccess).toHaveBeenCalledWith(
        "Registration successful, please check your email"
      );
    });
  });

  it("shows loading state when submitting", () => {
    // Override React Query mock for this test
    mockUseMutation.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    renderRegisterForm();

    // Verify loading state is displayed
    expect(screen.getByText(/creating account.../i)).toBeInTheDocument();

    // Verify the button is disabled while loading
    const submitButton = screen.getByRole("button", {
      name: /creating account.../i,
    });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("handles email already in use error", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    // Setup error for email already in use
    const emailInUseError = {
      type: ErrorType.AUTH_EMAIL_ALREADY_IN_USE,
      message: "Email address is already in use",
    };
    mockMutateAsync.mockRejectedValueOnce(emailInUseError);

    // Get form inputs
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill the form with valid data
    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "SecurePass123");
    await user.type(confirmPasswordInput, "SecurePass123");

    // Submit the form
    await user.click(submitButton);

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(emailInUseError);
      }
    });

    // Verify error handling
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(emailInUseError);
    });
  });

  it("clears errors when form is submitted", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    // Get form inputs
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill the form with valid data
    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john.doe@example.com");
    await user.type(passwordInput, "SecurePass123");
    await user.type(confirmPasswordInput, "SecurePass123");

    // Submit the form
    await user.click(submitButton);

    // Verify errors were cleared
    expect(mockClearError).toHaveBeenCalled();
  });
});
