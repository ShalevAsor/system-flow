// src/components/canvas/properties/LoadBalancerNodeProperties.tsx
import React from "react";
import { LoadBalancerNodeData } from "../../../../types/flow/nodeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";

interface LoadBalancerNodePropertiesProps {
  data: LoadBalancerNodeData;
  onChange: (path: string, value: string | number | boolean | string[]) => void;
}

const LoadBalancerNodeProperties: React.FC<LoadBalancerNodePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Configuration Section */}
      <PropertySection
        title="basic configuration"
        defaultOpen={false}
        collapsible
      >
        {/* Load Balancer Type */}
        <PropertySelect
          label="Load Balancer Type"
          value={data.loadBalancerType || "Application"}
          options={[
            { value: "Application", label: "Application Load Balancer (L7)" },
            { value: "Network", label: "Network Load Balancer (L4)" },
            { value: "Classic", label: "Classic Load Balancer" },
            { value: "Gateway", label: "API Gateway" },
          ]}
          onChange={(value) => onChange("data.loadBalancerType", value)}
          path="data.loadBalancerType"
        />

        {/* Distribution Algorithm */}
        <PropertySelect
          label="Distribution Algorithm"
          value={data.algorithm || "Round Robin"}
          options={[
            { value: "Round Robin", label: "Round Robin" },
            { value: "Least Connections", label: "Least Connections" },
            { value: "IP Hash", label: "IP Hash / Sticky Sessions" },
            { value: "Weighted", label: "Weighted Distribution" },
            { value: "URL Path", label: "URL Path Based" },
          ]}
          onChange={(value) => onChange("data.algorithm", value)}
          path="data.algorithm"
        />

        {/* Session Persistence */}
        <PropertyToggle
          label="Enable Session Persistence"
          checked={!!data.sessionPersistence}
          onChange={(checked) => onChange("data.sessionPersistence", checked)}
          path="data.sessionPersistence"
        />
        {data.sessionPersistence && (
          <PropertyNumberInput
            label="Session Timeout"
            value={data.sessionTimeout || 30}
            onChange={(value) => onChange("data.sessionTimeout", value)}
            path="data.sessionTimeout"
            min={1}
            max={1440}
            className="pl-6"
          />
        )}
      </PropertySection>

      {/* Capacity & Performance Section */}
      <PropertySection
        title="Capacity & Performance"
        defaultOpen={false}
        collapsible
      >
        {/* Throughput Capacity */}
        <PropertyNumberInput
          label="Max Throughput"
          value={data.maxThroughput || 10000}
          onChange={(value) => onChange("data.maxThroughput", value)}
          path="data.maxThroughput"
          min={1}
          description="Max requests per second"
        />

        {/* Connection Limits */}
        <PropertyNumberInput
          label="Max Concurrent Connections"
          value={data.maxConnections || 100000}
          onChange={(value) => onChange("data.maxConnections", value)}
          path="data.maxConnections"
          min={1}
        />

        {/* Processing Latency */}
        <PropertyNumberInput
          label="Processing Latency"
          value={data.processingLatency || 1}
          onChange={(value) => onChange("data.processingLatency", value)}
          path="data.processingLatency"
          min={0}
          step={0.1}
          unit="ms"
        />

        {/* SSL/TLS Handling */}
        <PropertyToggle
          label="SSL/TLS Termination"
          checked={!!data.sslTermination}
          onChange={(checked) => onChange("data.sslTermination", checked)}
          path="data.sslTermination"
        />
      </PropertySection>

      {/* Health Checking Section */}
      <PropertySection title="Health checking" defaultOpen={false} collapsible>
        {/* Health Check Toggle */}
        <PropertyToggle
          label="Health Checks"
          checked={!!data.healthCheckEnabled}
          onChange={(checked) => onChange("data.healthCheckEnabled", checked)}
          path="data.healthCheckEnabled"
          inline={false}
        />

        {/* Show health check options only if health check is enabled */}
        {data.healthCheckEnabled && (
          <div className="pl-6 space-y-3">
            {/* Health Check Path */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Check Path
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={data.healthCheckPath || "/health"}
                onChange={(e) =>
                  onChange("data.healthCheckPath", e.target.value)
                }
                placeholder="/health"
              />
            </div>

            {/* Health Check Interval */}
            <PropertyNumberInput
              label="Check Interval"
              value={data.healthCheckInterval || 30}
              onChange={(value) => onChange("data.healthCheckInterval", value)}
              path="data.healthCheckInterval"
              min={1}
              max={300}
              step={0.1}
              unit="s"
            />

            {/* Health Check Timeout */}
            <PropertyNumberInput
              label="Check Timeout"
              value={data.healthCheckTimeout || 5}
              onChange={(value) => onChange("data.healthCheckTimeout", value)}
              path="data.healthCheckTimeout"
              min={1}
              max={60}
              unit="s"
            />
            {/* Healthy Threshold */}
            <PropertyNumberInput
              label="Healthy Threshold"
              value={data.healthyThreshold || 2}
              onChange={(value) => onChange("data.healthyThreshold", value)}
              path="data.healthyThreshold"
              min={1}
              max={10}
              description="Number of consecutive successful checks before considering a
                  server healthy"
            />

            {/* Unhealthy Threshold */}
            <PropertyNumberInput
              label="Unhealthy Threshold"
              value={data.unhealthyThreshold || 2}
              onChange={(value) => onChange("data.unhealthyThreshold", value)}
              path="data.unhealthyThreshold"
              min={1}
              max={10}
              description="Number of consecutive failed checks before considering a
                  server unhealthy"
            />
          </div>
        )}
      </PropertySection>

      {/* Advanced Features Section */}
      <PropertySection
        title="Advanced Features"
        defaultOpen={false}
        collapsible
      >
        {/* Auto Scaling Connection */}
        <PropertyToggle
          label="Auto Scaling"
          checked={!!data.connectToAutoScaling}
          onChange={(checked) => onChange("data.connectToAutoScaling", checked)}
          path="data.connectToAutoScaling"
          description="Connect to Auto Scaling Groups"
        />

        {/* Content-based Routing */}
        <PropertyToggle
          label="Content-based Routing"
          checked={!!data.contentBasedRouting}
          onChange={(checked) => onChange("data.contentBasedRouting", checked)}
          path="data.contentBasedRouting"
          description="Routes requests based on content type, path, or header values"
        />

        {/* Rate Limiting */}
        <PropertyToggle
          label="Rate Limiting"
          checked={!!data.rateLimitingEnabled}
          onChange={(checked) => onChange("data.rateLimitingEnabled", checked)}
          path="data.rateLimitingEnabled"
          description="Limits the number of requests per time interval"
        />
      </PropertySection>

      {/* Failover Configuration Section */}
      <PropertySection
        title="Failover Configuration"
        defaultOpen={false}
        collapsible
      >
        {/* High Availability */}
        <PropertyToggle
          label="High Availability"
          checked={!!data.highAvailability}
          onChange={(checked) => onChange("data.highAvailability", checked)}
          path="data.highAvailability"
          description="Enables high availability across multiple availability zones"
        />

        {/* Failover Strategy */}
        <PropertySelect
          label="Failover Strategy"
          value={data.failoverStrategy || "Active-Passive"}
          options={[
            { value: "Active-Passive", label: "Active-Passive" },
            { value: "Active-Active", label: "Active-Active" },
            { value: "N+1", label: "N+1 Redundancy" },
          ]}
          onChange={(value) => onChange("data.failoverStrategy", value)}
          path="data.failoverStrategy"
        />
      </PropertySection>

      {/* Simulation Parameters Section (Advanced) */}
      <PropertySection
        title="Simulation Parameters"
        defaultOpen={false}
        collapsible
      >
        {/* Failure Probability */}
        <PropertySlider
          label="Failure Probability"
          value={data.failureProbability || 0.001}
          onChange={(value) => onChange("data.failureProbability", value)}
          path="data.failureProbability"
          min={0}
          max={0.5}
          step={0.0001}
          formatValue={(value) => `${(value * 100).toFixed(3)}%`}
          description="Chance of this server failing during simulation"
        />
      </PropertySection>
    </div>
  );
};

export default LoadBalancerNodeProperties;
