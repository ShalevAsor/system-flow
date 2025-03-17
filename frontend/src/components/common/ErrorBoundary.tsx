// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import ErrorMessage from "../ui/ErrorMessage";

interface ErrorBoundaryProps {
  /**
   * The components that this error boundary wraps
   */
  children: ReactNode;

  /**
   * Custom fallback UI to show when an error occurs
   */
  fallback?: ReactNode;

  /**
   * Optional name to identify where the error occurred
   */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its
 * child component tree and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error(
      `Error caught by ErrorBoundary${
        this.props.name ? ` in ${this.props.name}` : ""
      }:`,
      error
    );
    console.error("Component stack:", errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="w-full max-w-md">
            <ErrorMessage
              title="Something went wrong"
              message="We're sorry, but there was an error displaying this content."
              severity="error"
              onRetry={() => this.setState({ hasError: false, error: null })}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
