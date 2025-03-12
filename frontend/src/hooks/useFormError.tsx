// frontend/src/hooks/useFormError.ts
import { useState } from "react";
import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { AppError, ErrorType } from "../types/errors";
import { setFormErrors } from "../utils/formUtils";

/**
 * Custom hook to manage form errors with integration for react-hook-form
 *
 * @returns An object with form error state and helper functions
 */
export function useFormError<T extends FieldValues>() {
  const [formError, setFormError] = useState<string | null>(null);

  // Clear form error
  const clearFormError = () => setFormError(null);

  /**
   * Handle AppError and update form fields or general error state
   *
   * @param error - The structured application error
   * @param setError - react-hook-form's setError function
   * @param fieldMapping - Optional mapping from backend field names to form field names
   * @returns The error type that was handled
   */
  const handleFormError = (
    error: AppError,
    setError: UseFormSetError<T>,
    fieldMapping: Record<string, Path<T>> = {}
  ): ErrorType => {
    console.log("Handling form error:", error);
    // Special cases handling can be done here
    if (error.type === ErrorType.AUTH_EMAIL_UNVERIFIED) {
      console.log("handleFormError - AUTH_EMAIL_UNVERIFIED", error.type);
      // This might be handled differently by the component
      setFormError(error.message);
      return error.type;
    }

    if (
      error.type === ErrorType.AUTH_INVALID_CREDENTIALS ||
      error.type === ErrorType.AUTH_UNAUTHORIZED ||
      error.type === ErrorType.AUTH_EMAIL_ALREADY_IN_USE
    ) {
      setFormError(error.message);
    }

    // For validation errors, map them to form fields
    const generalError = setFormErrors(error, setError, fieldMapping);

    // If there's a general message, set it
    if (generalError) {
      setFormError(generalError);
    }

    return error.type;
  };

  return {
    formError,
    setFormError,
    clearFormError,
    handleFormError,
  };
}
