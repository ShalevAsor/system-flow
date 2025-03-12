import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthCard from "./AuthCard";

describe("AuthCard", () => {
  it("renders title correctly", () => {
    render(
      <AuthCard title="Welcome Back">
        <div>Test content</div>
      </AuthCard>
    );

    expect(
      screen.getByRole("heading", { name: "Welcome Back" })
    ).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <AuthCard title="Welcome">
        <div data-testid="test-content">Form content goes here</div>
      </AuthCard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Form content goes here")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <AuthCard title="Create Account" subtitle="Join our community today">
        <div>Test content</div>
      </AuthCard>
    );

    expect(screen.getByText("Join our community today")).toBeInTheDocument();
  });

  it("doesn't render subtitle when not provided", () => {
    render(
      <AuthCard title="Reset Password">
        <div>Test content</div>
      </AuthCard>
    );

    // Check that there's no paragraph element within the header area
    const headerArea = screen.getByRole("heading", {
      name: "Reset Password",
    }).parentElement;
    expect(headerArea?.querySelector("p")).toBeNull();
  });

  it("renders footer when provided", () => {
    render(
      <AuthCard
        title="Login"
        footer={
          <span>
            Don't have an account? <a href="/register">Sign up</a>
          </span>
        }
      >
        <div>Test content</div>
      </AuthCard>
    );

    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("doesn't render footer when not provided", () => {
    render(
      <AuthCard title="Verify Email">
        <div>Test content</div>
      </AuthCard>
    );

    // There should be only one div with the text-center class (the header),
    // not a second one for the footer
    const textCenterDivs = document.querySelectorAll(".text-center");
    expect(textCenterDivs.length).toBe(1);
  });

  it("applies correct styling to container", () => {
    const { container } = render(
      <AuthCard title="Login">
        <div>Test content</div>
      </AuthCard>
    );

    const card = container.firstChild;
    expect(card).toHaveClass(
      "bg-white",
      "shadow-md",
      "rounded-lg",
      "p-8",
      "max-w-md",
      "w-full",
      "mx-auto"
    );
  });
});
