import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnverifiedEmailAlert from "./UnverifiedEmailAlert";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock the components used by UnverifiedEmailAlert
vi.mock("../common/FormAlert", () => ({
  default: ({ message, variant }) => (
    <div data-testid={`form-alert-${variant}`} role="alert">
      {message}
    </div>
  ),
}));

vi.mock("./EmailVerificationResend", () => ({
  default: ({ email }) => (
    <div data-testid="email-verification-resend">
      Resend verification email to: {email}
    </div>
  ),
}));

describe("UnverifiedEmailAlert", () => {
  const testEmail = "test@example.com";

  it("renders the warning message with the correct email", () => {
    render(<UnverifiedEmailAlert email={testEmail} />);

    const alertElement = screen.getByTestId("form-alert-warning");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent(
      `The email address ${testEmail} has not been verified yet`
    );
    expect(alertElement).toHaveTextContent(
      "Please check your inbox for the verification email and click the link to verify your account"
    );
  });

  it("renders the EmailVerificationResend component with the correct email", () => {
    render(<UnverifiedEmailAlert email={testEmail} />);

    const resendComponent = screen.getByTestId("email-verification-resend");
    expect(resendComponent).toBeInTheDocument();
    expect(resendComponent).toHaveTextContent(
      `Resend verification email to: ${testEmail}`
    );
  });

  it("renders a Link to login when onBackToLogin is not provided", () => {
    render(<UnverifiedEmailAlert email={testEmail} />);

    const loginLink = screen.getByText("Back to Login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.tagName).toBe("A");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders a button and calls onBackToLogin when provided", async () => {
    const user = userEvent.setup();
    const handleBackToLogin = vi.fn();

    render(
      <UnverifiedEmailAlert
        email={testEmail}
        onBackToLogin={handleBackToLogin}
      />
    );

    const backButton = screen.getByText("Back to Login");
    expect(backButton).toBeInTheDocument();
    expect(backButton.tagName).toBe("BUTTON");

    // Click the button
    await user.click(backButton);

    // Verify the handler was called
    expect(handleBackToLogin).toHaveBeenCalledTimes(1);
  });
});
