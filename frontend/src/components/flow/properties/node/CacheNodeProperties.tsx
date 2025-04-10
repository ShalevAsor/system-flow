// src/components/canvas/properties/CacheNodeProperties.tsx
import React from "react";
import { CacheNodeData } from "../../../../types/flow/nodeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";

interface CacheNodePropertiesProps {
  data: CacheNodeData;
  onChange: (path: string, value: string | number | boolean) => void;
}

const CacheNodeProperties: React.FC<CacheNodePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Configuration Section */}
      <PropertySection
        title="Basic Configuration"
        defaultOpen={false}
        collapsible
      >
        {/* Cache Type */}
        <PropertySelect
          label="Cache Type"
          value={data.cacheType || "In-Memory"}
          options={[
            { value: "In-Memory", label: "In-Memory Cache" },
            { value: "Distributed", label: "Distributed Cache" },
            { value: "CDN", label: "Content Delivery Network" },
            { value: "Browser", label: "Browser Cache" },
            { value: "Application", label: "Application Cache" },
          ]}
          onChange={(value) => onChange("data.cacheType", value)}
          path="data.cacheType"
        />

        {/* Cache Size */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <PropertyNumberInput
            label="Cache Size"
            value={data.cacheSizeValue || 1}
            onChange={(value) => onChange("data.cacheSizeValue", value)}
            path="data.cacheSizeValue"
            min={1}
          />
          <PropertySelect
            label="Unit"
            value={data.cacheSizeUnit || "GB"}
            options={[
              { value: "MB", label: "MB" },
              { value: "GB", label: "GB" },
              { value: "TB", label: "TB" },
            ]}
            onChange={(value) => onChange("data.cacheSizeUnit", value)}
            path="data.cacheSizeUnit"
            className="w-24"
          />
        </div>

        {/* TTL (Time to Live) */}
        <PropertyNumberInput
          label="Default TTL"
          value={data.ttl || 3600}
          onChange={(value) => onChange("data.ttl", value)}
          path="data.ttl"
          min={0}
          unit="sec"
          description="Time-to-live for cached items (0 = no expiration)"
        />
      </PropertySection>

      {/* Cache Policy Section */}
      <PropertySection title="Cache Policy" defaultOpen={false} collapsible>
        {/* Eviction Policy */}
        <PropertySelect
          label="Eviction Policy"
          value={data.evictionPolicy || "LRU"}
          options={[
            { value: "LRU", label: "LRU (Least Recently Used)" },
            { value: "LFU", label: "LFU (Least Frequently Used)" },
            { value: "FIFO", label: "FIFO (First In First Out)" },
            { value: "Random", label: "Random Replacement" },
          ]}
          onChange={(value) => onChange("data.evictionPolicy", value)}
          path="data.evictionPolicy"
          description="Strategy for removing items when the cache is full"
        />

        {/* Write Policy */}
        <PropertySelect
          label="Write Policy"
          value={data.writePolicy || "Write-Through"}
          options={[
            { value: "Write-Through", label: "Write-Through" },
            { value: "Write-Behind", label: "Write-Behind" },
            { value: "Write-Around", label: "Write-Around" },
          ]}
          onChange={(value) => onChange("data.writePolicy", value)}
          path="data.writePolicy"
        />

        {/* Consistency Setting */}
        <PropertySelect
          label="Consistency Level"
          value={data.consistencyLevel || "Eventual"}
          options={[
            { value: "Strong", label: "Strong Consistency" },
            { value: "Eventual", label: "Eventual Consistency" },
          ]}
          onChange={(value) => onChange("data.consistencyLevel", value)}
          path="data.consistencyLevel"
        />
      </PropertySection>

      {/* Performance Section */}
      <PropertySection title="Performance" defaultOpen={false} collapsible>
        {/* Max Throughput */}
        <PropertyNumberInput
          label="Max Throughput"
          value={data.maxThroughput || 100000}
          onChange={(value) => onChange("data.maxThroughput", value)}
          path="data.maxThroughput"
          min={1}
          unit="ops/sec"
        />

        {/* Latency */}
        <PropertyNumberInput
          label="Average Latency"
          value={data.averageLatency || 0.5}
          onChange={(value) => onChange("data.averageLatency", value)}
          path="data.averageLatency"
          min={0.01}
          step={0.01}
          max={100000}
          unit="ms"
        />

        {/* Expected Hit Rate */}
        <PropertySlider
          label="Expected Hit Rate"
          value={data.expectedHitRate || 0.8}
          onChange={(value) => onChange("data.expectedHitRate", value)}
          path="data.expectedHitRate"
          min={0}
          max={1}
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(0)}%`}
        />
      </PropertySection>

      {/* Distribution & Scaling Section */}
      <PropertySection
        title="Distribution & Scaling"
        defaultOpen={false}
        collapsible
      >
        {/* Replication */}
        <PropertyToggle
          label="Replication"
          checked={!!data.replicationEnabled}
          onChange={(checked) => onChange("data.replicationEnabled", checked)}
          path="data.replicationEnabled"
        />

        {data.replicationEnabled && (
          <PropertyNumberInput
            label="Number of Replicas"
            value={data.replicaCount || 2}
            onChange={(value) => onChange("data.replicaCount", value)}
            path="data.replicaCount"
            min={1}
            max={10}
            className="pl-6"
          />
        )}

        {/* Sharding */}
        <PropertyToggle
          label="Sharding"
          checked={!!data.shardingEnabled}
          onChange={(checked) => onChange("data.shardingEnabled", checked)}
          path="data.shardingEnabled"
        />

        {data.shardingEnabled && (
          <PropertyNumberInput
            label="Number of Shards"
            value={data.shardCount || 3}
            onChange={(value) => onChange("data.shardCount", value)}
            path="data.shardCount"
            min={2}
            max={100}
            className="pl-6"
          />
        )}

        {/* Auto Scaling */}
        <PropertyToggle
          label="Auto Scaling"
          checked={!!data.autoScalingEnabled}
          onChange={(checked) => onChange("data.autoScalingEnabled", checked)}
          path="data.autoScalingEnabled"
        />
      </PropertySection>

      {/* Simulation Parameters Section (Advanced) */}
      <PropertySection
        title="Simulation Parameters"
        defaultOpen={false}
        collapsible
      >
        {/* Item size distribution */}
        <PropertyNumberInput
          label="Average Item Size"
          value={data.averageItemSize || 10}
          onChange={(value) => onChange("data.averageItemSize", value)}
          path="data.averageItemSize"
          min={0.1}
          step={0.1}
          unit="KB"
          description="The average size of an item in kilobytes"
        />

        {/* Failure Probability */}
        <PropertySlider
          label="Failure Probability"
          value={data.failureProbability || 0.002}
          onChange={(value) => onChange("data.failureProbability", value)}
          path="data.failureProbability"
          min={0}
          max={0.5}
          step={0.0001}
          formatValue={(value) => `${(value * 100).toFixed(3)}%`}
        />
      </PropertySection>
    </div>
  );
};

export default CacheNodeProperties;
