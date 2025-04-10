// src/components/canvas/properties/ClientNodeProperties.tsx
import React from "react";
import { ClientNodeData } from "../../../../types/flow/nodeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";
import PropertyTagInput from "../common/PropertyTagInput";

interface ClientNodePropertiesProps {
  data: ClientNodeData;
  onChange: (path: string, value: string | number | boolean | string[]) => void;
}

const ClientNodeProperties: React.FC<ClientNodePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Client Type and Characteristics Section */}
      <PropertySection
        title="Client Type & Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Client Type */}
        <PropertySelect
          label="Client Type"
          value={data.clientType || "Browser"}
          options={[
            { value: "Browser", label: "Web Browser" },
            { value: "Mobile App", label: "Mobile App" },
            {
              value: "Desktop App",
              label: "Desktop App",
            },
            {
              value: "IoT Device",
              label: "IoT Device",
            },
            {
              value: "API Client",
              label: "API Client",
            },
          ]}
          onChange={(value) => onChange("data.clientType", value)}
          path="data.clientType"
        />

        {/* Device Performance */}
        <PropertySelect
          label="Device Performance"
          value={data.devicePerformance || "Medium"}
          options={[
            { value: "Low", label: "Low (Limited processing power)" },
            { value: "Medium", label: "Medium (Average consumer device)" },
            {
              value: "High",
              label: "High (High-end device)",
            },
          ]}
          onChange={(value) => onChange("data.devicePerformance", value)}
          path="data.devicePerformance"
        />

        {/* Connection Type */}
        <PropertySelect
          label="Connection Type"
          value={data.connectionType || "WiFi"}
          options={[
            { value: "Wired", label: "Wired Connection" },
            { value: "WiFi", label: "WiFi" },
            {
              value: "Cellular",
              label: "Cellular (4G)",
            },
            {
              value: "5G",
              label: "5G",
            },
            {
              value: "Satellite",
              label: "Satellite",
            },
          ]}
          onChange={(value) => onChange("data.connectionType", value)}
          path="data.connectionType"
        />

        {/* Geographic Distribution */}
        <PropertyTagInput
          label="Geographic Distribution"
          values={data.geographicDistribution || []}
          onChange={(values) => onChange("data.geographicDistribution", values)}
          path="data.geographicDistribution"
          placeholder="e.g., North America, Europe, Asia"
          description="Regions where clients are located"
        />
      </PropertySection>

      {/* Usage Patterns Section */}
      <PropertySection title="Usage Patterns" defaultOpen={false} collapsible>
        {/* Concurrent Users */}
        <PropertyNumberInput
          label="Concurrent Users"
          value={data.concurrentUsers || 100}
          onChange={(value) => onChange("data.concurrentUsers", value)}
          path="data.concurrentUsers"
          min={1}
          description="Maximum number of concurrent users"
        />
      </PropertySection>

      {/* Security and Authentication Section */}
      <PropertySection
        title="Security & Authentication"
        defaultOpen={false}
        collapsible
      >
        {/* Authentication Method */}
        <PropertySelect
          label="Authentication Method"
          value={data.authenticationMethod || "OAuth"}
          options={[
            { value: "None", label: "None" },
            { value: "Basic", label: "Basic Auth" },
            { value: "OAuth", label: "OAuth" },
            { value: "JWT", label: "JWT" },
            { value: "API Key", label: "API Key" },
            { value: "Client Certificate", label: "Client Certificate" },
          ]}
          onChange={(value) => onChange("data.authenticationMethod", value)}
          path="data.authenticationMethod"
        />

        {/* Secure Connection */}
        <PropertyToggle
          label="Secure Connection"
          checked={!!data.requireSecureConnection}
          onChange={(checked) =>
            onChange("data.requireSecureConnection", checked)
          }
          path="data.requireSecureConnection"
          description="Requires a secure connection (HTTPS/TLS)"
        />
      </PropertySection>

      {/* Communication Properties Section */}
      <PropertySection
        title="Communication Properties"
        defaultOpen={false}
        collapsible
      >
        {/* Preferred Protocol */}
        <PropertySelect
          label="Preferred Protocol"
          value={data.preferredProtocol || "HTTPS"}
          options={[
            { value: "HTTP", label: "HTTP" },
            { value: "HTTPS", label: "HTTPS" },
            { value: "WebSocket", label: "WebSocket" },
            { value: "gRPC", label: "gRPC" },
            { value: "TCP", label: "TCP" },
            { value: "UDP", label: "UDP" },
          ]}
          onChange={(value) => onChange("data.preferredProtocol", value)}
          path="data.preferredProtocol"
        />

        {/* Supported Protocols */}
        <PropertyTagInput
          label="Supported Protocols"
          values={data.supportedProtocols || []}
          onChange={(values) => onChange("data.supportedProtocols", values)}
          path="data.supportedProtocols"
          description="Communication protocols supported by this client"
          options={[
            { value: "HTTP", label: "HTTP" },
            { value: "HTTPS", label: "HTTPS" },
            { value: "WebSocket", label: "WebSocket" },
            { value: "gRPC", label: "gRPC" },
            { value: "TCP", label: "TCP" },
            { value: "UDP", label: "UDP" },
          ]}
        />

        {/* Connection Settings */}
        <PropertyToggle
          label="Keep Connection Alive"
          checked={!!data.connectionPersistence}
          onChange={(checked) =>
            onChange("data.connectionPersistence", checked)
          }
          path="data.connectionPersistence"
        />

        {/* Reconnect Attempts */}
        <PropertyNumberInput
          label="Reconnect Attempts"
          value={data.reconnectAttempts || 3}
          onChange={(value) => onChange("data.reconnectAttempts", value)}
          path="data.reconnectAttempts"
          min={0}
        />
      </PropertySection>

      {/* Network Characteristics Section */}
      <PropertySection
        title="Network Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Bandwidth Limit */}
        <PropertyNumberInput
          label="Bandwidth Limit"
          value={data.bandwidthLimit || 10}
          onChange={(value) => onChange("data.bandwidthLimit", value)}
          path="data.bandwidthLimit"
          min={0.1}
          step={0.1}
          max={100}
          unit="Mbps"
        />

        {/* Packet Loss Rate */}
        <PropertySlider
          label="Packet Loss Rate"
          value={data.packetLossRate || 0.001}
          onChange={(value) => onChange("data.packetLossRate", value)}
          path="data.packetLossRate"
          min={0}
          max={0.2}
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(1)}%`}
          description="Adjust the multiplier for peak hour traffic"
        />

        {/* Network Stability */}
        <PropertySlider
          label="Network Stability"
          value={data.networkStability || 0.95}
          onChange={(value) => onChange("data.networkStability", value)}
          path="data.networkStability"
          min={0.5}
          max={1}
          step={0.01}
          formatValue={(value) => `${(value * 100).toFixed(0)}%`}
          description="Adjust the multiplier for peak hour traffic"
        />
      </PropertySection>

      {/* Simulation Properties Section - Advanced */}
      <PropertySection
        title="Simulation Properties"
        defaultOpen={false}
        collapsible
      >
        {/* Request Pattern */}
        <PropertySelect
          label="Request Pattern"
          value={data.requestPattern || "Steady"}
          options={[
            { value: "Steady", label: "Steady (Consistent rate)" },
            { value: "Bursty", label: "Bursty (Random spikes)" },
            { value: "Periodic", label: "Periodic (Regular peaks)" },
            { value: "Random", label: "Random (Unpredictable)" },
          ]}
          onChange={(value) => onChange("data.requestPattern", value)}
          path="data.requestPattern"
        />

        {/* Pattern specific fields */}
        {data.requestPattern === "Bursty" && (
          <PropertyNumberInput
            label="Burst Factor"
            value={data.burstFactor || 3}
            onChange={(value) => onChange("data.burstFactor", value)}
            path="data.burstFactor"
            min={1.1}
            step={0.1}
            max={100}
            description="multiplier for the burst size"
            className="pl-6"
          />
        )}

        {data.requestPattern === "Periodic" && (
          <PropertyNumberInput
            label="Period"
            value={data.periodSeconds || 60}
            onChange={(value) => onChange("data.periodSeconds", value)}
            path="data.periodSeconds"
            min={1}
            unit="sec"
            className="pl-6"
          />
        )}

        {/* Retry settings */}
        <PropertyToggle
          label="Retry on Error"
          checked={!!data.retryOnError}
          onChange={(checked) => onChange("data.retryOnError", checked)}
          path="data.retryOnError"
        />

        {data.retryOnError && (
          <PropertyNumberInput
            label="Max Retries"
            value={data.maxRetries || 3}
            onChange={(value) => onChange("data.maxRetries", value)}
            path="data.maxRetries"
            min={1}
            max={10}
            className="pl-6"
          />
        )}

        {/* Caching */}
        <PropertyToggle
          label="Client-side Caching"
          checked={!!data.cacheEnabled}
          onChange={(checked) => onChange("data.cacheEnabled", checked)}
          path="data.cacheEnabled"
        />

        {data.cacheEnabled && (
          <PropertyNumberInput
            label="Cache TTL"
            value={data.cacheTTL || 300}
            onChange={(value) => onChange("data.cacheTTL", value)}
            path="data.cacheTTL"
            min={1}
            className="pl-6"
            unit="sec"
          />
        )}

        {/* Load Test Parameters */}
        <div className="mb-3">
          <h5 className="font-medium text-sm mb-2">Load Testing Parameters</h5>
          <PropertyNumberInput
            label="Think Time Between Requests"
            value={data.thinkTimeBetweenRequests || 1000}
            onChange={(value) =>
              onChange("data.thinkTimeBetweenRequests", value)
            }
            path="data.thinkTimeBetweenRequests"
            min={0}
            unit="sec"
          />
        </div>
      </PropertySection>
    </div>
  );
};

export default ClientNodeProperties;
