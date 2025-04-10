// MetricBadge.tsx
import React from "react";

type BadgeColor = "blue" | "purple" | "red" | "green" | "orange" | "teal";

interface MetricBadgeProps {
  color: BadgeColor; // Color-based class instead of semantic name
  icon: React.ReactNode;
  label?: string;
  value: React.ReactNode;
}

const MetricBadge: React.FC<MetricBadgeProps> = ({
  color,
  icon,
  label = "",
  value,
}) => {
  return (
    <div className={`metric-badge color-${color}`}>
      {icon}
      <span>
        {label}
        {value}
      </span>
    </div>
  );
};

export default MetricBadge;
