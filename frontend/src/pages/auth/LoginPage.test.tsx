// frontend/src/pages/auth/LoginPage.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";
import * as AuthHook from "../../hooks/useAuth";

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation: {
  pathname: string;
  state: { from?: { pathname: string } } | null;
} = {
  pathname: "/login",
  state: null,
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Route: ({ element }) => <div>{element}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  MemoryRouter: ({ children }) => <div>{children}</div>,
}));

// Mock the auth hook
vi.mock("../../hooks/useAuth", async () => {
  const actual = await vi.importActual("../../hooks/useAuth");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock the components used by LoginPage
vi.mock("../../components/auth/LoginForm", () => ({
  default: ({ onUnverifiedEmail }) => (
    <div data-testid="login-form">
      <button
        data-testid="trigger-unverified"
        onClick={() => onUnverifiedEmail("test@example.com")}
      >
        Trigger Unverified Email
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/UnverifiedEmailAlert", () => ({
  default: ({ email, onBackToLogin }) => (
    <div data-testid="unverified-email-alert">
      <p>Unverified email: {email}</p>
      <button data-testid="back-to-login" onClick={onBackToLogin}>
        Back to Login
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

describe("LoginPage", () => {
  const mockClearAuthError = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock location for each test
    mockLocation.state = null;

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
    render(<LoginPage />);

    // Check for AuthCard title and subtitle
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();

    // Check that footer contains links
    const footer = screen.getByTestId("auth-card-footer");
    expect(footer).toContainElement(screen.getByText(/Don't have an account/i));
    expect(footer).toContainElement(screen.getByText("Create an account"));
    expect(footer).toContainElement(
      screen.getByText("Resend verification email")
    );
    expect(footer).toContainElement(screen.getByText("Reset password"));
  });

  it("renders LoginForm by default", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("unverified-email-alert")
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

    render(<LoginPage />);

    // Verify that navigate was called with the correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("redirects to the original location after login", async () => {
    // Set up location with from state
    const fromPath = "/profile";
    mockLocation.state = { from: { pathname: fromPath } };

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

    render(<LoginPage />);

    // Verify that navigate was called with the from path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(fromPath, { replace: true });
    });
  });

  it("switches to unverified email state when handleUnverifiedEmail is called", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Initially should show login form
    expect(screen.getByTestId("login-form")).toBeInTheDocument();

    // Trigger unverified email state
    await user.click(screen.getByTestId("trigger-unverified"));

    // Should now show the unverified email alert with the correct email
    expect(screen.getByTestId("unverified-email-alert")).toBeInTheDocument();
    expect(
      screen.getByText("Unverified email: test@example.com")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();

    // Should clear auth errors when changing states
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("switches back to login form when handleBackToLogin is called", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Go to unverified email state first
    await user.click(screen.getByTestId("trigger-unverified"));
    expect(screen.getByTestId("unverified-email-alert")).toBeInTheDocument();

    // Reset mockClearAuthError calls counter
    mockClearAuthError.mockClear();

    // Go back to login form
    await user.click(screen.getByTestId("back-to-login"));

    // Should show login form again
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("unverified-email-alert")
    ).not.toBeInTheDocument();

    // Should clear auth errors when changing states
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("cleans up errors when unmounting", () => {
    const { unmount } = render(<LoginPage />);

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it("has the correct links in the footer", () => {
    render(<LoginPage />);

    // Check register link
    const registerLink = screen.getByText("Create an account");
    expect(registerLink).toHaveAttribute("href", "/register");

    // Check resend verification link
    const resendLink = screen.getByText("Resend verification email");
    expect(resendLink).toHaveAttribute("href", "/resend-verification");

    // Check forgot password link
    const forgotPasswordLink = screen.getByText("Reset password");
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });
});
