import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./RegisterPage";
import * as AuthHook from "../../hooks/useAuth";

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock the auth hook
vi.mock("../../hooks/useAuth", async () => {
  const actual = await vi.importActual("../../hooks/useAuth");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock the components used by RegisterPage
vi.mock("../../components/auth/RegisterForm", () => ({
  default: ({ onRegistrationSuccess }) => (
    <div data-testid="register-form">
      <button
        data-testid="trigger-success"
        onClick={() => onRegistrationSuccess("test@example.com")}
      >
        Trigger Registration Success
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/RegistrationSuccessAlert", () => ({
  default: ({ email }) => (
    <div data-testid="registration-success-alert">
      <p>Registration successful for: {email}</p>
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

describe("RegisterPage", () => {
  const mockClearAuthError = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth with default values
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      user: null,
      clearAuthError: mockClearAuthError,
      loading: false,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: false,
      isEmailVerified: false,
      hasAuthError: vi.fn().mockReturnValue(false),
    });
  });

  it("renders the AuthCard with correct props", () => {
    render(<RegisterPage />);

    // Check for AuthCard title and subtitle
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(
      screen.getByText("Fill in your details to register")
    ).toBeInTheDocument();

    // Check that footer contains links
    const footer = screen.getByTestId("auth-card-footer");
    expect(footer).toContainElement(
      screen.getByText(/Already have an account/i)
    );
    expect(footer).toContainElement(screen.getByText("Sign in"));
    expect(footer).toContainElement(
      screen.getByText(/Need to verify your email/i)
    );
    expect(footer).toContainElement(screen.getByText("Resend verification"));
  });

  it("renders RegisterForm by default", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("registration-success-alert")
    ).not.toBeInTheDocument();
  });

  it("redirects to dashboard if user is already logged in", async () => {
    // Mock a logged-in user
    vi.mocked(AuthHook.useAuth).mockReturnValue({
      user: {
        id: "1",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        isEmailVerified: true,
      },
      clearAuthError: mockClearAuthError,
      loading: false,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerificationEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      isAuthenticated: true,
      isEmailVerified: true,
      hasAuthError: vi.fn().mockReturnValue(false),
    });

    render(<RegisterPage />);

    // Verify that navigate was called with the correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("switches to success state when handleRegistrationSuccess is called", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Initially should show register form
    expect(screen.getByTestId("register-form")).toBeInTheDocument();

    // Trigger registration success
    await user.click(screen.getByTestId("trigger-success"));

    // Should now show the success alert with the correct email
    expect(
      screen.getByTestId("registration-success-alert")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Registration successful for: test@example.com")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("register-form")).not.toBeInTheDocument();

    // Should clear auth errors when changing states
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("cleans up errors when unmounting", () => {
    const { unmount } = render(<RegisterPage />);

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("has the correct links in the footer", () => {
    render(<RegisterPage />);

    // Check login link
    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toHaveAttribute("href", "/login");

    // Check resend verification link
    const resendLink = screen.getByText("Resend verification");
    expect(resendLink).toHaveAttribute("href", "/resend-verification");
  });
});
