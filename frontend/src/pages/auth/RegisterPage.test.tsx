// frontend/src/pages/auth/RegisterPage.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./RegisterPage";
import { useAuthStore } from "../../store/authStore";
import { createMockAuthState } from "../../utils/testUtils";

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

// Mock Zustand store
vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock the components used by RegisterPage
vi.mock("../../components/auth/RegisterForm", () => ({
  default: ({ onRegistrationSuccess }) => (
    <div data-testid="register-form">
      <button
        data-testid="trigger-registration-success"
        onClick={() => onRegistrationSuccess("test@example.com")}
      >
        Submit Registration
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/RegistrationSuccessAlert", () => ({
  default: ({ email }) => (
    <div data-testid="registration-success-alert">
      <p>Registration success for: {email}</p>
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
  default: ({ showLogin, showResendVerification }) => (
    <div data-testid="auth-footer">
      {showLogin && <a href="/login">Sign in</a>}
      {showResendVerification && (
        <a href="/resend-verification">Resend verification email</a>
      )}
    </div>
  ),
}));

describe("RegisterPage", () => {
  const mockClearError = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn(); // Suppress console.log

    // Setup default mock state with clearError spy
    const mockState = createMockAuthState({
      clearError: mockClearError,
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });
  });

  it("renders the AuthCard with correct props", () => {
    render(<RegisterPage />);

    // Check for AuthCard title and subtitle
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(
      screen.getByText("Fill in your details to register")
    ).toBeInTheDocument();

    // Check that footer contains expected elements
    expect(screen.getByTestId("auth-footer")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Resend verification email")).toBeInTheDocument();
  });

  it("renders RegisterForm by default", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("registration-success-alert")
    ).not.toBeInTheDocument();
  });

  it("redirects to dashboard if user is already authenticated", async () => {
    // Mock authenticated user state
    const authenticatedState = createMockAuthState({
      isAuthenticated: true,
      clearError: mockClearError,
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(authenticatedState);
      }
      return authenticatedState;
    });

    render(<RegisterPage />);

    // Verify that navigate was called with the correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("shows registration success alert after successful registration", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Initially should show register form
    expect(screen.getByTestId("register-form")).toBeInTheDocument();

    // Trigger registration success
    await user.click(screen.getByTestId("trigger-registration-success"));

    // Should now show the registration success alert with the correct email
    expect(
      screen.getByTestId("registration-success-alert")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Registration success for: test@example.com")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("register-form")).not.toBeInTheDocument();

    // Should clear auth errors
    expect(mockClearError).toHaveBeenCalled();
  });

  it("cleans up errors when unmounting", () => {
    const { unmount } = render(<RegisterPage />);

    // Reset calls count before unmount
    mockClearError.mockClear();

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockClearError).toHaveBeenCalled();
  });

  it("has the correct links in the footer", () => {
    render(<RegisterPage />);

    // Check login link
    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toHaveAttribute("href", "/login");

    // Check resend verification link
    const resendLink = screen.getByText("Resend verification email");
    expect(resendLink).toHaveAttribute("href", "/resend-verification");
  });
});
