import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginForm from "./LoginForm";
import * as authHooks from "../../hooks/useAuth";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("LoginForm", () => {
  // Helper function to set up useAuth mock with different return values
  const mockUseAuth = ({ login = vi.fn(), loading = false, error = null }) => {
    vi.mocked(authHooks.useAuth).mockReturnValue({
      user: null,
      loading,
      error,
      login,
      logout: vi.fn(),
      register: vi.fn(),
    });
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Default mock setup
    mockUseAuth({ login: vi.fn() });
  });

  it("renders form elements correctly", () => {
    // Render the component
    render(<LoginForm />);

    // Check for email field
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    // Check for password field
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    // Check for submit button
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();

    // Check for forgot password link
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    // TODO: Replace # with actual link
    expect(forgotPasswordLink).toHaveAttribute("href", "#");
  });

  it("validates email input", async () => {
    // Render the component
    render(<LoginForm />);
    // Get the form elements
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    // Test case 1: empty email validation
    await userEvent.click(submitButton);
    const requiredEmailError = await screen.findByText(/email is required/i);
    expect(requiredEmailError).toBeInTheDocument();

    // Test Case 2: Invalid email format
    // Clear the field and type an invalid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.click(submitButton);
    // Check that the invalid format error appears
    const invalidFormatError = await screen.findByText(
      /please enter a valid email address/i
    );
    expect(invalidFormatError).toBeInTheDocument();
    // Test Case 3: Valid email format
    // Clear the field and type a valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "test@example.com");

    // We need to also fill in the password to prevent its validation error
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, "Password123");

    // Submit the form
    await userEvent.click(submitButton);

    // Verify that the email error message is not present anymore
    await waitFor(() => {
      const emailErrorAfterValid = screen.queryByText(
        /please enter a valid email address/i
      );
      expect(emailErrorAfterValid).not.toBeInTheDocument();
    });
  });
  it("displays the global error message from auth context", () => {
    // Mock useAuth to return an error
    vi.mocked(authHooks.useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: "Invalid credentials. Please try again.",
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    });

    // Render the component
    render(<LoginForm />);

    // Check that the global error message is displayed
    const errorMessage = screen.getByText(
      /Invalid credentials. Please try again./i
    );
    expect(errorMessage).toBeInTheDocument();
  });
  it("sets the correct aria-invalid attribute on email field", async () => {
    // Render the component
    render(<LoginForm />);

    // Get the email input
    const emailInput = screen.getByLabelText(/email/i);

    // Initially the field should not be marked as invalid
    expect(emailInput).toHaveAttribute("aria-invalid", "false");

    // Submit the form without entering data
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    // After validation fails, the field should be marked as invalid
    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });

    // Now enter valid data
    await userEvent.type(emailInput, "test@example.com");

    // Fill password too to avoid its validation error
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, "Password123");

    // Submit the form again
    await userEvent.click(submitButton);

    // The field should now be valid again
    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("validates password input", async () => {
    // Render the component
    render(<LoginForm />);

    // Get form elements
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Test Case 1: Empty password validation
    // Submit the form without entering any password
    await userEvent.click(submitButton);

    // Check that the empty password error appears
    const requiredPasswordError = await screen.findByText(
      /password is required/i
    );
    expect(requiredPasswordError).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    // Test Case 2: Password too short validation
    // Enter a password that's too short (less than 8 characters)
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "short");
    await userEvent.click(submitButton);

    // Check that the too short error appears
    const tooShortError = await screen.findByText(
      /password must be at least 8 characters/i
    );
    expect(tooShortError).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");

    // Test Case 3: Valid password
    // Enter a valid password (at least 8 characters)
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "validpassword123");

    // We need to also fill in the email to prevent its validation error
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "test@example.com");

    // Submit the form
    await userEvent.click(submitButton);

    // Verify that the password error message is not present anymore
    await waitFor(() => {
      const passwordErrorAfterValid = screen.queryByText(
        /password must be at least 8 characters/i
      );
      expect(passwordErrorAfterValid).not.toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    });

    // For thorough testing, we should also verify that the login function was called
    const { login } = authHooks.useAuth();
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        "test@example.com",
        "validpassword123"
      );
    });
  });

  it("shows loading state while submitting", async () => {
    // Create a mock login function that returns a promise that doesn't resolve immediately
    // This simulates an API call that takes some time to complete
    const loginPromise = new Promise((resolve) => {
      // We don't resolve this promise during the test to keep the loading state active
      setTimeout(() => resolve({}), 1000);
    });

    // Mock the login function to return our controlled promise
    const loginMock = vi.fn(() => loginPromise);

    // Set up our useAuth mock with loading state set to true
    mockUseAuth({ login: loginMock, loading: true });

    // Render the component
    render(<LoginForm />);

    // Verify that the loading button is shown with the loading text
    const loadingButton = screen.getByRole("button", { name: /logging in/i });
    expect(loadingButton).toBeInTheDocument();

    // Verify that the button is disabled during loading
    expect(loadingButton).toBeDisabled();
  });

  it("calls login function with correct credentials on submit", async () => {
    // Create a mock login function
    const loginMock = vi.fn();
    mockUseAuth({ login: loginMock });

    // Render the component
    render(<LoginForm />);

    // Fill in the form with valid credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "securepassword123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    // Check that the login function was called with the correct credentials
    expect(loginMock).toHaveBeenCalledWith(
      "user@example.com",
      "securepassword123"
    );
  });

  it("displays API errors correctly", async () => {
    // Step 1: Mock isApiError to always return true for our test
    vi.mock("../../utils/apiUtils", () => ({
      isApiError: () => true,
    }));

    // Step 2: Create a mock login function that will reject
    const loginMock = vi.fn().mockRejectedValue({
      response: {
        data: {
          errors: {
            email: "Email not found in our system",
          },
        },
      },
    });

    // Step 3: Set up our useAuth mock
    mockUseAuth({ login: loginMock });

    // Step 4: Render the component and find inputs
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Step 5: Fill form fields and submit
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    // Step 6: Verify login was called with correct values
    expect(loginMock).toHaveBeenCalledWith("test@example.com", "password123");

    // Step 7: Check for aria-invalid attribute on email field
    // This is a more reliable indicator than looking for error text
    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });
  it("handles successful login correctly", async () => {
    // Create a mock user that will be returned on successful login
    const mockUser = {
      id: "123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    // Mock login to resolve with the user
    const loginMock = vi.fn().mockResolvedValue(mockUser);
    mockUseAuth({ login: loginMock });

    // Render the component
    render(<LoginForm />);

    // Fill the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    // Verify login was called with correct values
    expect(loginMock).toHaveBeenCalledWith("test@example.com", "password123");

    // Success scenario typically doesn't show messages in the form itself
    // since successful login usually triggers navigation
    // But we can verify there are no error elements
    await waitFor(() => {
      const errorElements = screen.queryAllByRole("alert");
      expect(errorElements.length).toBe(0);
    });
  });
  it("disables submit button during form submission", async () => {
    // Create a mock login function that returns a promise that doesn't resolve immediately
    const loginPromise = new Promise((resolve) => {
      // Will intentionally never resolve during the test
      setTimeout(() => resolve({}), 10000);
    });

    // Mock useAuth with a login function that returns our delayed promise
    const loginMock = vi.fn(() => loginPromise);
    mockUseAuth({ login: loginMock });

    // Render the component
    render(<LoginForm />);

    // Fill valid form data
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    // Get the submit button
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Button should be enabled before submission
    expect(submitButton).not.toBeDisabled();

    // Submit the form
    await userEvent.click(submitButton);

    // Now check if the button becomes disabled
    // Either because of loading state or isSubmitting state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
