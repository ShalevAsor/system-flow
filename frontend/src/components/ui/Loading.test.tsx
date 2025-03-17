import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "./Loading";

// Mock Lucide React
vi.mock("lucide-react", () => ({
  Loader: ({ className }: { className: string }) => (
    <div data-testid="mock-loader" className={className}>
      Loader Icon
    </div>
  ),
}));

describe("Loading", () => {
  it("renders inline variant with default props", () => {
    render(<Loading />);

    // Check if loader icon exists
    const loader = screen.getByTestId("mock-loader");
    expect(loader).toBeInTheDocument();

    // Check default classes for medium size
    expect(loader).toHaveClass("h-8 w-8");
    expect(loader).toHaveClass("animate-spin");

    // Check default message
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Check if it's using inline variant
    const container = loader.parentElement;
    expect(container).toHaveClass("flex items-center");
  });

  it("renders with custom message", () => {
    const customMessage = "Custom loading message";
    render(<Loading message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("renders without message when message is empty", () => {
    render(<Loading message="" />);

    // The loader should be there
    expect(screen.getByTestId("mock-loader")).toBeInTheDocument();

    // But no message text element
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("applies small size correctly", () => {
    render(<Loading size="sm" />);

    const loader = screen.getByTestId("mock-loader");
    expect(loader).toHaveClass("h-4 w-4");

    // Check text size
    const messageElement = screen.getByText("Loading...");
    expect(messageElement).toHaveClass("text-xs");
  });

  it("applies large size correctly", () => {
    render(<Loading size="lg" />);

    const loader = screen.getByTestId("mock-loader");
    expect(loader).toHaveClass("h-12 w-12");

    // Check text size
    const messageElement = screen.getByText("Loading...");
    expect(messageElement).toHaveClass("text-base");
  });

  it("renders fullPage variant correctly", () => {
    render(<Loading variant="fullPage" />);

    // Check if loader icon exists
    const loader = screen.getByTestId("mock-loader");
    expect(loader).toBeInTheDocument();

    // Check if it has the fullPage classes
    const container = screen.getByText("Loader Icon").closest("div");
    expect(container?.parentElement?.parentElement).toHaveClass(
      "fixed inset-0"
    );
    expect(container?.parentElement?.parentElement).toHaveClass(
      "bg-white bg-opacity-80"
    );
    expect(container?.parentElement?.parentElement).toHaveClass("z-50");
  });

  it("renders content variant correctly", () => {
    render(<Loading variant="content" />);

    // Check if loader icon exists
    const loader = screen.getByTestId("mock-loader");
    expect(loader).toBeInTheDocument();

    // Check if it has the content variant classes
    const container = screen.getByText("Loader Icon").closest("div");
    expect(container?.parentElement?.parentElement).toHaveClass(
      "min-h-[200px]"
    );
    expect(container?.parentElement?.parentElement).toHaveClass("w-full");
  });

  it("applies custom class name", () => {
    const customClass = "custom-class-name";

    // Test with inline variant
    const { rerender } = render(<Loading className={customClass} />);
    // For inline variant, the custom class is applied to the outer flex container
    const container = screen.getByTestId("mock-loader").parentElement;
    expect(container).toHaveClass(customClass);

    // Test with content variant
    rerender(<Loading variant="content" className={customClass} />);
    // For content variant, the custom class is applied to the outer container
    const contentContainer = screen.getByTestId("mock-loader").closest("div")
      ?.parentElement?.parentElement;
    // Make sure the element exists before checking classes
    expect(contentContainer).not.toBeNull();
    expect(contentContainer).toHaveClass(customClass);
  });

  it("centers the spinner and message for non-inline variants", () => {
    // Test content variant
    const { rerender } = render(<Loading variant="content" />);

    const contentWrapper = screen
      .getByText("Loader Icon")
      .closest("div")?.parentElement;
    expect(contentWrapper).toHaveClass("text-center");

    // Test fullPage variant
    rerender(<Loading variant="fullPage" />);

    const fullPageWrapper = screen
      .getByText("Loader Icon")
      .closest("div")?.parentElement;
    expect(fullPageWrapper).toHaveClass("text-center");
  });
});
