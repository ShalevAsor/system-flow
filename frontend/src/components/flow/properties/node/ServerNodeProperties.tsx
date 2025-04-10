import React from "react";
import { ServerNodeData } from "../../../../types/flow/nodeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";
import PropertyTagInput from "../common/PropertyTagInput";

interface ServerNodePropertiesProps {
  data: ServerNodeData;
  onChange: (path: string, value: string | number | boolean | string[]) => void;
}

const ServerNodeProperties: React.FC<ServerNodePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Compute Resources Section */}
      <PropertySection
        title="Compute Resources"
        collapsible
        defaultOpen={false}
      >
        {/* CPU Configuration */}
        <div className="grid grid-cols-2 gap-3">
          <PropertyNumberInput
            label="CPU Cores"
            path="data.cpuCores"
            value={data.cpuCores || 4}
            onChange={(value) => onChange("data.cpuCores", value)}
            min={1}
            max={128}
          />
          <PropertyNumberInput
            label="CPU Speed"
            value={data.cpuSpeed || 2.5}
            onChange={(value) => onChange("data.cpuSpeed", value)}
            path="data.cpuSpeed"
            min={1}
            max={5}
            step={0.1}
            unit="GHz"
          />
        </div>

        {/* Memory and Storage */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <PropertyNumberInput
            label="Memory"
            value={data.memory || 8}
            onChange={(value) => onChange("data.memory", value)}
            path="data.memory"
            min={1}
            max={1024}
            unit="GB"
          />
          <PropertyNumberInput
            label="Storage"
            value={data.storage || 100}
            onChange={(value) => onChange("data.storage", value)}
            path="data.storage"
            min={0}
            max={10000}
            unit="GB"
          />
        </div>

        {/* GPU Toggle */}
        <PropertyToggle
          label="Include GPU"
          checked={!!data.hasGPU}
          onChange={(checked) => onChange("data.hasGPU", checked)}
          path="data.hasGPU"
        />
      </PropertySection>

      {/* Deployment Configuration Section */}
      <PropertySection
        title="Deployment Configuration"
        defaultOpen={false}
        collapsible
      >
        {/* Deployment Type */}
        <PropertySelect
          label="Deployment Type"
          value={data.deploymentType || "Container"}
          options={[
            { value: "Container", label: "Container" },
            { value: "VM", label: "Virtual Machine" },
            { value: "Bare Metal", label: "Bare Metal" },
            { value: "Serverless", label: "Serverless" },
          ]}
          onChange={(value) => onChange("data.deploymentType", value)}
          path="data.deploymentType"
        />

        {/* Instances */}
        <PropertyNumberInput
          label="Instances"
          path="data.instances"
          value={data.instances || 2}
          onChange={(value) => onChange("data.instances", value)}
          min={1}
          max={1000}
        />
        {/* Auto Scaling */}
        <PropertyToggle
          label="Enable Auto Scaling"
          checked={!!data.autoScaling}
          onChange={(checked) => onChange("data.autoScaling", checked)}
          path="data.autoScaling"
        />
        <div className="mb-3">
          {/* Show auto scaling options only if auto scaling is enabled */}
          {data.autoScaling && (
            <div className="pl-6 mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <PropertyNumberInput
                  label="Min Instances"
                  value={data.minInstances || 1}
                  onChange={(value) => onChange("data.minInstances", value)}
                  path="data.minInstances"
                  min={1}
                  max={data.maxInstances || 10}
                />
                <PropertyNumberInput
                  label="Max Instances"
                  value={data.maxInstances || 10}
                  onChange={(value) => onChange("data.maxInstances", value)}
                  path="data.maxInstances"
                  min={data.minInstances || 1}
                  max={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-end ">
                <PropertySelect
                  label="Scaling Metric"
                  value={data.scalingMetric || "CPU"}
                  options={[
                    { value: "CPU", label: "CPU Utilization" },
                    { value: "Memory", label: "Memory Utilization" },
                    { value: "Requests", label: "Request Count" },
                    { value: "Custom", label: "Custom Metric" },
                  ]}
                  onChange={(value) => onChange("data.scalingMetric", value)}
                  path="data.scalingMetric"
                />

                <PropertyNumberInput
                  label="Scaling Threshold"
                  value={data.scalingThreshold || 70}
                  onChange={(value) => onChange("data.scalingThreshold", value)}
                  path="data.scalingThreshold"
                  min={1}
                  max={100}
                  unit="%"
                />
              </div>
            </div>
          )}
        </div>

        {/* Region */}
        <PropertySelect
          label="Region"
          value={data.region || "us-east-1"}
          options={[
            { value: "us-east-1", label: "US East (N. Virginia)" },
            { value: "us-west-2", label: "US West (Oregon)" },
            { value: "eu-west-1", label: "EU (Ireland)" },
            { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
            { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
          ]}
          onChange={(value) => onChange("data.region", value)}
          path="data.region"
          description="Geographic location where server is deployed"
        />
      </PropertySection>

      {/* Performance Characteristics Section */}
      <PropertySection
        title="Performance Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Request Handling */}
        <div className="grid grid-cols-2 gap-3">
          <PropertyNumberInput
            label="Max Requests/Second"
            value={data.maxRequestsPerSecond || 1000}
            onChange={(value) => onChange("data.maxRequestsPerSecond", value)}
            path="data.maxRequestsPerSecond"
            min={1}
            max={1000000}
          />
          <PropertyNumberInput
            label="Avg Processing Time"
            value={data.averageProcessingTime || 50}
            onChange={(value) => onChange("data.averageProcessingTime", value)}
            path="data.averageProcessingTime"
            min={1}
            unit="ms"
          />
        </div>

        {/* Concurrency */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <PropertySelect
            label="Concurrency Model"
            value={data.concurrencyModel || "Multi-Threaded"}
            options={[
              { value: "Single-Threaded", label: "Single-Threaded" },
              { value: "Multi-Threaded", label: "Multi-Threaded" },
              { value: "Event-Loop", label: "Event-Loop" },
              { value: "Worker Pool", label: "Worker Pool" },
            ]}
            onChange={(value) => onChange("data.concurrencyModel", value)}
            path="data.concurrencyModel"
            description="How the server handles concurrent requests"
          />

          <PropertyNumberInput
            label="Max Concurrent Requests"
            value={data.maxConcurrentRequests || 100}
            onChange={(value) => onChange("data.maxConcurrentRequests", value)}
            path="data.maxConcurrentRequests"
            min={1}
            description="Maximum number of concurrent requests the server can handle"
          />
        </div>
      </PropertySection>

      {/* Reliability Features Section */}
      <PropertySection
        title="Reliability Features"
        defaultOpen={false}
        collapsible
      >
        {/* Health Check */}
        <PropertyToggle
          label="Health Checks"
          checked={!!data.healthCheckEnabled}
          onChange={(checked) => onChange("data.healthCheckEnabled", checked)}
          path="data.healthCheckEnabled"
        />
        <div className="mb-3">
          {/* Show health check options only if health check is enabled */}
          {data.healthCheckEnabled && (
            <div className="pl-6 mt-2 space-y-3">
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
              <PropertyNumberInput
                label="Check Interval"
                value={data.healthCheckInterval || 30}
                onChange={(value) =>
                  onChange("data.healthCheckInterval", value)
                }
                path="data.healthCheckInterval"
                min={1}
                max={300}
                unit="Seconds"
              />
            </div>
          )}
        </div>

        {/* Restart Policy */}
        <PropertySelect
          label="Restart Policy"
          value={data.restartPolicy || "Always"}
          options={[
            { value: "Always", label: "Always" },
            { value: "OnFailure", label: "On Failure" },
            { value: "Never", label: "Never" },
          ]}
          onChange={(value) => onChange("data.restartPolicy", value)}
          path="data.restartPolicy"
        />
      </PropertySection>

      {/* API Properties Section */}
      <PropertySection title="API Properties" defaultOpen={false} collapsible>
        {/* Supported Protocols */}
        <PropertyTagInput
          label="Supported Protocols"
          values={data.supportedProtocols || []}
          onChange={(values) => onChange("data.supportedProtocols", values)}
          path="data.supportedProtocols"
          description="Communication protocols supported by this server"
          options={[
            { value: "HTTP", label: "HTTP" },
            { value: "HTTPS", label: "HTTPS" },
            { value: "WebSocket", label: "WebSocket" },
            { value: "gRPC", label: "gRPC" },
            { value: "TCP", label: "TCP" },
            { value: "UDP", label: "UDP" },
          ]}
        />

        {/* Authentication */}
        <PropertyToggle
          label="Authentication Required"
          checked={!!data.authenticationRequired}
          onChange={(checked) =>
            onChange("data.authenticationRequired", checked)
          }
          path="data.authenticationRequired"
        />

        {/* Rate Limit */}
        <PropertyNumberInput
          label="Rate Limit"
          value={data.rateLimitPerSecond || 0}
          onChange={(value) => onChange("data.rateLimitPerSecond", value)}
          path="data.rateLimitPerSecond"
          min={0}
          unit="req/sec"
          placeholder="0 = No limit"
          description="Maximum allowed requests per second"
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
          value={data.failureProbability || 0.005}
          onChange={(value) => onChange("data.failureProbability", value)}
          path="data.failureProbability"
          min={0}
          max={0.5}
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(3)}%`}
          description="Chance of this server failing during simulation"
        />
      </PropertySection>
    </div>
  );
};

export default ServerNodeProperties;
