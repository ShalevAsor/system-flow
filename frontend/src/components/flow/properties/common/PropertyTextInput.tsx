// src/components/canvas/properties/common/PropertyTextInput.tsx
import React from "react";

interface PropertyTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  path: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  unit?: string;
}

/**
 * A reusable text input component for property panels
 */
const PropertyTextInput: React.FC<PropertyTextInputProps> = ({
  label,
  value,
  onChange,
  path,
  placeholder = "",
  description,
  disabled = false,
  className = "",
  unit,
}) => {
  // Create a unique ID for the input
  const inputId = `input-${path.replace(/\./g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`mb-3 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
      >
        {label}
      </label>

      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          data-path={path}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTextInput;
