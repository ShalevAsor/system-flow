import React from "react";
import {
  CacheNodeData,
  ClientNodeData,
  DatabaseNodeData,
  LoadBalancerNodeData,
  NodeType,
  ServerNodeData,
  SystemDesignNode,
} from "../../../types/flow/nodeTypes";
import BasicNodeProperties from "../properties/node/BasicNodeProperties";
import ServerNodeProperties from "../properties/node/ServerNodeProperties";
import DatabaseNodeProperties from "../properties/node/DatabaseNodeProperties";
import LoadBalancerNodeProperties from "../properties/node/LoadBalancerNodeProperties";
import ClientNodeProperties from "../properties/node/ClientNodeProperties";
import CacheNodeProperties from "../properties/node/CacheNodeProperties";
import { useFlowStore } from "../../../store/flowStore";

interface NodePropertiesPanelProps {
  selectedNode: SystemDesignNode;
  onPropertyChange: (
    nodeId: string,
    path: string,
    value: string | number | boolean | string[]
  ) => void;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  onPropertyChange,
}) => {
  const { removeNode } = useFlowStore();
  // Handler for property changes
  const handleChange = (
    path: string,
    value: string | number | boolean | string[]
  ) => {
    onPropertyChange(selectedNode.id, path, value);
  };

  // Determine which type-specific properties to render
  const renderTypeSpecificProperties = () => {
    const nodeType = selectedNode.type as NodeType;

    switch (nodeType) {
      case NodeType.Server:
        return (
          <ServerNodeProperties
            data={selectedNode.data as ServerNodeData}
            onChange={handleChange}
          />
        );

      case NodeType.Database:
        return (
          <DatabaseNodeProperties
            data={selectedNode.data as DatabaseNodeData}
            onChange={handleChange}
          />
        );

      case NodeType.LoadBalancer:
        return (
          <LoadBalancerNodeProperties
            data={selectedNode.data as LoadBalancerNodeData}
            onChange={handleChange}
          />
        );

      case NodeType.Client:
        return (
          <ClientNodeProperties
            data={selectedNode.data as ClientNodeData}
            onChange={handleChange}
          />
        );

      case NodeType.Cache:
        return (
          <CacheNodeProperties
            data={selectedNode.data as CacheNodeData}
            onChange={handleChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-3">
      <h3 className="font-medium text-lg mb-3">Properties</h3>

      {/* Common properties for all node types */}
      <BasicNodeProperties
        data={selectedNode.data}
        type={selectedNode.type as NodeType}
        onChange={handleChange}
        onRemove={() => removeNode(selectedNode.id)}
      />

      {/* Type-specific properties */}
      {renderTypeSpecificProperties()}
    </div>
  );
};

export default NodePropertiesPanel;
