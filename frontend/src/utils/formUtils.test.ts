// frontend/src/utils/formUtils.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setFormErrors } from "./formUtils";
import { AppError, ErrorType } from "../types/errors";

// Mock console.log and console.warn to avoid cluttering test output
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("formUtils", () => {
  describe("setFormErrors", () => {
    // Create a mock setError function for each test
    const mockSetError = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("sets field errors correctly from AppError", () => {
      const error: AppError = {
        type: ErrorType.VALIDATION_ERROR,
        message: "Validation failed",
        fieldErrors: {
          email: "Email is invalid",
          password: "Password is too short",
        },
      };

      const result = setFormErrors(error, mockSetError);

      // Verify setError was called twice (once for each field)
      expect(mockSetError).toHaveBeenCalledTimes(2);

      // Verify setError was called with correct arguments for each field
      expect(mockSetError).toHaveBeenCalledWith("email", {
        type: "server",
        message: "Email is invalid",
      });

      expect(mockSetError).toHaveBeenCalledWith("password", {
        type: "server",
        message: "Password is too short",
      });

      // Verify no general error message is returned since we have field errors
      expect(result).toBeNull();
    });

    it("handles field mapping correctly", () => {
      const error: AppError = {
        type: ErrorType.VALIDATION_ERROR,
        message: "Validation failed",
        fieldErrors: {
          email: "Email is invalid",
          passwordConfirm: "Passwords do not match",
        },
      };

      // Map backend 'passwordConfirm' to form's 'confirmPassword'
      const fieldMapping = {
        passwordConfirm: "confirmPassword",
      };

      const result = setFormErrors(error, mockSetError, fieldMapping);

      // Verify setError was called twice (once for each field)
      expect(mockSetError).toHaveBeenCalledTimes(2);

      // Verify email uses original field name (no mapping)
      expect(mockSetError).toHaveBeenCalledWith("email", {
        type: "server",
        message: "Email is invalid",
      });

      // Verify passwordConfirm is mapped to confirmPassword
      expect(mockSetError).toHaveBeenCalledWith("confirmPassword", {
        type: "server",
        message: "Passwords do not match",
      });

      // Verify no general error message is returned
      expect(result).toBeNull();
    });

    it("gracefully handles fields that don't exist in the form", () => {
      const error: AppError = {
        type: ErrorType.VALIDATION_ERROR,
        message: "Validation failed",
        fieldErrors: {
          nonExistentField: "This field doesn't exist in the form",
        },
      };

      // Make setError throw for 'nonExistentField'
      mockSetError.mockImplementationOnce(() => {
        throw new Error("Field not found");
      });

      const result = setFormErrors(error, mockSetError);

      // Verify setError was called
      expect(mockSetError).toHaveBeenCalledTimes(1);

      // Verify console.warn was called
      expect(console.warn).toHaveBeenCalled();

      // Verify no general error message is returned
      expect(result).toBeNull();
    });

    it("returns general error message when no field errors exist", () => {
      const error: AppError = {
        type: ErrorType.AUTH_UNAUTHORIZED,
        message: "You are not authorized to perform this action",
      };

      const result = setFormErrors(error, mockSetError);

      // Verify setError was not called
      expect(mockSetError).not.toHaveBeenCalled();

      // Verify the general error message is returned
      expect(result).toBe("You are not authorized to perform this action");
    });

    it("returns general error message when fieldErrors is empty", () => {
      const error: AppError = {
        type: ErrorType.VALIDATION_ERROR,
        message: "Validation failed",
        fieldErrors: {},
      };

      const result = setFormErrors(error, mockSetError);

      // Verify setError was not called
      expect(mockSetError).not.toHaveBeenCalled();

      // Verify the general error message is returned
      expect(result).toBe("Validation failed");
    });

    it("logs the error for debugging purposes", () => {
      const error: AppError = {
        type: ErrorType.VALIDATION_ERROR,
        message: "Validation failed",
        fieldErrors: {
          email: "Email is invalid",
        },
      };

      setFormErrors(error, mockSetError);

      // Verify console.log was called with the error
      expect(console.log).toHaveBeenCalledWith("Setting form errors:", error);
    });
  });
});
