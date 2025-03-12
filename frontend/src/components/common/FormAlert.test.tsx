import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormAlert from "./FormAlert";

describe("FormAlert", () => {
  // Setup timers for testing auto-hide functionality
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<FormAlert message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error alert by default", () => {
    const message = "This is an error message";
    render(<FormAlert message={message} />);

    // Check that the message is displayed
    expect(screen.getByText(message)).toBeInTheDocument();

    // Check that the title is "Error" (default variant)
    expect(screen.getByText("Error")).toBeInTheDocument();

    // Check for error styling
    const alertContainer = screen
      .getByText("Error")
      .closest("div[class*='bg-red-50']");
    expect(alertContainer).toBeInTheDocument();
  });

  it("renders warning variant correctly", () => {
    const message = "This is a warning message";
    render(<FormAlert message={message} variant="warning" />);

    // Check that the message is displayed
    expect(screen.getByText(message)).toBeInTheDocument();

    // Check that the title is "Warning"
    expect(screen.getByText("Warning")).toBeInTheDocument();

    // Check for warning styling
    const alertContainer = screen
      .getByText("Warning")
      .closest("div[class*='bg-yellow-50']");
    expect(alertContainer).toBeInTheDocument();
  });

  it("renders success variant correctly", () => {
    const message = "This is a success message";
    render(<FormAlert message={message} variant="success" />);

    // Check that the message is displayed
    expect(screen.getByText(message)).toBeInTheDocument();

    // Check that the title is "Success"
    expect(screen.getByText("Success")).toBeInTheDocument();

    // Check for success styling
    const alertContainer = screen
      .getByText("Success")
      .closest("div[class*='bg-green-50']");
    expect(alertContainer).toBeInTheDocument();
  });

  it("renders info variant correctly", () => {
    const message = "This is an info message";
    render(<FormAlert message={message} variant="info" />);

    // Check that the message is displayed
    expect(screen.getByText(message)).toBeInTheDocument();

    // Check that the title is "Information"
    expect(screen.getByText("Information")).toBeInTheDocument();

    // Check for info styling
    const alertContainer = screen
      .getByText("Information")
      .closest("div[class*='bg-blue-50']");
    expect(alertContainer).toBeInTheDocument();
  });

  it("renders close button when showCloseButton is true", () => {
    render(<FormAlert message="Test message" showCloseButton={true} />);

    // Check that the dismiss button is present
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("doesn't render close button when showCloseButton is false", () => {
    render(<FormAlert message="Test message" showCloseButton={false} />);

    // Check that the dismiss button is not present
    expect(
      screen.queryByRole("button", { name: "Dismiss" })
    ).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    // Use real timers for this test to avoid timing issues
    vi.useRealTimers();

    const handleClose = vi.fn();
    render(
      <FormAlert
        message="Test message"
        showCloseButton={true}
        onClose={handleClose}
      />
    );

    // Find the dismiss button
    const dismissButton = screen.getByRole("button", { name: /dismiss/i });

    // Use fireEvent instead of userEvent
    fireEvent.click(dismissButton);

    // Check that onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("auto-hides after specified duration", () => {
    const handleClose = vi.fn();
    render(
      <FormAlert
        message="Test message"
        autoHideDuration={3000}
        onClose={handleClose}
      />
    );

    // Initially the alert should be visible
    expect(screen.getByText("Test message")).toBeInTheDocument();

    // Advance timers by the auto-hide duration
    vi.advanceTimersByTime(3000);

    // Check that onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("clears auto-hide timer on unmount", () => {
    const handleClose = vi.fn();
    const { unmount } = render(
      <FormAlert
        message="Test message"
        autoHideDuration={3000}
        onClose={handleClose}
      />
    );

    // Unmount before timer expires
    unmount();

    // Advance timers past the auto-hide duration
    vi.advanceTimersByTime(4000);

    // onClose should not have been called
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("updates message when prop changes", () => {
    const { rerender } = render(<FormAlert message="Initial message" />);

    // Check initial message
    expect(screen.getByText("Initial message")).toBeInTheDocument();

    // Update message
    rerender(<FormAlert message="Updated message" />);

    // Check updated message
    expect(screen.getByText("Updated message")).toBeInTheDocument();
    expect(screen.queryByText("Initial message")).not.toBeInTheDocument();
  });

  it("hides when message changes to null", () => {
    const { rerender, container } = render(
      <FormAlert message="Initial message" />
    );

    // Check initial message
    expect(screen.getByText("Initial message")).toBeInTheDocument();

    // Update message to null
    rerender(<FormAlert message={null} />);

    // Check that alert is no longer rendered
    expect(container.firstChild).toBeNull();
  });
});
