import React, { useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapsiblePanelProps {
  children: ReactNode;
  title?: string;
  defaultExpanded?: boolean;
  direction?: "left" | "right";
  width?: string;
  collapsedTooltip?: string;
  expandedTooltip?: string;
  className?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  title,
  defaultExpanded = true,
  direction = "left",
  width = "w-64",
  collapsedTooltip = "Expand panel",
  expandedTooltip = "Collapse panel",
  className = "",
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Determine which classes to use based on direction and expanded state
  const getContainerClasses = () => {
    const baseClasses = `${className} bg-white shadow-md transition-all duration-300 ease-in-out flex flex-col`;
    return `${baseClasses} h-full ${expanded ? width : "w-10"}`;
  };

  // Get the appropriate icon based on direction and state
  const getToggleIcon = () => {
    if (expanded) {
      return direction === "left" ? (
        <ChevronLeft size={18} />
      ) : (
        <ChevronRight size={18} />
      );
    } else {
      return direction === "left" ? (
        <ChevronRight size={18} />
      ) : (
        <ChevronLeft size={18} />
      );
    }
  };

  // Get tooltip text based on expanded state
  const getTooltipText = () => {
    return expanded ? expandedTooltip : collapsedTooltip;
  };

  return (
    <div className={getContainerClasses()} style={{ position: "relative" }}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        {expanded && title && (
          <span className="font-medium truncate">{title}</span>
        )}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1 rounded hover:bg-gray-100 focus:outline-none"
          aria-label={expanded ? "Collapse" : "Expand"}
          title={getTooltipText()}
        >
          {getToggleIcon()}
        </button>
      </div>

      {/* Content area - only render when expanded */}
      {expanded && <div className="flex-1 overflow-y-auto p-2">{children}</div>}
    </div>
  );
};

export default CollapsiblePanel;
