// src/components/canvas/properties/UDPEdgeProperties.tsx
import React from "react";
import { UDPEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface UDPEdgePropertiesProps {
  data: UDPEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const UDPEdgeProperties: React.FC<UDPEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic UDP Properties Section */}
      <PropertySection title="UDP Properties" defaultOpen={true} collapsible>
        {/* UDP Port */}
        <PropertyNumberInput
          label="Port"
          value={data.port || 0}
          onChange={(value) => onChange("data.port", value)}
          path="data.port"
          min={0}
          max={65535}
          description="UDP port number (0-65535)"
        />

        {/* Packet Size */}
        <PropertyNumberInput
          label="Packet Size"
          value={data.packetSizeBytes || 512}
          onChange={(value) => onChange("data.packetSizeBytes", value)}
          path="data.packetSizeBytes"
          min={1}
          max={65507} // Max UDP packet size
          unit="bytes"
          description="Size of UDP datagrams"
        />

        {/* Checksum Validation */}
        <PropertyToggle
          label="Checksum Validation"
          checked={!!data.checksumValidation}
          onChange={(checked) => onChange("data.checksumValidation", checked)}
          path="data.checksumValidation"
          description="Validate packet checksums (helps detect corruption)"
        />
      </PropertySection>

      {/* Broadcasting & Multicasting */}
      <PropertySection
        title="Broadcasting & Multicasting"
        defaultOpen={false}
        collapsible
      >
        {/* Broadcast */}
        <PropertyToggle
          label="Broadcast"
          checked={!!data.broadcast}
          onChange={(checked) => {
            onChange("data.broadcast", checked);
            // If enabling broadcast, disable multicast (they're mutually exclusive)
            if (checked && data.multicast) {
              onChange("data.multicast", false);
            }
          }}
          path="data.broadcast"
          description="Send to all devices on the subnet"
        />

        {/* Multicast */}
        <PropertyToggle
          label="Multicast"
          checked={!!data.multicast}
          onChange={(checked) => {
            onChange("data.multicast", checked);
            // If enabling multicast, disable broadcast (they're mutually exclusive)
            if (checked && data.broadcast) {
              onChange("data.broadcast", false);
            }
          }}
          path="data.multicast"
          description="Send to multiple specific devices"
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
          unit="pkts/sec"
          description="Maximum packets per second"
        />
      </PropertySection>

      {/* Reliability Settings */}
      <PropertySection
        title="Reliability Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Reliability Notice */}
        <div className="text-xs text-gray-600 mb-3 italic">
          UDP is inherently unreliable - packets may be lost, duplicated, or
          arrive out of order.
        </div>

        {/* Packet Loss Rate */}
        <PropertySlider
          label="Packet Loss Rate"
          value={data.packetLossRate || 0.01}
          onChange={(value) => onChange("data.packetLossRate", value)}
          path="data.packetLossRate"
          min={0}
          max={0.5}
          step={0.01}
          formatValue={(val) => `${(val * 100).toFixed(1)}%`}
          description="Percentage of packets lost during transmission"
        />

        {/* Reliability Level - Always Best-Effort for UDP */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            Reliability Level
          </span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
            Best-Effort
          </span>
        </div>
      </PropertySection>

      {/* Communication Characteristics */}
      <PropertySection
        title="Communication Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Bidirectional */}
        <PropertyToggle
          label="Bidirectional"
          checked={!!data.bidirectional}
          onChange={(checked) => onChange("data.bidirectional", checked)}
          path="data.bidirectional"
          description="Communication flows in both directions"
        />

        {/* Communication Pattern */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            Communication Pattern
          </span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
            {data.broadcast
              ? "Broadcast"
              : data.multicast
              ? "Multicast"
              : "Datagram"}
          </span>
        </div>
      </PropertySection>

      {/* Visual Properties */}
      <PropertySection
        title="Visual Properties"
        defaultOpen={false}
        collapsible
      >
        {/* This section is optional but keeps UI consistent with other edge types */}
        <PropertyToggle
          label="Animated"
          checked={!!data.animated}
          onChange={(checked) => onChange("data.animated", checked)}
          path="data.animated"
          description="Show animation along the connection"
        />

        {/* Custom dashed pattern overrides default dotted pattern */}
        <PropertyToggle
          label="Use Dashed Line"
          checked={!!data.dashed}
          onChange={(checked) => onChange("data.dashed", checked)}
          path="data.dashed"
          description="Use dashed instead of dotted line"
        />
      </PropertySection>
    </div>
  );
};

export default UDPEdgeProperties;
