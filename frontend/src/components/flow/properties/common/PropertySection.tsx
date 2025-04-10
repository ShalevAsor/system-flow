// src/components/canvas/properties/common/PropertySection.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PropertySectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  noBorder?: boolean;
  className?: string;
}

/**
 * A reusable section component for grouping related properties
 * with consistent styling and optional collapsible behavior
 */
const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  children,
  defaultOpen = true,
  collapsible = false,
  noBorder = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Border class will be added unless noBorder is true
  const borderClass = noBorder ? "" : "border-b border-gray-200";

  return (
    <div className={`pb-3 ${borderClass} ${className}`}>
      {/* Section Header */}
      {collapsible ? (
        // Collapsible header (with toggle arrow)
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
            {title}
          </h4>
          <span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </div>
      ) : (
        // Regular, non-collapsible header
        <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-3">
          {title}
        </h4>
      )}

      {/* Section Content - only render if section is open */}
      {(!collapsible || isOpen) && <div className="space-y-3">{children}</div>}
    </div>
  );
};

export default PropertySection;
