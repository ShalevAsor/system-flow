import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { vi, describe, it, expect, beforeEach } from "vitest";
import RegisterForm from "./RegisterForm";
import * as authHooks from "../../hooks/useAuth";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("RegisterForm", () => {
  // Helper function to set up useAuth mock with different return values
  const mockUseAuth = ({
    register = vi.fn(),
    loading = false,
    error = null as string | null,
  }) => {
    vi.mocked(authHooks.useAuth).mockReturnValue({
      user: null,
      loading,
      error,
      register,
      login: vi.fn(),
      logout: vi.fn(),
    });
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Default mock setup
    mockUseAuth({ register: vi.fn() });
  });

  it("renders form elements correctly", () => {
    // Render the component
    render(<RegisterForm />);

    // Check for first name field
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute("type", "text");

    // Check for last name field
    const lastNameInput = screen.getByLabelText(/last name/i);
    expect(lastNameInput).toBeInTheDocument();
    expect(lastNameInput).toHaveAttribute("type", "text");

    // Check for email field
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");

    // Check for password field
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    // Check for confirm password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Check for submit button
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(submitButton).toBeInTheDocument();

    // Check for password requirements text
    const passwordRequirements = screen.getByText(
      /password must be at least 8 characters/i
    );
    expect(passwordRequirements).toBeInTheDocument();
  });

  it("validates name fields", async () => {
    // Render the component
    render(<RegisterForm />);

    // Get form elements
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Test Case 1: Submit without entering name fields
    await userEvent.click(submitButton);

    // Check for first name error
    const firstNameError = await screen.findByText(/first name is required/i);
    expect(firstNameError).toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute("aria-invalid", "true");

    // Check for last name error
    const lastNameError = await screen.findByText(/last name is required/i);
    expect(lastNameError).toBeInTheDocument();
    expect(lastNameInput).toHaveAttribute("aria-invalid", "true");

    // Test Case 2: Enter valid names
    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");

    // Try submitting again (will still fail on other fields but name fields should be valid)
    await userEvent.click(submitButton);

    // Name field errors should no longer be present
    await waitFor(() => {
      const firstNameErrorAfterValid = screen.queryByText(
        /first name is required/i
      );
      const lastNameErrorAfterValid = screen.queryByText(
        /last name is required/i
      );

      expect(firstNameErrorAfterValid).not.toBeInTheDocument();
      expect(lastNameErrorAfterValid).not.toBeInTheDocument();

      expect(firstNameInput).toHaveAttribute("aria-invalid", "false");
      expect(lastNameInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("validates email input", async () => {
    // Render the component
    render(<RegisterForm />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Test Case 1: Empty email validation
    await userEvent.click(submitButton);

    const requiredEmailError = await screen.findByText(/email is required/i);
    expect(requiredEmailError).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");

    // Test Case 2: Invalid email format
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.click(submitButton);

    const invalidFormatError = await screen.findByText(
      /please enter a valid email address/i
    );
    expect(invalidFormatError).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");

    // Test Case 3: Valid email format
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "test@example.com");

    // We still need to fill in other required fields before submitting
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");

    await userEvent.click(submitButton);

    // Verify that the email error message is not present anymore
    await waitFor(() => {
      const emailErrorAfterValid = screen.queryByText(
        /please enter a valid email address/i
      );
      expect(emailErrorAfterValid).not.toBeInTheDocument();
      expect(emailInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("validates password requirements", async () => {
    // Render the component
    render(<RegisterForm />);

    // Get form elements
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Test Case 1: Empty password validation
    await userEvent.click(submitButton);

    const requiredPasswordError = await screen.findByText(
      /password is required/i
    );
    expect(requiredPasswordError).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");

    // Test Case 2: Password too short
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "short");
    await userEvent.click(submitButton);

    const tooShortError = await screen.findByText(
      /password must be at least 8 characters/i
    );
    expect(tooShortError).toBeInTheDocument();

    // Test Case 3: Password missing uppercase/lowercase/number requirements
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "passwordonly"); // Missing uppercase and number
    await userEvent.click(submitButton);

    const requirementsError = await screen.findByText(
      /password must contain at least one uppercase letter, one lowercase letter, and one number/i
    );
    expect(requirementsError).toBeInTheDocument();

    // Test Case 4: Valid password
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password123");

    // Fill other required fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(confirmPasswordInput, "Password123");

    await userEvent.click(submitButton);

    // Verify that the password error message is not present anymore
    await waitFor(() => {
      const passwordErrorAfterValid = screen.queryByText(
        /password must contain at least one uppercase letter/i
      );
      expect(passwordErrorAfterValid).not.toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("validates password confirmation", async () => {
    // Render the component
    render(<RegisterForm />);

    // Get form elements
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in a valid password
    await userEvent.type(passwordInput, "Password123");

    // Test Case 1: Empty confirm password
    await userEvent.click(submitButton);

    const requiredConfirmError = await screen.findByText(
      /please confirm your password/i
    );
    expect(requiredConfirmError).toBeInTheDocument();

    // Test Case 2: Passwords don't match
    await userEvent.type(confirmPasswordInput, "DifferentPassword123");
    await userEvent.click(submitButton);

    const mismatchError = await screen.findByText(/passwords do not match/i);
    expect(mismatchError).toBeInTheDocument();

    // Test Case 3: Matching passwords
    await userEvent.clear(confirmPasswordInput);
    await userEvent.type(confirmPasswordInput, "Password123");

    // Fill other required fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "test@example.com");

    await userEvent.click(submitButton);

    // Verify that the mismatch error is not present anymore
    await waitFor(() => {
      const confirmErrorAfterValid = screen.queryByText(
        /passwords do not match/i
      );
      expect(confirmErrorAfterValid).not.toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("displays the global error message from auth context", () => {
    // Mock useAuth to return an error

    mockUseAuth({
      register: vi.fn(),
      error: "This email is already registered. Please use a different email.",
    });

    // Render the component
    render(<RegisterForm />);

    // Check that the global error message is displayed
    const errorMessage = screen.getByText(
      /This email is already registered. Please use a different email./i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    // Create a mock register function that returns a promise that doesn't resolve immediately
    const registerPromise = new Promise((resolve) => {
      setTimeout(() => resolve({}), 1000);
    });

    // Mock the register function to return our controlled promise and set loading to true
    const registerMock = vi.fn(() => registerPromise);
    mockUseAuth({ register: registerMock, loading: true });

    // Render the component
    render(<RegisterForm />);

    // Verify that the loading button is shown with the loading text
    const loadingButton = screen.getByRole("button", {
      name: /creating account/i,
    });
    expect(loadingButton).toBeInTheDocument();

    // Verify that the button is disabled during loading
    expect(loadingButton).toBeDisabled();
  });

  it("calls register function with correct data on submit", async () => {
    // Create a mock register function
    const registerMock = vi.fn();
    mockUseAuth({ register: registerMock });

    // Render the component
    render(<RegisterForm />);

    // Fill in the form with valid data
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await userEvent.click(submitButton);

    // Check that the register function was called with the correct data
    expect(registerMock).toHaveBeenCalledWith(
      "user@example.com",
      "Password123",
      "John",
      "Doe"
    );
  });

  it("displays API errors correctly", async () => {
    // Mock isApiError to always return true for our test
    vi.mock("../../utils/apiUtils", () => ({
      isApiError: () => true,
    }));

    // Create a mock register function that will reject
    const registerMock = vi.fn().mockRejectedValue({
      response: {
        data: {
          errors: {
            email: "Email already exists in our system",
          },
        },
      },
    });

    // Set up our useAuth mock
    mockUseAuth({ register: registerMock });

    // Render the component
    render(<RegisterForm />);

    // Fill in the form
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await userEvent.click(submitButton);

    // Verify register was called with correct values
    expect(registerMock).toHaveBeenCalledWith(
      "test@example.com",
      "Password123",
      "John",
      "Doe"
    );

    // Check for aria-invalid attribute on email field
    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("handles successful registration correctly", async () => {
    // Create a mock user that will be returned on successful registration
    const mockUser = {
      id: "123",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    // Mock register to resolve with the user
    const registerMock = vi.fn().mockResolvedValue(mockUser);
    mockUseAuth({ register: registerMock });

    // Render the component
    render(<RegisterForm />);

    // Fill the form
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await userEvent.click(submitButton);

    // Verify register was called with correct values
    expect(registerMock).toHaveBeenCalledWith(
      "test@example.com",
      "Password123",
      "John",
      "Doe"
    );

    // Success scenario typically doesn't show messages in the form itself
    // But we can verify there are no error elements
    await waitFor(() => {
      const errorElements = screen.queryAllByRole("alert");
      expect(errorElements.length).toBe(0);
    });
  });

  it("disables submit button during form submission", async () => {
    // Create a mock register function that returns a promise that doesn't resolve immediately
    const registerPromise = new Promise((resolve) => {
      setTimeout(() => resolve({}), 10000);
    });

    // Mock useAuth with a register function that returns our delayed promise
    const registerMock = vi.fn(() => registerPromise);
    mockUseAuth({ register: registerMock });

    // Render the component
    render(<RegisterForm />);

    // Fill valid form data
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");

    // Get the submit button
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Button should be enabled before submission
    expect(submitButton).not.toBeDisabled();

    // Submit the form
    await userEvent.click(submitButton);

    // Now check if the button becomes disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
