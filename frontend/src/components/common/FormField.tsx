import { ReactNode } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  register: UseFormRegisterReturn;
  renderRight?: ReactNode;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Reusable form field component with consistent styling and error handling
 */
const FormField = ({
  id,
  label,
  error,
  type = "text",
  autoComplete,
  register,
  renderRight,
  className = "",
  placeholder,
  defaultValue,
}: FormFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {renderRight}
      </div>
      <div className="mt-1">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          value={defaultValue}
          {...register}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert" id={errorId}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormField;
