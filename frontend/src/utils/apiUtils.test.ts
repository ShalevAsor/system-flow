// frontend/src/utils/apiUtils.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { isApiError, getErrorMessage, parseApiError } from "./apiUtils";
import { ErrorType } from "../types/errors";

// Mock axios.isAxiosError
vi.mock("axios", () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

// Mock console.warn to avoid cluttering test output
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("apiUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isApiError", () => {
    it("returns true for valid API errors", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error
      const apiError = {
        response: {
          data: {
            message: "Invalid request",
          },
        },
      };

      expect(isApiError(apiError)).toBe(true);
    });

    it("returns false for non-axios errors", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const regularError = new Error("Regular error");
      expect(isApiError(regularError)).toBe(false);
    });

    it("returns false for axios errors without response", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const axiosErrorWithoutResponse = {};
      expect(isApiError(axiosErrorWithoutResponse)).toBe(false);
    });

    it("returns false for axios errors without data", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const axiosErrorWithoutData = {
        response: {},
      };
      expect(isApiError(axiosErrorWithoutData)).toBe(false);
    });

    it("returns false for axios errors without message", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const axiosErrorWithoutMessage = {
        response: {
          data: {},
        },
      };
      expect(isApiError(axiosErrorWithoutMessage)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("returns field error message from API errors with errors object", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error with validation errors
      const apiError = {
        response: {
          data: {
            message: "Validation failed",
            errors: {
              email: "Email is required",
              password: "Password must be at least 8 characters",
            },
          },
        },
      };

      // Should return the first error message
      expect(getErrorMessage(apiError)).toBe("Email is required");
    });

    it("returns general message from API errors without errors object", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error without validation errors
      const apiError = {
        response: {
          data: {
            message: "User not found",
          },
        },
      };

      expect(getErrorMessage(apiError)).toBe("User not found");
    });

    it("returns message from regular Error objects", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const regularError = new Error("Something went wrong");
      expect(getErrorMessage(regularError)).toBe("Something went wrong");
    });

    it("returns default message for unknown errors", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      expect(getErrorMessage(null)).toBe("An unexpected error occurred");
      expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
      expect(getErrorMessage(123)).toBe("An unexpected error occurred");
    });

    it("returns fallback message when API error has no message", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error with empty data
      const apiError = {
        response: {
          data: {},
        },
      };

      expect(getErrorMessage(apiError)).toBe("An unexpected error occurred");
    });
  });

  describe("parseApiError", () => {
    it("returns the error if it's already an AppError", () => {
      // Create a mock AppError
      const appError = {
        type: ErrorType.AUTH_UNAUTHORIZED,
        message: "Unauthorized",
        originalError: new Error("Unauthorized"),
      };

      const result = parseApiError(appError);
      expect(result).toBe(appError);
    });

    it("converts API errors to AppError", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error
      const apiError = {
        response: {
          data: {
            message: "Resource not found",
            errors: {
              id: "Invalid ID",
            },
          },
        },
      };

      const result = parseApiError(apiError);
      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe("Resource not found");
      expect(result.fieldErrors).toEqual({ id: "Invalid ID" });
      expect(result.originalError).toBe(apiError);
    });

    it("converts regular Error objects to AppError", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const regularError = new Error("Something went wrong");
      const result = parseApiError(regularError);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe("Something went wrong");
      expect(result.originalError).toBe(regularError);
    });

    it("converts string errors to AppError", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const result = parseApiError("String error message");

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe("String error message");
      expect(result.originalError).toBe("String error message");
    });

    it("provides default message for unknown errors", () => {
      // Setup axios mock to identify as non-axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      const result = parseApiError(null);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe("An unknown error occurred");
      expect(result.originalError).toBe(null);
    });

    it("logs a warning for API errors that bypass the interceptor", () => {
      // Setup axios mock to identify as axios error
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      // Create a mock API error
      const apiError = {
        response: {
          data: {
            message: "Resource not found",
          },
        },
      };

      parseApiError(apiError);

      // Verify that a warning was logged
      expect(console.warn).toHaveBeenCalledWith(
        "API error not caught by interceptor",
        apiError
      );
    });
  });
});
