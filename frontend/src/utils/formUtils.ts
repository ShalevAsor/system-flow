// src/utils/formUtils.ts
import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { isApiError } from "./apiUtils";

/**
 * Helper function to set form errors from API response
 * @param error - The error received from the API
 * @param setError - The setError function from useForm
 * @param fieldMapping - Optional mapping between backend field names and form field names
 */
export function setFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMapping: Record<string, Path<T>> = {}
): void {
  if (isApiError(error) && error.response?.data.errors) {
    const backendErrors = error.response.data.errors;

    Object.entries(backendErrors).forEach(([key, message]) => {
      // Check if we need to map this field name
      const formFieldName = fieldMapping[key] || (key as Path<T>);

      // Check if this is a valid field in our form
      try {
        setError(formFieldName, {
          type: "server",
          message: message as string,
        });
      } catch (e) {
        // If the field doesn't exist in the form, we'll just skip it
        console.warn(`Field ${key} not found in form: ${e}`);
      }
    });
  }
}
