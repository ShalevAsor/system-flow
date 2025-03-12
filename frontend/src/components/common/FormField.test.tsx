// frontend/src/components/common/FormField.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "./FormField";

describe("FormField", () => {
  // Mock register return value from react-hook-form
  const mockRegister = {
    name: "testField",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  };

  it("renders the label and input correctly", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    // Check if label is rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // Check if input is rendered with correct ID
    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute("id", "testId");
  });

  it("applies default type of text if not specified", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("type", "text");
  });

  it("applies custom type when specified", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        type="email"
        register={mockRegister}
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("type", "email");
  });

  it("renders error message when provided", () => {
    const errorMessage = "This field is required";
    render(
      <FormField
        id="testId"
        label="Test Label"
        error={errorMessage}
        register={mockRegister}
      />
    );

    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Check if error message has the correct role and ID
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toHaveAttribute("role", "alert");
    expect(errorElement).toHaveAttribute("id", "testId-error");
  });

  it("does not render error message when not provided", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    // Check that no elements with role="alert" exist
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sets aria-invalid attribute correctly when error is present", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        error="Error message"
        register={mockRegister}
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("aria-invalid", "true");
  });

  it("sets aria-invalid attribute correctly when no error", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("aria-invalid", "false");
  });

  it("sets aria-describedby correctly when error is present", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        error="Error message"
        register={mockRegister}
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("aria-describedby", "testId-error");
  });

  it("does not set aria-describedby when no error", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).not.toHaveAttribute("aria-describedby");
  });

  it("applies error styling when error is present", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        error="Error message"
        register={mockRegister}
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveClass("border-red-300");
    expect(inputElement).toHaveClass("focus:ring-red-500");
    expect(inputElement).toHaveClass("focus:border-red-500");
  });

  it("applies regular styling when no error", () => {
    render(
      <FormField id="testId" label="Test Label" register={mockRegister} />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveClass("border-gray-300");
    expect(inputElement).toHaveClass("focus:ring-blue-500");
    expect(inputElement).toHaveClass("focus:border-blue-500");
  });

  it("renders additional content on the right when provided", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        register={mockRegister}
        renderRight={<span data-testid="right-content">Right Content</span>}
      />
    );

    expect(screen.getByTestId("right-content")).toBeInTheDocument();
    expect(screen.getByText("Right Content")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <FormField
        id="testId"
        label="Test Label"
        register={mockRegister}
        className="custom-class"
      />
    );

    // The outermost div should have the custom class
    const formFieldDiv = container.firstChild;
    expect(formFieldDiv).toHaveClass("custom-class");
    expect(formFieldDiv).toHaveClass("space-y-2");
  });

  it("applies placeholder when provided", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        register={mockRegister}
        placeholder="Enter value here"
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("placeholder", "Enter value here");
  });

  it("applies autocomplete attribute when provided", () => {
    render(
      <FormField
        id="testId"
        label="Test Label"
        register={mockRegister}
        autoComplete="email"
      />
    );

    const inputElement = screen.getByLabelText("Test Label");
    expect(inputElement).toHaveAttribute("autocomplete", "email");
  });
});
