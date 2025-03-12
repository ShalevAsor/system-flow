import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "./ResetPasswordPage";

// Mock for useLocation to provide query parameters
const mockUseLocation = vi.fn();
vi.mock("react-router-dom", () => ({
  useLocation: () => mockUseLocation(),
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock the auth hook
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    clearAuthError: vi.fn(),
  }),
}));

// Mock the components used by ResetPasswordPage
vi.mock("../../components/auth/ResetPasswordForm", () => ({
  default: ({ token, onSuccess, onInvalidToken }) => (
    <div data-testid="reset-password-form">
      <p>Token: {token}</p>
      <button data-testid="trigger-success" onClick={onSuccess}>
        Trigger Success
      </button>
      <button data-testid="trigger-invalid-token" onClick={onInvalidToken}>
        Trigger Invalid Token
      </button>
    </div>
  ),
}));

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

vi.mock("../../components/common/FormAlert", () => ({
  default: ({ message, variant, showCloseButton }) => (
    <div data-testid={`form-alert-${variant}`}>
      <p>{message}</p>
      {showCloseButton && <button>Close</button>}
    </div>
  ),
}));

describe("ResetPasswordPage", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the AuthCard with correct props", () => {
    // Mock a valid token
    mockUseLocation.mockReturnValue({
      search: "?token=valid-token",
    });

    render(<ResetPasswordPage />);

    // Check for AuthCard title and subtitle
    expect(
      screen.getByRole("heading", { level: 1, name: "Reset Your Password" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter a new password for your account")
    ).toBeInTheDocument();

    // Check that footer contains links
    const footer = screen.getByTestId("auth-card-footer");
    expect(footer).toContainElement(
      screen.getByText(/Remember your password/i)
    );
    expect(footer).toContainElement(screen.getByText("Sign in"));
  });

  it("renders the password reset form when token is present", () => {
    // Mock a valid token
    mockUseLocation.mockReturnValue({
      search: "?token=valid-token",
    });

    render(<ResetPasswordPage />);

    // Check that the form is displayed
    expect(screen.getByTestId("reset-password-form")).toBeInTheDocument();
    expect(screen.getByText("Token: valid-token")).toBeInTheDocument();

    // Check that success and error states are not displayed
    expect(screen.queryByTestId("form-alert-success")).not.toBeInTheDocument();
    expect(screen.queryByTestId("form-alert-error")).not.toBeInTheDocument();
  });

  it("shows invalid token state when token is missing", () => {
    // Mock missing token
    mockUseLocation.mockReturnValue({
      search: "",
    });

    render(<ResetPasswordPage />);

    // Check that the error alert is displayed
    expect(screen.getByTestId("form-alert-error")).toBeInTheDocument();
    expect(
      screen.getByText("Invalid or expired password reset token.")
    ).toBeInTheDocument();

    // Check that the form is not displayed
    expect(screen.queryByTestId("reset-password-form")).not.toBeInTheDocument();

    // Check that the link to request a new token is displayed
    const requestNewLink = screen.getByText(
      "request a new password reset link"
    );
    expect(requestNewLink).toBeInTheDocument();
    expect(requestNewLink).toHaveAttribute("href", "/forgot-password");
  });

  it("transitions to success state when reset is successful", async () => {
    const user = userEvent.setup();

    // Mock a valid token
    mockUseLocation.mockReturnValue({
      search: "?token=valid-token",
    });

    render(<ResetPasswordPage />);

    // First should show the form
    expect(screen.getByTestId("reset-password-form")).toBeInTheDocument();

    // Trigger success
    await user.click(screen.getByTestId("trigger-success"));

    // Should now show success message
    expect(screen.getByTestId("form-alert-success")).toBeInTheDocument();
    expect(
      screen.getByText("Your password has been reset successfully!")
    ).toBeInTheDocument();

    // Should show login link
    const loginLink = screen.getByText("login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");

    // Form should be gone
    expect(screen.queryByTestId("reset-password-form")).not.toBeInTheDocument();
  });

  it("transitions to invalid token state when token is invalid", async () => {
    const user = userEvent.setup();

    // Mock a valid token
    mockUseLocation.mockReturnValue({
      search: "?token=valid-token",
    });

    render(<ResetPasswordPage />);

    // First should show the form
    expect(screen.getByTestId("reset-password-form")).toBeInTheDocument();

    // Trigger invalid token
    await user.click(screen.getByTestId("trigger-invalid-token"));

    // Should now show error message
    expect(screen.getByTestId("form-alert-error")).toBeInTheDocument();
    expect(
      screen.getByText("Invalid or expired password reset token.")
    ).toBeInTheDocument();

    // Should show link to request new reset
    const requestNewLink = screen.getByText(
      "request a new password reset link"
    );
    expect(requestNewLink).toBeInTheDocument();
    expect(requestNewLink).toHaveAttribute("href", "/forgot-password");

    // Form should be gone
    expect(screen.queryByTestId("reset-password-form")).not.toBeInTheDocument();
  });

  it("has the correct link in the footer", () => {
    // Mock a valid token
    mockUseLocation.mockReturnValue({
      search: "?token=valid-token",
    });

    render(<ResetPasswordPage />);

    // Check login link
    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
