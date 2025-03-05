import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button Component", () => {
  // Test default rendering

  it("renders the button with default props", () => {
    render(<Button label="Click me" />);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass("bg-blue-600"); // primary color
    expect(button).toHaveClass("py-2 px-4"); // md size
    expect(button).toHaveClass("w-full"); // fullWidth true
  });
  // Test button text/children rendering
  it("renders button text correctly", () => {
    render(<Button label="Submit Form" />);
    expect(screen.getByText("Submit Form")).toBeInTheDocument();
  });

  it("renders children instead of text when provided", () => {
    render(
      <Button label="Fallback Text">
        <span data-testid="child-element">Button Content</span>
      </Button>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.queryByText("Fallback Text")).not.toBeInTheDocument();
  });

  // Test button types
  it("renders with correct button types", () => {
    const { rerender } = render(<Button label="Button" type="button" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");

    rerender(<Button label="Submit" type="submit" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");

    rerender(<Button label="Reset" type="reset" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
  });

  // Test disabled state
  it("renders in disabled state when disabled prop is true", () => {
    render(<Button label="Disabled Button" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
  });

  // Test color variations
  it("applies the correct color classes based on the variant prop", () => {
    const variants: Array<
      "primary" | "secondary" | "success" | "danger" | "warning" | "info"
    > = ["primary", "secondary", "success", "danger", "warning", "info"];

    const variantClasses = {
      primary: "bg-blue-600",
      secondary: "bg-gray-600",
      success: "bg-green-600",
      danger: "bg-red-600",
      warning: "bg-yellow-600",
      info: "bg-indigo-600",
    };

    const { rerender } = render(
      <Button label="Colored Button" variant="primary" />
    );

    for (const variant of variants) {
      rerender(<Button label="Colored Button" variant={variant} />);
      expect(screen.getByRole("button")).toHaveClass(variantClasses[variant]);
    }
  });

  // Test size variations
  it("applies the correct size classes based on the size prop", () => {
    const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"];

    const sizeClasses = {
      sm: "py-1 px-3 text-xs",
      md: "py-2 px-4 text-sm",
      lg: "py-3 px-6 text-base",
    };

    const { rerender } = render(<Button label="Sized Button" size="md" />);

    for (const size of sizes) {
      rerender(<Button label="Sized Button" size={size} />);

      // Use the sizeClasses object directly to check for each class
      const classes = sizeClasses[size].split(" ");
      for (const className of classes) {
        expect(screen.getByRole("button")).toHaveClass(className);
      }
    }
  });

  // Test fullWidth prop
  it("applies full width class when fullWidth is true", () => {
    const { rerender } = render(<Button label="Full Width" fullWidth={true} />);
    expect(screen.getByRole("button")).toHaveClass("w-full");

    rerender(<Button label="Auto Width" fullWidth={false} />);
    expect(screen.getByRole("button")).not.toHaveClass("w-full");
  });

  // Test custom class names
  it("applies additional class names from className prop", () => {
    render(<Button label="Custom Class" className="my-custom-class" />);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });

  // Test onClick handler
  it("calls the onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button label="Click Me" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test disabled button doesn't fire onClick
  it("does not call onClick when button is disabled", () => {
    const handleClick = vi.fn();
    render(<Button label="Disabled Button" onClick={handleClick} disabled />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test aria attributes
  it("applies aria attributes correctly", () => {
    render(
      <Button
        label="Accessible Button"
        ariaAttributes={{
          "aria-label": "Submit Form",
          "aria-pressed": "false",
        }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Submit Form");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
