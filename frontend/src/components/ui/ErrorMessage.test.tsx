import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorMessage from "./ErrorMessage";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  XCircle: ({ className }: { className: string }) => (
    <div data-testid="mock-xcircle" className={className}>
      X Circle Icon
    </div>
  ),
  AlertTriangle: ({ className }: { className: string }) => (
    <div data-testid="mock-alert-triangle" className={className}>
      Alert Triangle Icon
    </div>
  ),
  AlertOctagon: ({ className }: { className: string }) => (
    <div data-testid="mock-alert-octagon" className={className}>
      Alert Octagon Icon
    </div>
  ),
}));

describe("ErrorMessage", () => {
  it("renders with default props and severity", () => {
    render(<ErrorMessage title="Error Title" message="Error message text" />);

    // Check title and message
    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error message text")).toBeInTheDocument();

    // Check icon (default is error with XCircle)
    const icon = screen.getByTestId("mock-xcircle");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-red-500");

    // Check background color for error severity
    const container = screen.getByText("Error Title").closest("div");
    expect(container).toHaveClass("bg-red-50");

    // No retry button by default
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders with warning severity", () => {
    render(
      <ErrorMessage
        title="Warning Title"
        message="Warning message text"
        severity="warning"
      />
    );

    // Check icon
    const icon = screen.getByTestId("mock-alert-triangle");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-yellow-500");

    // Check background color
    const container = screen.getByText("Warning Title").closest("div");
    expect(container).toHaveClass("bg-yellow-50");
  });

  it("renders with info severity", () => {
    render(
      <ErrorMessage
        title="Info Title"
        message="Info message text"
        severity="info"
      />
    );

    // Check icon
    const icon = screen.getByTestId("mock-alert-octagon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-blue-500");

    // Check background color
    const container = screen.getByText("Info Title").closest("div");
    expect(container).toHaveClass("bg-blue-50");
  });

  it("renders with retry button when onRetry is provided", async () => {
    const mockRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <ErrorMessage
        title="Error Title"
        message="Error message"
        onRetry={mockRetry}
      />
    );

    // Check retry button
    const retryButton = screen.getByRole("button", { name: "Try Again" });
    expect(retryButton).toBeInTheDocument();

    // Click the retry button
    await user.click(retryButton);

    // Verify onRetry was called
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("uses custom retry text when provided", () => {
    const customRetryText = "Custom Retry Text";

    render(
      <ErrorMessage
        title="Error Title"
        message="Error message"
        onRetry={() => {}}
        retryText={customRetryText}
      />
    );

    // Check retry button with custom text
    const retryButton = screen.getByRole("button", { name: customRetryText });
    expect(retryButton).toBeInTheDocument();
  });

  it("renders with custom actions", () => {
    const customActions = (
      <button data-testid="custom-action">Custom Action</button>
    );

    render(
      <ErrorMessage
        title="Error Title"
        message="Error message"
        actions={customActions}
      />
    );

    // Check custom action is rendered
    expect(screen.getByTestId("custom-action")).toBeInTheDocument();
  });

  it("applies custom class name", () => {
    const customClass = "custom-error-class";

    render(
      <ErrorMessage
        title="Error Title"
        message="Error message"
        className={customClass}
      />
    );

    // Check custom class is applied
    const container = screen.getByText("Error Title").closest("div");
    expect(container).toHaveClass(customClass);
  });

  it("renders with ReactNode message instead of string", () => {
    const complexMessage = (
      <div data-testid="complex-message">
        <strong>Bold text</strong> and <em>italic text</em>
      </div>
    );

    render(<ErrorMessage title="Error Title" message={complexMessage} />);

    // Check complex message is rendered correctly
    expect(screen.getByTestId("complex-message")).toBeInTheDocument();
    expect(screen.getByText("Bold text")).toBeInTheDocument();
    expect(screen.getByText("italic text")).toBeInTheDocument();
  });

  it("renders with both retry button and custom actions", async () => {
    const mockRetry = vi.fn();
    const customActions = (
      <button data-testid="custom-action">Custom Action</button>
    );
    const user = userEvent.setup();

    render(
      <ErrorMessage
        title="Error Title"
        message="Error message"
        onRetry={mockRetry}
        actions={customActions}
      />
    );

    // Check both retry button and custom action are rendered
    const retryButton = screen.getByRole("button", { name: "Try Again" });
    expect(retryButton).toBeInTheDocument();
    expect(screen.getByTestId("custom-action")).toBeInTheDocument();

    // Click the retry button
    await user.click(retryButton);

    // Verify onRetry was called
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
