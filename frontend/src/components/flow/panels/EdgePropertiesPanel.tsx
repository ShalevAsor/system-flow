// src/components/canvas/EdgePropertiesPanel.tsx
import React from "react";
import {
  EdgeType,
  SystemDesignEdge,
  HTTPEdgeData,
  BaseEdgeData,
  WebSocketEdgeData,
  GRPCEdgeData,
  DatabaseEdgeData,
  TCPEdgeData,
  UDPEdgeData,
  MessageQueueEdgeData,
  EventStreamEdgeData,
} from "../../../types/flow/edgeTypes";
import { EdgePropertyValue } from "../../../utils/flow/edgeUtils";
import HTTPEdgeProperties from "../properties/edge/HTTPEdgeProperties";
import BasicEdgeProperties from "../properties/edge/BasicEdgeProperties";
import EdgeTypeSelector from "../properties/common/EdgeTypeSelector";
import WebSocketEdgeProperties from "../properties/edge/WebSocketEdgeProperties";
import GRPCEdgeProperties from "../properties/edge/GRPCEdgeProperties";
import DatabaseEdgeProperties from "../properties/edge/DatabaseEdgeProperties";
import Button from "../../ui/Button";
import { useFlowStore } from "../../../store/flowStore";
import TCPEdgeProperties from "../properties/edge/TCPEdgeProperties";
import UDPEdgeProperties from "../properties/edge/UDPEdgeProperties";
import MessageQueueEdgeProperties from "../properties/edge/MessageQueueEdgeProperties";
import EventStreamEdgeProperties from "../properties/edge/EventStreamEdgeProperties";

interface EdgePropertiesPanelProps {
  selectedEdge: SystemDesignEdge;
  onPropertyChange: (
    edgeId: string,
    path: string,
    value: EdgePropertyValue
  ) => void;
}

const EdgePropertiesPanel: React.FC<EdgePropertiesPanelProps> = ({
  selectedEdge,
  onPropertyChange,
}) => {
  const { removeEdge } = useFlowStore();

  // Handler for property changes
  const handleChange = (path: string, value: EdgePropertyValue) => {
    onPropertyChange(selectedEdge.id, path, value);
  };

  // Determine which type-specific properties to render
  const renderTypeSpecificProperties = () => {
    const edgeType = selectedEdge.type as EdgeType;

    switch (edgeType) {
      case EdgeType.HTTP:
        return (
          <HTTPEdgeProperties
            data={selectedEdge.data as HTTPEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.WebSocket:
        return (
          <WebSocketEdgeProperties
            data={selectedEdge.data as WebSocketEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.gRPC:
        return (
          <GRPCEdgeProperties
            data={selectedEdge.data as GRPCEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.Database:
        return (
          <DatabaseEdgeProperties
            data={selectedEdge.data as DatabaseEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.TCP:
        return (
          <TCPEdgeProperties
            data={selectedEdge.data as TCPEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.UDP:
        return (
          <UDPEdgeProperties
            data={selectedEdge.data as UDPEdgeData}
            onChange={handleChange}
          />
        );
      case EdgeType.Kafka:
        return (
          <MessageQueueEdgeProperties
            data={selectedEdge.data as MessageQueueEdgeData}
            onChange={handleChange}
            edgeType={EdgeType.Kafka}
          />
        );
      case EdgeType.MQTT:
        return (
          <MessageQueueEdgeProperties
            data={selectedEdge.data as MessageQueueEdgeData}
            onChange={handleChange}
            edgeType={EdgeType.MQTT}
          />
        );
      case EdgeType.AMQP:
        return (
          <MessageQueueEdgeProperties
            data={selectedEdge.data as MessageQueueEdgeData}
            onChange={handleChange}
            edgeType={EdgeType.AMQP}
          />
        );
      case EdgeType.EventStream:
        return (
          <EventStreamEdgeProperties
            data={selectedEdge.data as EventStreamEdgeData}
            onChange={handleChange}
          />
        );
      default:
        return (
          <div className="p-4 text-sm text-gray-500">
            No specific properties for this edge type yet
          </div>
        );
    }
  };

  return (
    <div className="p-3 overflow-y-auto">
      <h3 className="font-medium text-lg mb-3">Edge Properties</h3>
      {/* Common operations */}
      <div className="flex flex-col gap-y-3 mb-3">
        {/* Edge Type Selector */}
        <EdgeTypeSelector
          edgeId={selectedEdge.id}
          currentType={selectedEdge.type as EdgeType}
        />
        {/* Remove edge */}
        <Button
          label="Remove Edge"
          onClick={() => removeEdge(selectedEdge.id)}
          variant="warning"
          size="sm"
        />
      </div>
      {/* Common properties for all edges */}
      <BasicEdgeProperties
        data={selectedEdge.data as BaseEdgeData}
        type={selectedEdge.type as EdgeType}
        onChange={handleChange}
      />

      {/* Type-specific properties */}
      {renderTypeSpecificProperties()}
    </div>
  );
};

export default EdgePropertiesPanel;
