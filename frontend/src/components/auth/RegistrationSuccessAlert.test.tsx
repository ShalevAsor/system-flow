import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegistrationSuccessAlert from "./RegistrationSuccessAlert";

// Mock the components used by RegistrationSuccessAlert
vi.mock("./SuccessStateCard", () => ({
  default: ({ title, message, email, icon, children }) => (
    <div data-testid="success-state-card">
      <h2>{title}</h2>
      <p data-testid="message">
        {message.includes("{email}")
          ? message.replace("{email}", email)
          : message}
      </p>
      <div data-testid="icon">{icon}</div>
      {children && <div data-testid="children-content">{children}</div>}
    </div>
  ),
}));

vi.mock("./EmailVerificationResend", () => ({
  default: ({ email, successMessage }) => (
    <div data-testid="email-verification-resend">
      <p>Resend verification to: {email}</p>
      <p>Success message: {successMessage}</p>
    </div>
  ),
}));

describe("RegistrationSuccessAlert", () => {
  const testEmail = "test@example.com";

  it("renders the SuccessStateCard with correct props", () => {
    render(<RegistrationSuccessAlert email={testEmail} />);

    // Check that SuccessStateCard is rendered with correct title
    expect(screen.getByTestId("success-state-card")).toBeInTheDocument();
    expect(screen.getByText("Registration Successful")).toBeInTheDocument();

    // Check that the message includes the email
    const message = screen.getByTestId("message");
    expect(message).toHaveTextContent(
      `We've sent a verification email to ${testEmail}`
    );
    expect(message).toHaveTextContent(
      "Please check your inbox and click the verification link to activate your account"
    );

    // Check the icon type
    expect(screen.getByTestId("icon")).toHaveTextContent("mail");
  });

  it("renders the EmailVerificationResend component with correct props", () => {
    render(<RegistrationSuccessAlert email={testEmail} />);

    // Check that EmailVerificationResend is rendered within the children content
    const childrenContent = screen.getByTestId("children-content");
    expect(childrenContent).toContainElement(
      screen.getByTestId("email-verification-resend")
    );

    // Check EmailVerificationResend props
    const resendComponent = screen.getByTestId("email-verification-resend");
    expect(resendComponent).toHaveTextContent(
      `Resend verification to: ${testEmail}`
    );
    expect(resendComponent).toHaveTextContent(
      "Success message: We've sent you another verification email. Please check your inbox."
    );
  });
});
