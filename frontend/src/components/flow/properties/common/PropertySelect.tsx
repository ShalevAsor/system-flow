// src/components/canvas/properties/common/PropertySelect.tsx
import React from "react";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface PropertySelectProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  path: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A reusable select/dropdown component for property panels
 */
const PropertySelect = <T extends string>({
  label,
  value,
  options,
  onChange,
  path,
  description,
  disabled = false,
  className = "",
}: PropertySelectProps<T>) => {
  // Create a unique ID for the select
  const selectId = `select-${path.replace(/\./g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };

  return (
    <div className={`mb-3 ${className}`}>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
      >
        {label}
      </label>

      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        data-path={path}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PropertySelect;
