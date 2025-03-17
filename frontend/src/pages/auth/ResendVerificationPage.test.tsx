import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResendVerificationPage from "./ResendVerificationPage";
import * as ToastUtils from "../../utils/toast";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock toast utilities
vi.mock("../../utils/toast", () => ({
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

// Mock the components used by ResendVerificationPage
vi.mock("../../components/auth/ResendVerificationForm", () => ({
  default: ({ onSuccess, onAlreadyVerified }) => (
    <div data-testid="resend-verification-form">
      <button
        data-testid="trigger-email-sent"
        onClick={() => onSuccess("test@example.com")}
      >
        Trigger Email Sent
      </button>
      <button
        data-testid="trigger-already-verified"
        onClick={() => onAlreadyVerified("verified@example.com")}
      >
        Trigger Already Verified
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/SuccessStateCard", () => ({
  default: ({ title, message, details, email, icon, cta }) => (
    <div data-testid="success-state-card">
      <h2>{title}</h2>
      <p>
        {message.includes("{email}")
          ? message.replace("{email}", email)
          : message}
      </p>
      {details && <p data-testid="details">{details}</p>}
      {icon && <div data-testid="icon">{icon}</div>}
      {cta && (
        <a data-testid="cta-button" href={cta.to}>
          {cta.label}
        </a>
      )}
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
  default: ({ showLogin, showRegister, customText }) => (
    <div data-testid="auth-footer">
      {showLogin && (
        <a href="/login" data-testid="login-link">
          {customText?.loginText || "Sign in"}
        </a>
      )}
      {showRegister && (
        <a href="/register" data-testid="register-link">
          Create an account
        </a>
      )}
    </div>
  ),
}));

describe("ResendVerificationPage", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the AuthCard with initial title and subtitle", () => {
    render(<ResendVerificationPage />);

    // Check for initial AuthCard title and subtitle
    expect(screen.getByText("Resend Verification Email")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email to receive a new verification link")
    ).toBeInTheDocument();
  });

  it("renders ResendVerificationForm by default", () => {
    render(<ResendVerificationPage />);

    expect(screen.getByTestId("resend-verification-form")).toBeInTheDocument();
    expect(screen.queryByTestId("success-state-card")).not.toBeInTheDocument();
  });

  it("has the correct links in the footer", () => {
    render(<ResendVerificationPage />);

    // Check for AuthFooter component
    expect(screen.getByTestId("auth-footer")).toBeInTheDocument();

    // Check login link
    const loginLink = screen.getByTestId("login-link");
    expect(loginLink).toHaveAttribute("href", "/login");
    expect(loginLink).toHaveTextContent("Back to Login");

    // Check register link
    const registerLink = screen.getByTestId("register-link");
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(registerLink).toHaveTextContent("Create an account");
  });

  it("shows success state when verification email is sent", async () => {
    const user = userEvent.setup();
    render(<ResendVerificationPage />);

    // Trigger the email sent state
    await user.click(screen.getByTestId("trigger-email-sent"));

    // Check that the card title and subtitle are updated
    expect(
      screen.getByRole("heading", { level: 1, name: "Verification Email Sent" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check your inbox for the verification link")
    ).toBeInTheDocument();

    // Check the success card contents
    expect(screen.getByTestId("success-state-card")).toBeInTheDocument();
    expect(
      screen.getByText("We've sent a verification email to test@example.com.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("details")).toHaveTextContent(
      "Please check your inbox and click the verification link to activate your account. If you don't see the email, check your spam folder."
    );
    expect(screen.getByTestId("icon")).toHaveTextContent("mail");

    // Check that the form is no longer displayed
    expect(
      screen.queryByTestId("resend-verification-form")
    ).not.toBeInTheDocument();

    // Check that toastInfo was called with the correct message
    expect(ToastUtils.toastInfo).toHaveBeenCalledWith(
      "Verification email sent successfully!"
    );
  });

  it("shows already verified state when email is already verified", async () => {
    const user = userEvent.setup();
    render(<ResendVerificationPage />);

    // Trigger the already verified state
    await user.click(screen.getByTestId("trigger-already-verified"));

    // Check that the card title and subtitle are updated
    expect(
      screen.getByRole("heading", { level: 1, name: "Email Already Verified" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your account is ready to use")
    ).toBeInTheDocument();

    // Check the success card contents
    expect(screen.getByTestId("success-state-card")).toBeInTheDocument();
    expect(
      screen.getByText("The email verified@example.com is already verified.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("details")).toHaveTextContent(
      "Your account is ready to use."
    );
    expect(screen.getByTestId("icon")).toHaveTextContent("success");

    // Check for the CTA button
    const ctaButton = screen.getByTestId("cta-button");
    expect(ctaButton).toHaveAttribute("href", "/login");
    expect(ctaButton).toHaveTextContent("Go to Login");

    // Check that the form is no longer displayed
    expect(
      screen.queryByTestId("resend-verification-form")
    ).not.toBeInTheDocument();

    // Check that toastInfo was called with the correct message
    expect(ToastUtils.toastInfo).toHaveBeenCalledWith(
      "Your email is already verified. You can log in now."
    );
  });
});
