// src/components/canvas/properties/WebSocketEdgeProperties.tsx
import React from "react";
import { WebSocketEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface WebSocketEdgePropertiesProps {
  data: WebSocketEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const WebSocketEdgeProperties: React.FC<WebSocketEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* WebSocket Connection Properties */}
      <PropertySection
        title="WebSocket Properties"
        defaultOpen={true}
        collapsible
      >
        {/* Persistent Connection */}
        <PropertyToggle
          label="Persistent Connection"
          checked={!!data.persistent}
          onChange={(checked) => onChange("data.persistent", checked)}
          path="data.persistent"
          description="Maintain long-lived connection"
        />

        {/* Subprotocol */}
        <PropertySelect
          label="Subprotocol"
          value={data.subprotocol || ""}
          options={[
            { value: "", label: "None" },
            { value: "json", label: "JSON" },
            { value: "mqtt", label: "MQTT over WebSocket" },
            { value: "graphql-ws", label: "GraphQL WebSocket" },
            { value: "stomp", label: "STOMP" },
            { value: "wamp", label: "WAMP" },
            { value: "custom", label: "Custom" },
          ]}
          onChange={(value) => onChange("data.subprotocol", value)}
          path="data.subprotocol"
          description="WebSocket subprotocol to use"
        />

        {/* Auto-reconnect */}
        <PropertyToggle
          label="Auto Reconnect"
          checked={!!data.autoReconnect}
          onChange={(checked) => onChange("data.autoReconnect", checked)}
          path="data.autoReconnect"
          description="Automatically reconnect if connection is lost"
        />
      </PropertySection>

      {/* Message Properties */}
      <PropertySection
        title="Message Properties"
        defaultOpen={false}
        collapsible
      >
        {/* Message Rate */}
        <PropertyNumberInput
          label="Message Rate"
          value={data.messageRatePerSecond || 10}
          onChange={(value) => onChange("data.messageRatePerSecond", value)}
          path="data.messageRatePerSecond"
          min={0.1}
          step={0.1}
          unit="msgs/sec"
          description="Average messages per second"
        />

        {/* Message Size */}
        <PropertyNumberInput
          label="Average Message Size"
          value={data.averageMessageSizeKB || 1}
          onChange={(value) => onChange("data.averageMessageSizeKB", value)}
          path="data.averageMessageSizeKB"
          min={0.1}
          step={0.1}
          unit="KB"
          description="Average size of each message"
        />
      </PropertySection>

      {/* Connection Maintenance */}
      <PropertySection
        title="Connection Maintenance"
        defaultOpen={false}
        collapsible
      >
        {/* Heartbeat */}
        <PropertyToggle
          label="Enable Heartbeat"
          checked={!!data.heartbeatEnabled}
          onChange={(checked) => onChange("data.heartbeatEnabled", checked)}
          path="data.heartbeatEnabled"
          description="Send periodic ping messages to keep connection alive"
        />

        {data.heartbeatEnabled && (
          <PropertyNumberInput
            label="Heartbeat Interval"
            value={data.heartbeatIntervalMs || 30000}
            onChange={(value) => onChange("data.heartbeatIntervalMs", value)}
            path="data.heartbeatIntervalMs"
            min={1000}
            step={1000}
            unit="ms"
            description="Time between heartbeat messages"
            className="pl-6"
          />
        )}
      </PropertySection>
    </div>
  );
};

export default WebSocketEdgeProperties;
