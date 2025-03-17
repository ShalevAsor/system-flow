import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AuthFooter from "./AuthFooter";

// Helper function to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("AuthFooter", () => {
  it("shows login link when showLogin is true", () => {
    renderWithRouter(<AuthFooter showLogin />);

    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows register link when showRegister is true", () => {
    renderWithRouter(<AuthFooter showRegister />);

    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create an account/i })
    ).toHaveAttribute("href", "/register");
  });

  it("shows forgot password link when showForgotPassword is true", () => {
    renderWithRouter(<AuthFooter showForgotPassword />);

    expect(screen.getByText("Reset password")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /reset password/i })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("shows resend verification link when showResendVerification is true", () => {
    renderWithRouter(<AuthFooter showResendVerification />);

    expect(screen.getByText("Resend verification email")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /resend verification email/i })
    ).toHaveAttribute("href", "/resend-verification");
  });

  it("shows divider between resend verification and forgot password links", () => {
    renderWithRouter(<AuthFooter showResendVerification showForgotPassword />);

    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("shows no links when no props are provided", () => {
    renderWithRouter(<AuthFooter />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("uses custom text when provided", () => {
    const customText = {
      loginText: "Custom login",
      registerText: "Custom register",
      resendVerificationText: "Custom resend",
      forgotPasswordText: "Custom reset",
    };

    renderWithRouter(
      <AuthFooter
        showLogin
        showRegister
        showResendVerification
        showForgotPassword
        customText={customText}
      />
    );

    // Check for the custom text in each link
    expect(
      screen.getByRole("link", { name: "Custom login" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Custom register" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Custom resend" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Custom reset" })
    ).toBeInTheDocument();
  });
});
