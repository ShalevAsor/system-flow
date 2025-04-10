import React from "react";

interface StatsLabelProps {
  label: string;
  value: number | string;
  unit?: string;
  color?: "default" | "success" | "warning" | "error" | "info";
  icon?: React.ReactNode;
  className?: string;
}

export const StatsLabel: React.FC<StatsLabelProps> = ({
  label,
  value,
  unit,
  color = "default",
  icon,
  className = "",
}) => {
  // Color variants
  const colorClasses = {
    default: "bg-gray-100 border-gray-300",
    success: "bg-green-100 border-green-300",
    warning: "bg-yellow-100 border-yellow-300",
    error: "bg-red-100 border-red-300",
    info: "bg-blue-100 border-blue-300",
  };

  return (
    <div
      className={`flex flex-col min-w-24 rounded-lg border p-3 shadow-sm items-center ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium text-gray-600 truncate"
          title={label}
        >
          {label}
        </span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>

      <div className="flex items-baseline">
        <span className="text-xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="ml-1 text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
};
