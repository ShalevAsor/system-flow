// src/components/canvas/properties/common/PropertyToggle.tsx
import React from "react";

interface PropertyToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  path: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
}

/**
 * A reusable toggle/checkbox component for property panels
 */
const PropertyToggle: React.FC<PropertyToggleProps> = ({
  label,
  checked,
  onChange,
  path,
  description,
  disabled = false,
  className = "",
  inline = true, // Default to inline layout (label next to toggle)
}) => {
  // Create a unique ID for the input
  const inputId = `toggle-${path.replace(/\./g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={`mb-3 ${className}`}>
      {inline ? (
        // Inline layout (label next to toggle)
        <div className="flex items-center">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            data-path={path}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor={inputId}
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        </div>
      ) : (
        // Stacked layout (label above toggle)
        <>
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
          >
            {label}
          </label>
          <div className="flex items-center">
            <input
              id={inputId}
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              data-path={path}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-1 text-sm text-gray-500">
              {checked ? "Enabled" : "Disabled"}
            </span>
          </div>
        </>
      )}

      {description && (
        <p className={`text-xs text-gray-500 ${inline ? "ml-6" : "mt-1"}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PropertyToggle;
