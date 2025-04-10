// src/components/canvas/properties/common/PropertyNumberInput.tsx
import React from "react";

interface PropertyNumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  path: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * A reusable numeric input component with validation and formatting
 */
const PropertyNumberInput: React.FC<PropertyNumberInputProps> = ({
  label,
  value,
  onChange,
  path,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
  description,
  disabled = false,
  placeholder,
  className = "",
}) => {
  // Handle numeric input changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = parseFloat(inputValue);

    // Only update if it's a valid number and within range
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  // Create a unique ID for the input
  const inputId = `number-input-${path.replace(/\./g, "-")}`;

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

      <div className="flex items-center">
        <input
          id={inputId}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          data-path={path} /* Useful for tracking which property is changing */
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />

        {unit && <span className="ml-2 text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
};

export default PropertyNumberInput;
