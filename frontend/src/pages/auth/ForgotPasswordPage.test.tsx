import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./ForgotPasswordPage";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock the components used by ForgotPasswordPage
vi.mock("../../components/auth/ForgotPasswordForm", () => ({
  default: ({ onSuccess }) => (
    <div data-testid="forgot-password-form">
      <button
        data-testid="trigger-success"
        onClick={() => onSuccess("test@example.com")}
      >
        Send Reset Link
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/SuccessStateCard", () => ({
  default: ({ title, message, email, details, icon, children }) => (
    <div data-testid="success-state-card">
      <h2>{title}</h2>
      <p data-testid="message">
        {message.includes("{email}")
          ? message.replace("{email}", email)
          : message}
      </p>
      {details && <p data-testid="details">{details}</p>}
      {icon && <div data-testid="icon">{icon}</div>}
      {children && <div data-testid="additional-content">{children}</div>}
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

// Mock AuthFooter component
vi.mock("../../components/auth/AuthFooter", () => ({
  default: ({ showLogin, customText }) => (
    <div data-testid="auth-footer">
      {showLogin && (
        <a href="/login" data-testid="login-link">
          {customText?.loginText || "Sign in"}
        </a>
      )}
    </div>
  ),
}));

describe("ForgotPasswordPage", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the initial form state with correct props", () => {
    render(<ForgotPasswordPage />);

    // Check for AuthCard title and subtitle
    expect(
      screen.getByRole("heading", { level: 1, name: "Forgot Password" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email to receive a password reset link")
    ).toBeInTheDocument();

    // Check that the form is displayed
    expect(screen.getByTestId("forgot-password-form")).toBeInTheDocument();

    // Check that success state is not displayed
    expect(screen.queryByTestId("success-state-card")).not.toBeInTheDocument();

    // Check that footer contains AuthFooter
    expect(screen.getByTestId("auth-footer")).toBeInTheDocument();
    expect(screen.getByTestId("login-link")).toBeInTheDocument();
    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  it("transitions to success state when form is successfully submitted", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    // Trigger success by clicking the form's button
    await user.click(screen.getByTestId("trigger-success"));

    // Check that the success state is now displayed
    expect(screen.getByTestId("success-state-card")).toBeInTheDocument();

    // Check that the AuthCard title and subtitle have changed
    expect(
      screen.getByRole("heading", { level: 1, name: "Reset Link Sent" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check your inbox for the password reset link")
    ).toBeInTheDocument();

    // Check success message content
    expect(screen.getByTestId("message")).toHaveTextContent(
      "We've sent a password reset link to test@example.com."
    );

    // Check details
    expect(screen.getByTestId("details")).toHaveTextContent(
      "Please check your inbox and click the link to reset your password. The link will expire in 1 hour for security reasons."
    );

    // Check icon
    expect(screen.getByTestId("icon")).toHaveTextContent("mail");

    // Check additional content
    expect(screen.getByTestId("additional-content")).toHaveTextContent(
      "If you don't receive an email, check your spam folder or verify that you entered the correct email address."
    );

    // Check that form is no longer displayed
    expect(
      screen.queryByTestId("forgot-password-form")
    ).not.toBeInTheDocument();
  });

  it("has the correct link in the footer", () => {
    render(<ForgotPasswordPage />);

    // Check login link
    const loginLink = screen.getByTestId("login-link");
    expect(loginLink).toHaveAttribute("href", "/login");
    expect(loginLink).toHaveTextContent("Back to Login");
  });
});
