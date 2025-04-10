// src/components/canvas/properties/common/PropertySlider.tsx
import React from "react";

interface PropertySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  path: string;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A reusable slider component with value display for property panels
 */
const PropertySlider: React.FC<PropertySliderProps> = ({
  label,
  value,
  onChange,
  path,
  min,
  max,
  step = 0.1,
  formatValue = (val) => val.toString(),
  description,
  disabled = false,
  className = "",
}) => {
  // Create a unique ID for the input
  const sliderId = `slider-${path.replace(/\./g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`mb-3 ${className}`}>
      <div className="flex justify-between mb-1">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </label>
        <span className="text-sm text-gray-500">{formatValue(value)}</span>
      </div>

      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        data-path={path}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default PropertySlider;
