import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyEmailPage from "./VerifyEmailPage";
import * as AuthHook from "../../hooks/useAuth";
import { ErrorType } from "../../types/errors";

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Loader: () => <div data-testid="loading-spinner">Loading Spinner</div>,
}));

// Mock the auth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock the components used by VerifyEmailPage
vi.mock("../../components/auth/AuthCard", () => ({
  default: ({ title, subtitle, children, footer }) => (
    <div data-testid="auth-card">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <div data-testid="auth-card-content">{children}</div>
      {footer && <div data-testid="auth-card-footer">{footer}</div>}
    </div>
  ),
}));

vi.mock("../../components/auth/SuccessStateCard", () => ({
  default: ({ title, message, icon, children, cta }) => (
    <div data-testid="success-state-card">
      <h2>{title}</h2>
      <p>{message}</p>
      {icon && <div data-testid="icon" data-icon-type={icon}></div>}
      {children && <div data-testid="children-content">{children}</div>}
      {cta && (
        <a data-testid="cta-button" href={cta.to}>
          {cta.label}
        </a>
      )}
    </div>
  ),
}));

describe("VerifyEmailPage", () => {
  const mockVerifyEmail = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("token");

    // Default mock implementation for useAuth
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      verifyEmail: mockVerifyEmail,
      user: null,
      loading: false,
      authError: null,
      clearAuthError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });
  });

  it("renders the AuthCard with correct props", () => {
    render(<VerifyEmailPage />);

    // Check for AuthCard title and subtitle
    expect(
      screen.getByRole("heading", { level: 1, name: "Email Verification" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Verify your email address to activate your account")
    ).toBeInTheDocument();

    // Check that footer contains links
    const footer = screen.getByTestId("auth-card-footer");
    expect(footer).toContainElement(screen.getByText("Back to Login"));
    expect(footer).toContainElement(screen.getByText("Contact Support"));
  });

  it("shows idle state when no token is provided", () => {
    render(<VerifyEmailPage />);

    // Check that the info state is displayed
    expect(screen.getByTestId("success-state-card")).toBeInTheDocument();
    expect(screen.getByText("Email Verification Required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No verification token found. Please check your email for the verification link or request a new one."
      )
    ).toBeInTheDocument();

    // Check for CTA button
    const ctaButton = screen.getByTestId("cta-button");
    expect(ctaButton).toHaveAttribute("href", "/resend-verification");
    expect(ctaButton).toHaveTextContent("Request Verification Link");
  });

  it("automatically attempts verification when token is present", async () => {
    // Set a token in the URL
    mockSearchParams.set("token", "test-verification-token");

    // Make the verification succeed
    mockVerifyEmail.mockResolvedValueOnce("Email verified successfully");

    render(<VerifyEmailPage />);

    // First it should show loading state
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(
      screen.getByText("Verifying your email address...")
    ).toBeInTheDocument();

    // Verify that verifyEmail was called with the token
    expect(mockVerifyEmail).toHaveBeenCalledWith("test-verification-token");

    // After verification completes, it should show success state
    await waitFor(() => {
      expect(
        screen.getByText("Email Verified Successfully!")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Your email has been verified and your account is now active."
      )
    ).toBeInTheDocument();

    // Check for success icon
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-icon-type", "success");

    // Check for CTA button
    const ctaButton = screen.getByTestId("cta-button");
    expect(ctaButton).toHaveAttribute("href", "/login");
    expect(ctaButton).toHaveTextContent("Sign In to Your Account");
  });

  it("shows error state when verification fails", async () => {
    // Set a token in the URL
    mockSearchParams.set("token", "invalid-token");

    // Make the verification fail
    mockVerifyEmail.mockRejectedValueOnce({
      type: ErrorType.AUTH_INVALID_RESET_TOKEN,
      message: "Invalid or expired verification token",
    });

    render(<VerifyEmailPage />);

    // First it should show loading state
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // After verification fails, it should show error state
    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Invalid or expired verification token")
    ).toBeInTheDocument();

    // Check for error icon
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-icon-type", "error");

    // Check for "Try Again" button and "Request New Verification Link" button
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(
      screen.getByText("Request New Verification Link")
    ).toBeInTheDocument();
  });

  it("retries verification when Try Again button is clicked", async () => {
    const user = userEvent.setup();

    // Set a token in the URL
    mockSearchParams.set("token", "test-token");

    // First attempt fails, then succeeds on retry
    mockVerifyEmail.mockRejectedValueOnce({
      type: ErrorType.API_SERVER_ERROR,
      message: "Server error occurred",
    });

    render(<VerifyEmailPage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });

    // Reset mock to make the retry succeed
    mockVerifyEmail.mockResolvedValueOnce("Email verified successfully");

    // Click retry button
    await user.click(screen.getByText("Try Again"));

    // Verify that verifyEmail was called again with the same token
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledTimes(2);
      expect(mockVerifyEmail).toHaveBeenLastCalledWith("test-token");
    });

    // After retry succeeds, it should show success state
    await waitFor(() => {
      expect(
        screen.getByText("Email Verified Successfully!")
      ).toBeInTheDocument();
    });
  });

  it("redirects to dashboard if user is already verified", async () => {
    // Mock a logged-in and verified user
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      verifyEmail: mockVerifyEmail,
      user: {
        id: "1",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        isEmailVerified: true,
      },
      loading: false,
      authError: null,
      clearAuthError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: true,
      isEmailVerified: true,
      hasAuthError: vi.fn().mockReturnValue(false),
    });

    render(<VerifyEmailPage />);

    // Verify that navigate was called with the dashboard path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });
});
