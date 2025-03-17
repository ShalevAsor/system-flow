import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailVerificationResend from "./EmailVerificationResend";
import { useAuthStore } from "../../store/authStore";
import { createMockAuthState } from "../../utils/testUtils";

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
    resendVerificationEmail: vi.fn(),
  },
}));

describe("EmailVerificationResend", () => {
  // Setup variables
  const mockSetError = vi.fn();
  const mockEmail = "test@example.com";

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
      setError: mockSetError,
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    // Reset React Query mock to default state
    mockUseMutation.mockImplementation(({ onSuccess, onError }) => {
      if (onSuccess) globalThis.mockOnSuccess = onSuccess;
      if (onError) globalThis.mockOnError = onError;

      return {
        mutateAsync: mockMutateAsync,
        isPending: false,
      };
    });
  });

  // Helper function to render the component
  const renderEmailVerificationResend = (props = {}) => {
    return render(<EmailVerificationResend email={mockEmail} {...props} />);
  };

  it("renders initial state correctly", () => {
    renderEmailVerificationResend();

    // Check for instruction message
    expect(
      screen.getByText(
        /Didn't receive the email\? Check your spam folder or click below to resend\./i
      )
    ).toBeInTheDocument();

    // Check for resend button
    expect(
      screen.getByRole("button", { name: "Resend Verification Email" })
    ).toBeInTheDocument();
  });

  it("allows customization of instruction message", () => {
    const customInstruction = "Custom instruction message";
    renderEmailVerificationResend({ instructionMessage: customInstruction });

    expect(screen.getByText(customInstruction)).toBeInTheDocument();
  });

  it("shows loading state when resending email", async () => {
    // Override React Query mock for this test
    mockUseMutation.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    renderEmailVerificationResend();

    // Check that loading state is shown
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
  });

  it("shows success message after successfully resending email", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Verify mutateAsync was called with correct arguments
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ email: mockEmail });
    });

    // Trigger success callback
    await waitFor(() => {
      if (globalThis.mockOnSuccess) {
        globalThis.mockOnSuccess("Email sent successfully");
      }
    });

    // Check that success message is shown
    await waitFor(() => {
      expect(
        screen.getByText(
          "We've sent a new verification email to your address. Please check your inbox."
        )
      ).toBeInTheDocument();
    });

    // Check that resend button is no longer shown
    expect(
      screen.queryByRole("button", { name: "Resend Verification Email" })
    ).not.toBeInTheDocument();
  });

  it("allows customization of success message", async () => {
    const user = userEvent.setup();
    const customSuccessMessage = "Custom success message";
    renderEmailVerificationResend({ successMessage: customSuccessMessage });

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Trigger success callback
    await waitFor(() => {
      if (globalThis.mockOnSuccess) {
        globalThis.mockOnSuccess("Email sent successfully");
      }
    });

    // Check that custom success message is shown
    await waitFor(() => {
      expect(screen.getByText(customSuccessMessage)).toBeInTheDocument();
    });
  });

  it("handles errors when resending fails", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Setup error response
    const errorResponse = {
      message: "API Error",
    };
    mockMutateAsync.mockRejectedValueOnce(errorResponse);

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(errorResponse);
      }
    });

    // Check that error message is shown
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to send verification email. Please try again later."
        )
      ).toBeInTheDocument();
    });

    // Check that error was set in the auth store
    expect(mockSetError).toHaveBeenCalled();

    // Check that resend button is still shown and enabled
    expect(
      screen.getByRole("button", { name: "Resend Verification Email" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend Verification Email" })
    ).not.toBeDisabled();
  });

  it("allows dismissing the error message", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Setup error response
    const errorResponse = {
      message: "API Error",
    };
    mockMutateAsync.mockRejectedValueOnce(errorResponse);

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Trigger error callback
    await waitFor(() => {
      if (globalThis.mockOnError) {
        globalThis.mockOnError(errorResponse);
      }
    });

    // Wait for error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to send verification email. Please try again later."
        )
      ).toBeInTheDocument();
    });

    // Get dismiss button and click it
    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    await user.click(dismissButton);

    // Check that error message is no longer shown
    expect(
      screen.queryByText(
        "Failed to send verification email. Please try again later."
      )
    ).not.toBeInTheDocument();
  });

  it("calls mutateAsync with the provided email", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Verify the function was called with the correct email
    expect(mockMutateAsync).toHaveBeenCalledWith({ email: mockEmail });
  });
});
