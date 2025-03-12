// frontend/src/utils/formUtils.ts
import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { AppError } from "../types/errors";

/**
 * Helper function to set form errors from AppError objects
 *
 * @param error - The structured application error
 * @param setError - The setError function from useForm
 * @param fieldMapping - Optional mapping between backend field names and form field names
 * @returns The general error message, if any
 */
export function setFormErrors<T extends FieldValues>(
  error: AppError,
  setError: UseFormSetError<T>,
  fieldMapping: Record<string, Path<T>> = {}
): string | null {
  console.log("Setting form errors:", error);

  // Only set field errors for validation errors
  if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
    Object.entries(error.fieldErrors).forEach(([key, message]) => {
      // Check if we need to map this field name
      const formFieldName = fieldMapping[key] || (key as Path<T>);

      // Set error on the field
      try {
        setError(formFieldName, {
          type: "server",
          message: message,
        });
      } catch (e) {
        // If the field doesn't exist in the form, we'll just skip it
        console.warn(`Field ${key} not found in form: ${e}`);
      }
    });

    // If there are field errors, don't return a general message
    return null;
  }

  // Return general error message for non-field errors
  return error.message;
}
