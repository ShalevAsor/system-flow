/**
 * Enum for categorizing different types of errors
 */
export enum ErrorType {
  // Auth related errors
  AUTH_UNAUTHORIZED = "auth/unauthorized",
  AUTH_TOKEN_EXPIRED = "auth/token-expired",
  AUTH_INVALID_CREDENTIALS = "auth/invalid-credentials",
  AUTH_EMAIL_UNVERIFIED = "auth/email-unverified",
  AUTH_EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",
  AUTH_INVALID_RESET_TOKEN = "auth/invalid-reset-token",
  AUTH_FORBIDDEN = "auth/forbidden",
  // Profile-related errors
  PROFILE_INCORRECT_PASSWORD = "profile/incorrect-password",
  // Form validation errors
  VALIDATION_ERROR = "validation/error",

  // API related errors
  API_SERVER_ERROR = "api/server-error",
  API_CONNECTION_ERROR = "api/connection-error",
  API_TIMEOUT_ERROR = "api/timeout-error",
  // Resource errors
  RESOURCE_NOT_FOUND = "resource/not-found",
  RESOURCE_CONFLICT = "resource/conflict",

  // Client errors
  BAD_REQUEST = "client/bad-request",

  // General errors
  UNKNOWN_ERROR = "general/unknown-error",
}

/**
 * Interface for a structured application error
 */
export interface AppError {
  type: ErrorType;
  message: string;
  fieldErrors?: Record<string, string>;
  originalError?: unknown;
}

/**
 * Creates a consistent application error object
 */
export function createAppError(
  type: ErrorType,
  message: string,
  fieldErrors?: Record<string, string>,
  originalError?: unknown
): AppError {
  return {
    type,
    message,
    fieldErrors,
    originalError,
  };
}

/**
 * Default parse function to ensure we always have a valid AppError
 * This acts as a fallback in case an error comes through that hasn't been
 * properly converted to an AppError
 */
export function ensureAppError(error: unknown): AppError {
  // If it's already an AppError, just return it
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error
  ) {
    return error as AppError;
  }

  // For other errors, create a generic error
  if (error instanceof Error) {
    return createAppError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      undefined,
      error
    );
  }

  // For completely unknown errors
  return createAppError(
    ErrorType.UNKNOWN_ERROR,
    typeof error === "string" ? error : "An unknown error occurred",
    undefined,
    error
  );
}
