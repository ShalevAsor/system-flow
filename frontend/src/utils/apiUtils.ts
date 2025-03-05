// src/utils/apiUtils.ts
import axios, { AxiosError } from "axios";
import { ApiErrorResponse } from "../services/api/apiClient"; // Import your error response type

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
