// src/components/canvas/properties/GRPCEdgeProperties.tsx
import React, { useEffect } from "react";
import { GRPCEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertyTextInput from "../common/PropertyTextInput";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface GRPCEdgePropertiesProps {
  data: GRPCEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const GRPCEdgeProperties: React.FC<GRPCEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  // Handle auto-updating encryption when mTLS authentication is selected
  useEffect(() => {
    if (data.authentication === "mTLS" && data.encryption !== "mTLS") {
      onChange("data.encryption", "mTLS");
    }
  }, [data.authentication, data.encryption, onChange]);

  return (
    <div className="space-y-6 mt-3">
      {/* Basic gRPC Properties Section */}
      <PropertySection title="gRPC Properties" defaultOpen={true} collapsible>
        {/* Service Method */}
        <PropertyTextInput
          label="Service Method"
          value={data.serviceMethod || ""}
          onChange={(value) => onChange("data.serviceMethod", value)}
          path="data.serviceMethod"
          placeholder="e.g., greeter.SayHello"
          description="Service and method name (service.method)"
        />

        {/* Streaming Type */}
        <PropertySelect
          label="Streaming Type"
          value={data.streaming || "None"}
          options={[
            { value: "None", label: "Unary (Request-Response)" },
            { value: "Client", label: "Client Streaming" },
            { value: "Server", label: "Server Streaming" },
            { value: "Bidirectional", label: "Bidirectional Streaming" },
          ]}
          onChange={(value) => onChange("data.streaming", value)}
          path="data.streaming"
          description="The type of streaming used in this gRPC call"
        />
      </PropertySection>

      {/* Connection Management */}
      <PropertySection
        title="Connection Management"
        defaultOpen={false}
        collapsible
      >
        {/* Channel Pooling */}
        <PropertyToggle
          label="Channel Pooling"
          checked={!!data.channelPooling}
          onChange={(checked) => onChange("data.channelPooling", checked)}
          path="data.channelPooling"
          description="Reuse channels for multiple requests"
        />

        {/* Load Balancing Policy */}
        <PropertySelect
          label="Load Balancing Policy"
          value={data.loadBalancingPolicy || "Round-Robin"}
          options={[
            { value: "Round-Robin", label: "Round Robin" },
            { value: "Pick-First", label: "Pick First" },
            { value: "Custom", label: "Custom" },
          ]}
          onChange={(value) => onChange("data.loadBalancingPolicy", value)}
          path="data.loadBalancingPolicy"
          description="How requests are distributed across servers"
        />

        {/* Keep Alive */}
        <PropertyToggle
          label="Keep Alive"
          checked={!!data.keepAliveEnabled}
          onChange={(checked) => onChange("data.keepAliveEnabled", checked)}
          path="data.keepAliveEnabled"
          description="Send periodic pings to keep connection alive"
        />

        {data.keepAliveEnabled && (
          <PropertyNumberInput
            label="Keep Alive Interval"
            value={data.keepAliveTimeMs || 30000}
            onChange={(value) => onChange("data.keepAliveTimeMs", value)}
            path="data.keepAliveTimeMs"
            min={1000}
            step={1000}
            unit="ms"
            description="Time between keep-alive pings"
            className="pl-6"
          />
        )}
      </PropertySection>

      {/* Performance Settings */}
      <PropertySection
        title="Performance Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Timeout Settings */}
        <PropertyNumberInput
          label="Timeout"
          value={data.timeout || 10000}
          onChange={(value) => onChange("data.timeout", value)}
          path="data.timeout"
          min={100}
          unit="ms"
          description="Request timeout"
        />

        {/* Max Message Size */}
        <PropertyNumberInput
          label="Max Message Size"
          value={data.averageRequestSizeKB || 4096}
          onChange={(value) => onChange("data.averageRequestSizeKB", value)}
          path="data.averageRequestSizeKB"
          min={1}
          unit="KB"
          description="Maximum size of messages"
        />

        {/* Compression */}
        <PropertyToggle
          label="Compression Enabled"
          checked={!!data.compressionEnabled}
          onChange={(checked) => onChange("data.compressionEnabled", checked)}
          path="data.compressionEnabled"
          description="Enable message compression"
        />
      </PropertySection>

      {/* Security Settings */}
      <PropertySection
        title="Security Settings"
        defaultOpen={false}
        collapsible
      >
        {/* TLS */}
        <PropertyToggle
          label="Use TLS"
          checked={data.encryption === "TLS" || data.encryption === "mTLS"}
          onChange={(checked) =>
            onChange("data.encryption", checked ? "TLS" : "None")
          }
          path="data.encryption"
          description="Secure connection with TLS"
        />

        {/* Authentication */}
        <PropertySelect
          label="Authentication Method"
          value={data.authentication || "None"}
          options={[
            { value: "None", label: "None" },
            { value: "Basic", label: "Basic Auth" },
            { value: "Bearer Token", label: "Bearer Token" },
            { value: "mTLS", label: "Mutual TLS" },
            { value: "OAuth", label: "OAuth" },
            { value: "API Key", label: "API Key" },
          ]}
          onChange={(value) => onChange("data.authentication", value)}
          path="data.authentication"
          description="Authentication method for requests"
        />

        {/* Display note if mTLS is selected */}
        {data.authentication === "mTLS" && data.encryption === "mTLS" && (
          <div className="text-xs text-blue-600 mb-2 pl-2">
            * Mutual TLS authentication enabled. Encryption set to mTLS.
          </div>
        )}
      </PropertySection>
    </div>
  );
};

export default GRPCEdgeProperties;
