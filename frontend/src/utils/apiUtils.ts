import axios, { AxiosError } from "axios";
import { ApiErrorResponse } from "../types/apiTypes";
import { AppError, ErrorType, createAppError } from "../types/errors";

/**
 * Type guard to check if an unknown error is an API error with expected structure
 */
export function isApiError(
  error: unknown
): error is AxiosError<ApiErrorResponse> {
  return (
    axios.isAxiosError(error) &&
    error.response !== undefined &&
    error.response.data !== undefined &&
    typeof error.response.data.message === "string"
  );
}

/**
 * Extract user-friendly error message from API errors
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // Return the most specific error message available
    if (error.response?.data.errors) {
      // Get the first error message from the errors object
      const firstError = Object.values(error.response.data.errors)[0];
      if (firstError) return firstError;
    }

    // Fall back to the general message
    return error.response?.data.message || "An error occurred";
  }

  // For non-API errors, provide a generic message
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export function parseApiError(error: unknown): AppError {
  // If it's already an AppError, just return it
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error
  ) {
    return error as AppError;
  }

  // If it's an API error but somehow bypassed the interceptor
  if (isApiError(error)) {
    // This should rarely happen since the interceptor should catch these
    console.warn("API error not caught by interceptor", error);

    // Use simpler logic - the detailed parsing should be in the interceptor
    return createAppError(
      ErrorType.UNKNOWN_ERROR,
      error.response?.data?.message || "API error occurred",
      error.response?.data?.errors,
      error
    );
  }

  // For other error types
  if (error instanceof Error) {
    return createAppError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      undefined,
      error
    );
  }

  // Default case
  return createAppError(
    ErrorType.UNKNOWN_ERROR,
    typeof error === "string" ? error : "An unknown error occurred",
    undefined,
    error
  );
}
