// src/components/canvas/properties/edge/EventStreamEdgeProperties.tsx
import React from "react";
import { EventStreamEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertyToggle from "../common/PropertyToggle";
import PropertyTextInput from "../common/PropertyTextInput";
import PropertyTagInput from "../common/PropertyTagInput";
import PropertySelect from "../common/PropertySelect";
import PropertySlider from "../common/PropertySlider";

interface EventStreamEdgePropertiesProps {
  data: EventStreamEdgeData;
  onChange: (path: string, value: string | number | boolean | string[]) => void;
}

const EventStreamEdgeProperties: React.FC<EventStreamEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Stream Configuration Section */}
      <PropertySection title="Stream Configuration" defaultOpen={true}>
        {/* Stream Name */}
        <PropertyTextInput
          label="Stream Name"
          value={data.streamName || ""}
          onChange={(value) => onChange("data.streamName", value)}
          path="data.streamName"
          placeholder="e.g., user-events"
        />

        {/* Event Types */}
        <PropertyTagInput
          label="Event Types"
          values={data.eventTypes || []}
          onChange={(values) => onChange("data.eventTypes", values)}
          path="data.eventTypes"
          placeholder="Add event type..."
          description="Types of events published to this stream"
        />

        {/* Order Guarantee */}
        <PropertyToggle
          label="Ordered Events"
          checked={!!data.ordered}
          onChange={(checked) => onChange("data.ordered", checked)}
          path="data.ordered"
          description="Events are delivered in strict order"
        />
      </PropertySection>

      {/* Sharding and Scaling Section */}
      <PropertySection
        title="Sharding and Scaling"
        defaultOpen={false}
        collapsible
      >
        {/* Sharding Toggle */}
        <PropertyToggle
          label="Sharded Stream"
          checked={!!data.sharding}
          onChange={(checked) => onChange("data.sharding", checked)}
          path="data.sharding"
          description="Distributes events across multiple partitions"
        />

        {/* Shard Count - only visible if sharding is enabled */}
        {data.sharding && (
          <PropertyNumberInput
            label="Shard Count"
            value={data.shardCount || 1}
            onChange={(value) => onChange("data.shardCount", value)}
            path="data.shardCount"
            min={1}
            max={1000}
            description="Number of shards/partitions"
          />
        )}

        {/* Max Batch Size */}
        <PropertyNumberInput
          label="Max Batch Size"
          value={data.maxBatchSize || 100}
          onChange={(value) => onChange("data.maxBatchSize", value)}
          path="data.maxBatchSize"
          min={1}
          max={10000}
          description="Maximum events in a single batch"
        />
      </PropertySection>

      {/* Storage and Retention */}
      <PropertySection
        title="Storage and Retention"
        defaultOpen={false}
        collapsible
      >
        {/* Retention Period */}
        <PropertyNumberInput
          label="Retention Period"
          value={data.retentionPeriodHours || 24}
          onChange={(value) => onChange("data.retentionPeriodHours", value)}
          path="data.retentionPeriodHours"
          min={1}
          unit="hours"
          description="How long events are stored before deletion"
        />
      </PropertySection>

      {/* Performance Characteristics */}
      <PropertySection
        title="Performance Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Communication Pattern */}
        <PropertySelect
          label="Communication Pattern"
          value={data.communicationPattern || "Pub-Sub"}
          options={[
            { value: "Pub-Sub", label: "Pub-Sub" },
            { value: "Stream", label: "Stream" },
            { value: "Async", label: "Async" },
          ]}
          onChange={(value) => onChange("data.communicationPattern", value)}
          path="data.communicationPattern"
        />

        {/* Throughput Settings */}
        <PropertyNumberInput
          label="Max Throughput"
          value={data.maxThroughputRPS || 1000}
          onChange={(value) => onChange("data.maxThroughputRPS", value)}
          path="data.maxThroughputRPS"
          min={1}
          unit="msgs/sec"
          description="Maximum messages per second"
        />

        {/* Latency */}
        <PropertyNumberInput
          label="Latency"
          value={data.latencyMs || 50}
          onChange={(value) => onChange("data.latencyMs", value)}
          path="data.latencyMs"
          min={1}
          max={10000}
          unit="ms"
          description="Average event propagation latency"
        />
      </PropertySection>

      {/* Reliability Settings */}
      <PropertySection
        title="Reliability Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Reliability Level */}
        <PropertySelect
          label="Reliability Level"
          value={data.reliability || "At-Least-Once"}
          options={[
            { value: "Best-Effort", label: "Best-Effort" },
            { value: "At-Least-Once", label: "At-Least-Once" },
            { value: "Exactly-Once", label: "Exactly-Once" },
          ]}
          onChange={(value) => onChange("data.reliability", value)}
          path="data.reliability"
        />

        {/* Retry Settings */}
        <PropertyToggle
          label="Retry on Failure"
          checked={!!data.retryEnabled}
          onChange={(checked) => onChange("data.retryEnabled", checked)}
          path="data.retryEnabled"
        />

        {data.retryEnabled && (
          <>
            <PropertySelect
              label="Retry Strategy"
              value={data.retryStrategy || "Exponential"}
              options={[
                { value: "Linear", label: "Linear Backoff" },
                { value: "Exponential", label: "Exponential Backoff" },
                { value: "Constant", label: "Constant Interval" },
              ]}
              onChange={(value) => onChange("data.retryStrategy", value)}
              path="data.retryStrategy"
            />

            <PropertyNumberInput
              label="Max Retries"
              value={data.maxRetries || 3}
              onChange={(value) => onChange("data.maxRetries", value)}
              path="data.maxRetries"
              min={1}
              max={100}
            />
          </>
        )}
      </PropertySection>

      {/* Simulation Parameters */}
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
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(3)}%`}
          description="Chance of event delivery failure"
        />

        {/* Cost Parameters */}
        <PropertyNumberInput
          label="Cost per GB"
          value={data.costPerGB || 0.1}
          onChange={(value) => onChange("data.costPerGB", value)}
          path="data.costPerGB"
          min={0}
          step={0.01}
          unit="$"
        />

        <PropertyNumberInput
          label="Cost per Million Events"
          value={data.costPerMillionRequests || 0.2}
          onChange={(value) => onChange("data.costPerMillionRequests", value)}
          path="data.costPerMillionRequests"
          min={0}
          step={0.01}
          unit="$"
        />
      </PropertySection>
    </div>
  );
};

export default EventStreamEdgeProperties;
