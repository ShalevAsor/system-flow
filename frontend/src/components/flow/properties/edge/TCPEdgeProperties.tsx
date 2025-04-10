// src/components/canvas/properties/TCPEdgeProperties.tsx
import React from "react";
import { TCPEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertyToggle from "../common/PropertyToggle";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface TCPEdgePropertiesProps {
  data: TCPEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const TCPEdgeProperties: React.FC<TCPEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic TCP Properties Section */}
      <PropertySection title="TCP Properties" defaultOpen={true} collapsible>
        {/* TCP Port */}
        <PropertyNumberInput
          label="Port"
          value={data.port || 0}
          onChange={(value) => onChange("data.port", value)}
          path="data.port"
          min={0}
          max={65535}
          description="TCP port number (0-65535)"
        />

        {/* Socket Buffer Size */}
        <PropertyNumberInput
          label="Socket Buffer Size"
          value={data.socketBufferSizeKB || 8}
          onChange={(value) => onChange("data.socketBufferSizeKB", value)}
          path="data.socketBufferSizeKB"
          min={1}
          unit="KB"
          description="Size of the TCP socket buffer"
        />

        {/* Nagle's Algorithm */}
        <PropertyToggle
          label="Nagle's Algorithm"
          checked={!!data.nagleAlgorithmEnabled}
          onChange={(checked) =>
            onChange("data.nagleAlgorithmEnabled", checked)
          }
          path="data.nagleAlgorithmEnabled"
          description="Combine small packets before sending (reduces overhead but may increase latency)"
        />
      </PropertySection>

      {/* Connection Management */}
      <PropertySection
        title="Connection Management"
        defaultOpen={false}
        collapsible
      >
        {/* Keep Alive */}
        <PropertyToggle
          label="Keep Alive"
          checked={!!data.keepAliveEnabled}
          onChange={(checked) => onChange("data.keepAliveEnabled", checked)}
          path="data.keepAliveEnabled"
          description="Send periodic probes to detect connection failure"
        />

        {/* Connection Pooling */}
        <PropertyToggle
          label="Connection Pooling"
          checked={!!data.connectionPoolEnabled}
          onChange={(checked) =>
            onChange("data.connectionPoolEnabled", checked)
          }
          path="data.connectionPoolEnabled"
          description="Reuse TCP connections"
        />

        {data.connectionPoolEnabled && (
          <PropertyNumberInput
            label="Max Concurrent Connections"
            value={data.maxConcurrentConnections || 10}
            onChange={(value) =>
              onChange("data.maxConcurrentConnections", value)
            }
            path="data.maxConcurrentConnections"
            min={1}
            className="pl-6"
            description="Maximum number of connections in the pool"
          />
        )}
      </PropertySection>

      {/* Performance Settings */}
      <PropertySection
        title="Performance Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Latency */}
        <PropertyNumberInput
          label="Latency"
          value={data.latencyMs || 5}
          onChange={(value) => onChange("data.latencyMs", value)}
          path="data.latencyMs"
          min={0}
          unit="ms"
          description="Expected network latency"
        />

        {/* Bandwidth */}
        <PropertyNumberInput
          label="Bandwidth"
          value={data.bandwidthMbps || 100}
          onChange={(value) => onChange("data.bandwidthMbps", value)}
          path="data.bandwidthMbps"
          min={0.1}
          step={0.1}
          unit="Mbps"
          description="Available bandwidth"
        />

        {/* Max Throughput */}
        <PropertyNumberInput
          label="Max Throughput"
          value={data.maxThroughputRPS || 10000}
          onChange={(value) => onChange("data.maxThroughputRPS", value)}
          path="data.maxThroughputRPS"
          min={1}
          unit="req/sec"
          description="Maximum operations per second"
        />
      </PropertySection>

      {/* Reliability Settings */}
      <PropertySection
        title="Reliability Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Reliability Level */}
        <PropertyToggle
          label="Reliable Delivery"
          checked={
            data.reliability === "At-Least-Once" ||
            data.reliability === "Exactly-Once"
          }
          onChange={(checked) =>
            onChange(
              "data.reliability",
              checked ? "At-Least-Once" : "Best-Effort"
            )
          }
          path="data.reliability"
          description="Ensure packet delivery with retransmission"
        />

        {/* Packet Loss Rate */}
        <PropertyNumberInput
          label="Packet Loss Rate"
          value={data.packetLossRate || 0.001}
          onChange={(value) => onChange("data.packetLossRate", value)}
          path="data.packetLossRate"
          min={0}
          max={1}
          step={0.001}
          unit="%"
          description="Percentage of packets lost in transit"
        />

        {/* Retry Settings */}
        <PropertyToggle
          label="Automatic Retries"
          checked={!!data.retryEnabled}
          onChange={(checked) => onChange("data.retryEnabled", checked)}
          path="data.retryEnabled"
          description="Retry failed operations"
        />

        {data.retryEnabled && (
          <PropertyNumberInput
            label="Max Retries"
            value={data.maxRetries || 3}
            onChange={(value) => onChange("data.maxRetries", value)}
            path="data.maxRetries"
            min={1}
            className="pl-6"
          />
        )}

        {/* Timeout */}
        <PropertyNumberInput
          label="Timeout"
          value={data.timeout || 30000}
          onChange={(value) => onChange("data.timeout", value)}
          path="data.timeout"
          min={100}
          unit="ms"
          description="Connection timeout"
        />
      </PropertySection>

      {/* Security Settings */}
      <PropertySection
        title="Security Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Encryption */}
        <PropertyToggle
          label="Use TLS/SSL"
          checked={data.encryption === "TLS"}
          onChange={(checked) =>
            onChange("data.encryption", checked ? "TLS" : "None")
          }
          path="data.encryption"
          description="Encrypt the TCP connection"
        />
      </PropertySection>
    </div>
  );
};

export default TCPEdgeProperties;
