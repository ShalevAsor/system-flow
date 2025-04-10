// src/components/canvas/properties/common/PropertyTagInput.tsx
import React, { useState } from "react";

interface PropertyTagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  path: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
}

/**
 * A reusable component for managing arrays of string values (tags)
 * with add/remove functionality
 */
const PropertyTagInput: React.FC<PropertyTagInputProps> = ({
  label,
  values,
  onChange,
  path,
  placeholder = "Add new item...",
  description,
  disabled = false,
  options,
  className = "",
}) => {
  // State for the current input value
  const [inputValue, setInputValue] = useState("");

  // Create a unique ID for the input
  const inputId = `tag-input-${path.replace(/\./g, "-")}`;

  // Handle adding a new value
  const handleAddValue = () => {
    if (inputValue && !values.includes(inputValue)) {
      const updatedValues = [...values, inputValue];
      onChange(updatedValues);
      setInputValue(""); // Reset input after adding
    }
  };

  // Handle removing a value
  const handleRemoveValue = (valueToRemove: string) => {
    const updatedValues = values.filter((value) => value !== valueToRemove);
    onChange(updatedValues);
  };

  // Handle key press for Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAddValue();
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      <div className="flex space-x-2 mb-2">
        {options ? (
          // Dropdown input when options are provided
          <select
            id={inputId}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          // Text input when no options are provided
          <input
            id={inputId}
            type="text"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
          />
        )}

        <button
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleAddValue}
          disabled={disabled || !inputValue}
        >
          Add
        </button>
      </div>

      {/* Display existing values as tags */}
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <div
            key={value}
            className="bg-gray-100 px-2 py-1 rounded-md flex items-center"
          >
            <span className="text-sm">
              {options
                ? options.find((option) => option.value === value)?.label ||
                  value
                : value}
            </span>
            <button
              className="ml-1 text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveValue(value)}
              disabled={disabled}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyTagInput;
