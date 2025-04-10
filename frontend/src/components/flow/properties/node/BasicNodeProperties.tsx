// src/components/canvas/properties/BasicNodeProperties.tsx
import React from "react";
import { NodeType, NodeData } from "../../../../types/flow/nodeTypes";
import { getNodeTypeName } from "../../../../utils/flow/nodeUtils";
import PropertySection from "../common/PropertySection";
import Button from "../../../ui/Button";

interface BasicNodePropertiesProps {
  data: NodeData;
  type: NodeType;
  onChange: (path: string, value: string | number | boolean | string[]) => void;
  onRemove: () => void;
}

const BasicNodeProperties: React.FC<BasicNodePropertiesProps> = ({
  data,
  type,
  onChange,
  onRemove,
}) => {
  return (
    <PropertySection
      title="Basic Information"
      defaultOpen
      collapsible
      className="mb-4"
    >
      {/* Label field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={data.label}
          onChange={(e) => onChange("data.label", e.target.value)}
        />
      </div>

      {/* Description field */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={data.description || ""}
          onChange={(e) => onChange("data.description", e.target.value)}
          rows={3}
        />
      </div>

      {/* Node type (read-only) */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Component Type
        </label>
        <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-500">
          {getNodeTypeName(type)}
        </div>
      </div>
      <Button
        label="Remove Node"
        onClick={onRemove}
        variant="warning"
        size="sm"
      />
    </PropertySection>
  );
};

export default BasicNodeProperties;
