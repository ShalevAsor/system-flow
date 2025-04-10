// src/components/canvas/properties/BasicEdgeProperties.tsx
import React from "react";
import { EdgeType, BaseEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface BasicEdgePropertiesProps {
  data: BaseEdgeData;
  type: EdgeType;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const BasicEdgeProperties: React.FC<BasicEdgePropertiesProps> = ({
  data,
  type,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* General Information */}
      <PropertySection
        title="General Information"
        defaultOpen={true}
        collapsible
      >
        {/* Edge Type */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edge Type
          </label>
          <div className="text-sm bg-gray-100 p-2 rounded">{type}</div>
        </div>

        {/* Label */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={data.label || ""}
            onChange={(e) => onChange("data.label", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => onChange("data.description", e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
      </PropertySection>

      {/* Communication Characteristics */}
      <PropertySection
        title="Communication Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Communication Pattern */}
        <PropertySelect
          label="Communication Pattern"
          value={data.communicationPattern || "Sync"}
          options={[
            { value: "Sync", label: "Synchronous (Request-Response)" },
            { value: "Async", label: "Asynchronous" },
            { value: "Pub-Sub", label: "Publish-Subscribe" },
            { value: "Request-Reply", label: "Request-Reply" },
            { value: "Stream", label: "Stream" },
          ]}
          onChange={(value) => onChange("data.communicationPattern", value)}
          path="data.communicationPattern"
        />

        {/* Bidirectional */}
        <PropertyToggle
          label="Bidirectional"
          checked={!!data.bidirectional}
          onChange={(checked) => onChange("data.bidirectional", checked)}
          path="data.bidirectional"
          description="Communication flows in both directions"
        />

        {/* Protocol */}
        <PropertySelect
          label="Protocol"
          value={data.protocol || "HTTP"}
          options={[
            { value: "HTTP", label: "HTTP" },
            { value: "HTTPS", label: "HTTPS" },
            { value: "WebSocket", label: "WebSocket" },
            { value: "gRPC", label: "gRPC" },
            { value: "TCP", label: "TCP" },
            { value: "UDP", label: "UDP" },
          ]}
          onChange={(value) => onChange("data.protocol", value)}
          path="data.protocol"
        />
      </PropertySection>

      {/* Performance Characteristics */}
      <PropertySection
        title="Performance Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Latency */}
        <PropertyNumberInput
          label="Latency"
          value={data.latencyMs || 100}
          onChange={(value) => onChange("data.latencyMs", value)}
          path="data.latencyMs"
          min={0}
          unit="ms"
          description="Expected communication latency"
        />

        {/* Latency Level */}
        <PropertySelect
          label="Latency Level"
          value={data.latencyLevel || "Low"}
          options={[
            { value: "Low", label: "Low (<100ms)" },
            { value: "Medium", label: "Medium (100-300ms)" },
            { value: "High", label: "High (>300ms)" },
            { value: "Variable", label: "Variable (inconsistent)" },
          ]}
          onChange={(value) => onChange("data.latencyLevel", value)}
          path="data.latencyLevel"
        />

        {/* Bandwidth */}
        <PropertyNumberInput
          label="Bandwidth"
          value={data.bandwidthMbps || 10}
          onChange={(value) => onChange("data.bandwidthMbps", value)}
          path="data.bandwidthMbps"
          min={0.1}
          step={0.1}
          unit="Mbps"
          description="Available bandwidth for this connection"
        />

        {/* Bandwidth Requirement */}
        <PropertySelect
          label="Bandwidth Requirement"
          value={data.bandwidthRequirement || "Medium"}
          options={[
            { value: "Low", label: "Low (<5 Mbps)" },
            { value: "Medium", label: "Medium (5-50 Mbps)" },
            { value: "High", label: "High (50-200 Mbps)" },
            { value: "Very High", label: "Very High (>200 Mbps)" },
          ]}
          onChange={(value) => onChange("data.bandwidthRequirement", value)}
          path="data.bandwidthRequirement"
        />

        {/* Throughput */}
        <PropertyNumberInput
          label="Max Throughput"
          value={data.maxThroughputRPS || 1000}
          onChange={(value) => onChange("data.maxThroughputRPS", value)}
          path="data.maxThroughputRPS"
          min={1}
          unit="req/sec"
          description="Maximum requests per second"
        />
      </PropertySection>

      {/* Reliability Section */}
      <PropertySection
        title="Reliability & Quality of Service"
        defaultOpen={false}
        collapsible
      >
        {/* Reliability Level */}
        <PropertySelect
          label="Reliability Level"
          value={data.reliability || "Best-Effort"}
          options={[
            { value: "Best-Effort", label: "Best-Effort" },
            { value: "At-Least-Once", label: "At-Least-Once" },
            { value: "Exactly-Once", label: "Exactly-Once" },
            { value: "ACID", label: "ACID Transactions" },
          ]}
          onChange={(value) => onChange("data.reliability", value)}
          path="data.reliability"
        />

        {/* Retry Settings */}
        <PropertyToggle
          label="Enable Retries"
          checked={!!data.retryEnabled}
          onChange={(checked) => onChange("data.retryEnabled", checked)}
          path="data.retryEnabled"
          description="Automatically retry failed requests"
        />

        {data.retryEnabled && (
          <>
            <PropertySelect
              label="Retry Strategy"
              value={data.retryStrategy || "Exponential"}
              options={[
                { value: "Linear", label: "Linear" },
                { value: "Exponential", label: "Exponential Backoff" },
                { value: "Constant", label: "Constant" },
                { value: "Custom", label: "Custom" },
              ]}
              onChange={(value) => onChange("data.retryStrategy", value)}
              path="data.retryStrategy"
              className="pl-6"
            />

            <PropertyNumberInput
              label="Max Retries"
              value={data.maxRetries || 3}
              onChange={(value) => onChange("data.maxRetries", value)}
              path="data.maxRetries"
              min={1}
              className="pl-6"
            />

            <PropertyNumberInput
              label="Retry Interval"
              value={data.retryIntervalMs || 1000}
              onChange={(value) => onChange("data.retryIntervalMs", value)}
              path="data.retryIntervalMs"
              min={100}
              unit="ms"
              className="pl-6"
            />
          </>
        )}

        {/* Timeout */}
        <PropertyNumberInput
          label="Timeout"
          value={data.timeout || 5000}
          onChange={(value) => onChange("data.timeout", value)}
          path="data.timeout"
          min={0}
          unit="ms"
          description="Request timeout"
        />

        {/* Circuit Breaker */}
        <PropertyToggle
          label="Enable Circuit Breaker"
          checked={!!data.circuitBreakerEnabled}
          onChange={(checked) =>
            onChange("data.circuitBreakerEnabled", checked)
          }
          path="data.circuitBreakerEnabled"
          description="Protect against cascading failures"
        />

        {data.circuitBreakerEnabled && (
          <PropertySelect
            label="Circuit Breaker Status"
            value={data.circuitBreakerStatus || "Closed"}
            options={[
              { value: "Closed", label: "Closed (normal operation)" },
              { value: "Open", label: "Open (failing fast)" },
              { value: "Half-Open", label: "Half-Open (testing recovery)" },
            ]}
            onChange={(value) => onChange("data.circuitBreakerStatus", value)}
            path="data.circuitBreakerStatus"
            className="pl-6"
          />
        )}

        {/* Failover Strategy */}
        <PropertySelect
          label="Failover Strategy"
          value={data.failoverStrategy || "None"}
          options={[
            { value: "None", label: "None" },
            { value: "Active-Passive", label: "Active-Passive" },
            { value: "Active-Active", label: "Active-Active" },
          ]}
          onChange={(value) => onChange("data.failoverStrategy", value)}
          path="data.failoverStrategy"
        />
      </PropertySection>

      {/* Security Section */}
      <PropertySection title="Security" defaultOpen={false} collapsible>
        {/* Encryption */}
        <PropertySelect
          label="Encryption"
          value={data.encryption || "None"}
          options={[
            { value: "None", label: "None" },
            { value: "TLS", label: "TLS" },
            { value: "End-to-End", label: "End-to-End" },
            { value: "mTLS", label: "Mutual TLS" },
          ]}
          onChange={(value) => onChange("data.encryption", value)}
          path="data.encryption"
        />

        {/* Authentication */}
        <PropertySelect
          label="Authentication"
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
        />
      </PropertySection>

      {/* Data Properties */}
      <PropertySection title="Data Properties" defaultOpen={false} collapsible>
        {/* Request Size */}
        <PropertyNumberInput
          label="Avg. Request Size"
          value={data.averageRequestSizeKB || 1}
          onChange={(value) => onChange("data.averageRequestSizeKB", value)}
          path="data.averageRequestSizeKB"
          min={0.1}
          step={0.1}
          unit="KB"
        />

        {/* Response Size */}
        <PropertyNumberInput
          label="Avg. Response Size"
          value={data.averageResponseSizeKB || 10}
          onChange={(value) => onChange("data.averageResponseSizeKB", value)}
          path="data.averageResponseSizeKB"
          min={0.1}
          step={0.1}
          unit="KB"
        />

        {/* Compression */}
        <PropertyToggle
          label="Compression Enabled"
          checked={!!data.compressionEnabled}
          onChange={(checked) => onChange("data.compressionEnabled", checked)}
          path="data.compressionEnabled"
          description="Data is compressed during transmission"
        />
      </PropertySection>

      {/* Visual Properties */}
      <PropertySection
        title="Visual Properties"
        defaultOpen={false}
        collapsible
      >
        {/* Animated */}
        <PropertyToggle
          label="Animated"
          checked={!!data.animated}
          onChange={(checked) => onChange("data.animated", checked)}
          path="data.animated"
          description="Show animation along the connection"
        />

        {/* Dashed Line */}
        <PropertyToggle
          label="Dashed Line"
          checked={!!data.dashed}
          onChange={(checked) => onChange("data.dashed", checked)}
          path="data.dashed"
          description="Use dashed line style"
        />

        {/* Line Width */}
        <PropertySlider
          label="Line Width"
          value={data.lineWidth || 2}
          onChange={(value) => onChange("data.lineWidth", value)}
          path="data.lineWidth"
          min={1}
          max={10}
          step={1}
          formatValue={(value) => `${value}px`}
          description="Width of the edge line"
        />
      </PropertySection>

      {/* Simulation Properties */}
      <PropertySection
        title="Simulation Properties"
        defaultOpen={false}
        collapsible
      >
        {/* Packet Loss Rate */}
        <PropertySlider
          label="Packet Loss Rate"
          value={data.packetLossRate || 0.001}
          onChange={(value) => onChange("data.packetLossRate", value)}
          path="data.packetLossRate"
          min={0}
          max={0.2}
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(2)}%`}
          description="Percentage of packets lost during transmission"
        />

        {/* Failure Probability */}
        <PropertySlider
          label="Failure Probability"
          value={data.failureProbability || 0.01}
          onChange={(value) => onChange("data.failureProbability", value)}
          path="data.failureProbability"
          min={0}
          max={1}
          step={0.01}
          formatValue={(value) => `${(value * 100).toFixed(0)}%`}
          description="Probability of connection failure during simulation"
        />
      </PropertySection>
    </div>
  );
};

export default BasicEdgeProperties;
