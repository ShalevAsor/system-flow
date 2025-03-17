import React from "react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

// Create a component that throws an error when rendered
const ErrorComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div data-testid="normal-component">Everything is fine</div>;
};

// Create a component with a button that throws an error when clicked
const ButtonThatThrows = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error("Error from button click");
  }

  return (
    <button data-testid="throw-button" onClick={() => setShouldThrow(true)}>
      Throw Error
    </button>
  );
};

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Replace console.error with a mock
    console.error = vi.fn();
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Restore original console.error after all tests
    console.error = originalConsoleError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="test-child">Test Child</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("renders fallback UI when an error occurs", () => {
    // Suppress React's error boundary warning in test output
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Verify the default error message is displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're sorry, but there was an error displaying this content."
      )
    ).toBeInTheDocument();

    // Error should have been logged
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalError;
  });

  it("renders custom fallback UI when provided", () => {
    render(
      <ErrorBoundary
        fallback={<div data-testid="custom-fallback">Custom Error UI</div>}
      >
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
  });

  it("includes component name in error log when provided", () => {
    const componentName = "TestComponent";

    render(
      <ErrorBoundary name={componentName}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error was logged with the component name
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `Error caught by ErrorBoundary in ${componentName}:`
      ),
      expect.any(Error)
    );
  });

  it("allows retry after an error occurs", async () => {
    const user = userEvent.setup();

    // Use a wrapper component that can toggle the error state
    const TestWrapper = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <div>
          <button
            data-testid="fix-error-button"
            onClick={() => setShouldThrow(false)}
          >
            Fix Error
          </button>

          <ErrorBoundary>
            <ErrorComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>
      );
    };

    render(<TestWrapper />);

    // Initially, the error boundary should show the error message
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click the retry button on the error message
    await user.click(screen.getByRole("button", { name: /try again/i }));

    // Error should still show because we haven't fixed the root cause
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Now fix the error by clicking the button outside the error boundary
    await user.click(screen.getByTestId("fix-error-button"));

    // Click try again button
    await user.click(screen.getByRole("button", { name: /try again/i }));

    // Now the normal component should be displayed
    expect(screen.getByTestId("normal-component")).toBeInTheDocument();
    expect(screen.getByText("Everything is fine")).toBeInTheDocument();
  });

  it("catches errors that occur during user interactions", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ButtonThatThrows />
      </ErrorBoundary>
    );

    // Initially, the button should be displayed
    expect(screen.getByTestId("throw-button")).toBeInTheDocument();

    // Click the button to trigger an error
    await user.click(screen.getByTestId("throw-button"));

    // Error boundary should now show the fallback UI
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
