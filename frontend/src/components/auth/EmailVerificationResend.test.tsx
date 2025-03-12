import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailVerificationResend from "./EmailVerificationResend";
import * as AuthHook from "../../hooks/useAuth";

// Mock the useAuth hook
vi.mock("../../hooks/useAuth", async () => {
  const actual = await vi.importActual("../../hooks/useAuth");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("EmailVerificationResend", () => {
  // Setup variables
  const mockResendVerificationEmail = vi.fn();
  const mockEmail = "test@example.com";

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      resendVerificationEmail: mockResendVerificationEmail,
      loading: false,
      clearAuthError: vi.fn(),
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
    // Setup mock to delay resolution
    mockResendVerificationEmail.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("Email sent"), 100);
        })
    );

    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Check that loading state is shown
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
  });

  it("shows success message after successfully resending email", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Setup success response
    mockResendVerificationEmail.mockResolvedValueOnce(
      "Email sent successfully"
    );

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

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

    // Setup success response
    mockResendVerificationEmail.mockResolvedValueOnce(
      "Email sent successfully"
    );

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Check that custom success message is shown
    await waitFor(() => {
      expect(screen.getByText(customSuccessMessage)).toBeInTheDocument();
    });
  });

  it("handles errors when resending fails", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Setup error response
    mockResendVerificationEmail.mockRejectedValueOnce(new Error("API Error"));

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Check that error message is shown
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to send verification email. Please try again later."
        )
      ).toBeInTheDocument();
    });

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
    mockResendVerificationEmail.mockRejectedValueOnce(new Error("API Error"));

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

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

  it("calls resendVerificationEmail with the provided email", async () => {
    const user = userEvent.setup();
    renderEmailVerificationResend();

    // Click resend button
    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });
    await user.click(resendButton);

    // Verify the function was called with the correct email
    expect(mockResendVerificationEmail).toHaveBeenCalledWith(mockEmail);
  });
});
