import React from "react";

interface UtilizationIndicatorProps {
  label: string;
  value: number;
  labelWidth?: string; // Add customizable label width
}

const getUtilizationColor = (utilization: number) => {
  if (utilization >= 90) return "bg-red-500";
  if (utilization >= 70) return "bg-orange-400";
  if (utilization >= 50) return "bg-yellow-300";
  return "bg-green-400";
};

export const UtilizationIndicator: React.FC<UtilizationIndicatorProps> = ({
  label,
  value,
  labelWidth = "w-1/3", // Default width, but can be overridden
}) => {
  const utilizationPercentage = Math.round(value * 100);

  return (
    <div className="flex items-center">
      <div className={`${labelWidth} text-xs truncate pr-2`} title={label}>
        {label}
      </div>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getUtilizationColor(
            utilizationPercentage
          )}`}
          style={{ width: `${utilizationPercentage}%` }}
        ></div>
      </div>
      <div className="ml-2 w-4 text-right text-sm text-zinc-400">
        {utilizationPercentage}%
      </div>
    </div>
  );
};
