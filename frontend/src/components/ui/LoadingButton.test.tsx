import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingButton from "./LoadingButton";

describe("LoadingButton Component", () => {
  // Test default rendering (not loading)
  it("renders button with text when not loading", () => {
    render(<LoadingButton label="Submit" isLoading={false} />);

    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
    expect(document.querySelector("svg.animate-spin")).not.toBeInTheDocument();
  });

  // Test loading state
  it("shows spinner and loading text when isLoading is true", () => {
    render(<LoadingButton label="Submit" isLoading={true} />);

    // Check for loading spinner
    const spinner = document.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();

    // Check for loading text
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Original text should not be visible
    expect(screen.queryByText(/^Submit$/)).not.toBeInTheDocument();

    // Button should be disabled when loading
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // Test custom loading text
  it("displays custom loading text when provided", () => {
    render(
      <LoadingButton
        label="Submit"
        isLoading={true}
        loadingText="Please wait..."
      />
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  // Test disabled state
  it("is disabled when disabled prop is true", () => {
    render(<LoadingButton label="Submit" isLoading={false} disabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  // Test disabled state during loading
  it("is disabled when loading, regardless of disabled prop", () => {
    render(<LoadingButton label="Submit" isLoading={true} disabled={false} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  // Test props pass through to Button component
  it("passes props through to Button component", () => {
    render(
      <LoadingButton
        label="Danger"
        variant="danger"
        size="lg"
        className="custom-class"
        isLoading={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-red-600"); // danger color
    expect(button).toHaveClass("py-3"); // lg size
    expect(button).toHaveClass("custom-class"); // custom class
  });
});
