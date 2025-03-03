// App.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock the auth context to avoid actual API calls
vi.mock("./context/auth/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>{children}</React.Fragment>
  ),
}));

// Mock the components
vi.mock("./components/auth/LoginForm", () => ({
  default: () => <div>Login</div>,
}));

vi.mock("./components/auth/RegisterForm", () => ({
  default: () => <div>Register</div>,
}));

vi.mock("./pages/Home", () => ({
  default: () => <div>Home Page</div>,
}));

describe("App Component", () => {
  it("renders the heading and login form by default", () => {
    render(<App />);

    // Check for heading
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Script-to-UI Web App"
    );

    // Check for login form
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check for register link
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  it("switches to register form when register button is clicked", async () => {
    render(<App />);
    const registerButton = screen.getByRole("button", { name: "Register" });

    // Click register button
    await userEvent.click(registerButton);

    // Check that register form is now shown
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("switches back to login form when login button is clicked", async () => {
    render(<App />);

    // First switch to register
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    // Then switch back to login
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    // Check that login form is shown again
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });
});
