// src/components/canvas/properties/MessageQueueEdgeProperties.tsx
import React from "react";
import {
  MessageQueueEdgeData,
  MessagePriority,
  DeliveryGuarantee,
  EdgeType,
} from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import PropertyTextInput from "../common/PropertyTextInput";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface MessageQueueEdgePropertiesProps {
  data: MessageQueueEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
  edgeType: EdgeType;
}

const MessageQueueEdgeProperties: React.FC<MessageQueueEdgePropertiesProps> = ({
  data,
  onChange,
  edgeType,
}) => {
  const isKafka = edgeType === EdgeType.Kafka;
  const isMQTT = edgeType === EdgeType.MQTT;
  const isAMQP = edgeType === EdgeType.AMQP;

  // Get protocol-specific title
  const getProtocolTitle = () => {
    if (isKafka) return "Kafka Properties";
    if (isMQTT) return "MQTT Properties";
    if (isAMQP) return "AMQP Properties";
    return "Message Queue Properties";
  };

  // Get protocol-specific field name
  const getMessageDestinationLabel = () => {
    if (isKafka) return "Topic Pattern";
    if (isMQTT) return "Topic Pattern";
    if (isAMQP) return "Exchange/Queue";
    return "Topic/Queue Name";
  };

  return (
    <div className="space-y-6">
      {/* Basic Message Queue Properties Section */}
      <PropertySection
        title={getProtocolTitle()}
        defaultOpen={true}
        collapsible
      >
        {/* Topic/Queue Pattern */}
        <PropertyTextInput
          label={getMessageDestinationLabel()}
          value={data.topicPattern || ""}
          onChange={(value) => onChange("data.topicPattern", value)}
          path="data.topicPattern"
          placeholder={
            isKafka ? "e.g., user-events.*" : "e.g., device/+/telemetry"
          }
          description={
            isKafka
              ? "Kafka topic pattern"
              : isMQTT
              ? "MQTT topic pattern"
              : "Message destination"
          }
        />

        {/* Queue Name (for AMQP or legacy APIs) */}
        {!isMQTT && (
          <PropertyTextInput
            label="Queue Name"
            value={data.queueName || ""}
            onChange={(value) => onChange("data.queueName", value)}
            path="data.queueName"
            placeholder="e.g., user-events"
            description="Queue name (if applicable)"
          />
        )}

        {/* Delivery Guarantee */}
        <PropertySelect
          label="Delivery Guarantee"
          value={data.deliveryGuarantee || "At-Least-Once"}
          options={[
            {
              value: "At-Most-Once",
              label: "At Most Once (fastest, may lose messages)",
            },
            {
              value: "At-Least-Once",
              label: "At Least Once (may duplicate messages)",
            },
            {
              value: "Exactly-Once",
              label: "Exactly Once (slowest, most reliable)",
            },
          ]}
          onChange={(value) =>
            onChange("data.deliveryGuarantee", value as DeliveryGuarantee)
          }
          path="data.deliveryGuarantee"
          description="Message delivery reliability guarantee"
        />

        {/* Message Priority */}
        <PropertySelect
          label="Message Priority"
          value={data.messagePriority || "Normal"}
          options={[
            { value: "Low", label: "Low" },
            { value: "Normal", label: "Normal" },
            { value: "High", label: "High" },
            { value: "Critical", label: "Critical" },
          ]}
          onChange={(value) =>
            onChange("data.messagePriority", value as MessagePriority)
          }
          path="data.messagePriority"
          description="Priority level for messages"
        />
      </PropertySection>

      {/* Persistence & Durability */}
      <PropertySection
        title="Persistence & Durability"
        defaultOpen={false}
        collapsible
      >
        {/* Persistent */}
        <PropertyToggle
          label="Persistent Storage"
          checked={!!data.persistent}
          onChange={(checked) => onChange("data.persistent", checked)}
          path="data.persistent"
          description="Messages are stored on disk (not just in memory)"
        />

        {/* Message Expiration */}
        <PropertyNumberInput
          label="Message Expiration"
          value={data.messageExpirationMs || 604800000} // Default 7 days
          onChange={(value) => onChange("data.messageExpirationMs", value)}
          path="data.messageExpirationMs"
          min={0}
          unit="ms"
          description="Time before messages expire (0 = never)"
        />

        {/* Max Queue Size */}
        <PropertyNumberInput
          label="Max Queue Size"
          value={data.maxQueueSizeMB || 1024}
          onChange={(value) => onChange("data.maxQueueSizeMB", value)}
          path="data.maxQueueSizeMB"
          min={1}
          unit="MB"
          description="Maximum size of the queue"
        />

        {/* Dead Letter Queue */}
        <PropertyToggle
          label="Dead Letter Queue"
          checked={!!data.deadLetterQueueEnabled}
          onChange={(checked) =>
            onChange("data.deadLetterQueueEnabled", checked)
          }
          path="data.deadLetterQueueEnabled"
          description="Store unprocessable messages in a separate queue"
        />
      </PropertySection>

      {/* Kafka-specific Partitioning Section */}
      {isKafka && (
        <PropertySection title="Partitioning" defaultOpen={false} collapsible>
          <PropertyToggle
            label="Partitioning Enabled"
            checked={!!data.partitioning}
            onChange={(checked) => onChange("data.partitioning", checked)}
            path="data.partitioning"
            description="Split topic into multiple partitions for parallelism"
          />

          {data.partitioning && (
            <>
              {/* Partition Key */}
              <PropertyTextInput
                label="Partition Key"
                value={data.partitionKey || ""}
                onChange={(value) => onChange("data.partitionKey", value)}
                path="data.partitionKey"
                placeholder="e.g., user_id"
                className="pl-6"
                description="Message field used for partitioning"
              />

              {/* Consumer Groups */}
              <div className="pl-6 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consumer Groups
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Comma-separated list of consumer groups accessing this topic
                </div>
                <textarea
                  value={(data.consumerGroups || []).join(", ")}
                  onChange={(e) => {
                    const groups = e.target.value
                      .split(",")
                      .map((g) => g.trim())
                      .filter((g) => g !== "");
                    onChange("data.consumerGroups", groups);
                  }}
                  className="w-full p-2 border rounded"
                  rows={2}
                  placeholder="group1, group2, group3"
                />
              </div>
            </>
          )}
        </PropertySection>
      )}

      {/* Ordering & Delivery Section */}
      <PropertySection
        title="Ordering & Delivery"
        defaultOpen={false}
        collapsible
      >
        {/* Ordering Guarantee */}
        <PropertyToggle
          label="Guaranteed Ordering"
          checked={!!data.orderingGuaranteed}
          onChange={(checked) => onChange("data.orderingGuaranteed", checked)}
          path="data.orderingGuaranteed"
          description="Messages from a producer are processed in order"
        />

        {/* Durable Subscription */}
        <PropertyToggle
          label="Durable Subscription"
          checked={!!data.durableSubscription}
          onChange={(checked) => onChange("data.durableSubscription", checked)}
          path="data.durableSubscription"
          description="Consumers remember their position when disconnected"
        />
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
          value={data.latencyMs || 50}
          onChange={(value) => onChange("data.latencyMs", value)}
          path="data.latencyMs"
          min={0}
          unit="ms"
          description="Expected message delivery latency"
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
          unit="msgs/sec"
          description="Maximum messages per second"
        />
      </PropertySection>

      {/* Reliability Settings */}
      <PropertySection
        title="Reliability Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Retry Settings */}
        <PropertyToggle
          label="Automatic Retries"
          checked={!!data.retryEnabled}
          onChange={(checked) => onChange("data.retryEnabled", checked)}
          path="data.retryEnabled"
          description="Retry failed message deliveries"
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

        {/* Circuit Breaker */}
        <PropertyToggle
          label="Circuit Breaker"
          checked={!!data.circuitBreakerEnabled}
          onChange={(checked) =>
            onChange("data.circuitBreakerEnabled", checked)
          }
          path="data.circuitBreakerEnabled"
          description="Stop message flow on repeated failures"
        />

        {/* Timeout */}
        <PropertyNumberInput
          label="Timeout"
          value={data.timeout || 30000}
          onChange={(value) => onChange("data.timeout", value)}
          path="data.timeout"
          min={100}
          unit="ms"
          description="Operation timeout"
        />
      </PropertySection>

      {/* Security Settings */}
      <PropertySection
        title="Security Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Encryption */}
        <PropertySelect
          label="Encryption"
          value={data.encryption || "TLS"}
          options={[
            { value: "None", label: "None" },
            { value: "TLS", label: "TLS" },
            { value: "End-to-End", label: "End-to-End" },
          ]}
          onChange={(value) => onChange("data.encryption", value)}
          path="data.encryption"
          description="Connection encryption method"
        />

        {/* Authentication */}
        <PropertySelect
          label="Authentication"
          value={data.authentication || "None"}
          options={[
            { value: "None", label: "None" },
            { value: "Basic", label: "Username/Password" },
            { value: "OAuth", label: "OAuth" },
            { value: "API Key", label: "API Key" },
            { value: "mTLS", label: "Mutual TLS" },
          ]}
          onChange={(value) => onChange("data.authentication", value)}
          path="data.authentication"
          description="Authentication method"
        />
      </PropertySection>

      {/* Protocol-specific sections */}
      {isMQTT && (
        <PropertySection title="MQTT Specific" defaultOpen={false} collapsible>
          <PropertyToggle
            label="Clean Session"
            checked={!data.durableSubscription}
            onChange={(checked) =>
              onChange("data.durableSubscription", !checked)
            }
            path="data.durableSubscription"
            description="Start fresh session each time (no persistent state)"
          />

          <PropertyToggle
            label="Retain Messages"
            checked={!!data.persistent}
            onChange={(checked) => onChange("data.persistent", checked)}
            path="data.persistent"
            description="Broker retains last message for new subscribers"
          />
        </PropertySection>
      )}

      {isAMQP && (
        <PropertySection title="AMQP Specific" defaultOpen={false} collapsible>
          <PropertyToggle
            label="Mandatory Flag"
            checked={!!data.retryEnabled}
            onChange={(checked) => onChange("data.retryEnabled", checked)}
            path="data.retryEnabled"
            description="Return message if it can't be routed"
          />

          <PropertyToggle
            label="Immediate Flag"
            checked={!!data.circuitBreakerEnabled}
            onChange={(checked) =>
              onChange("data.circuitBreakerEnabled", checked)
            }
            path="data.circuitBreakerEnabled"
            description="Return message if it can't be delivered immediately"
          />
        </PropertySection>
      )}
    </div>
  );
};

export default MessageQueueEdgeProperties;
