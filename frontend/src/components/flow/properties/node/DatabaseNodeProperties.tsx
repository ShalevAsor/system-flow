// src/components/canvas/properties/DatabaseNodeProperties.tsx
import React from "react";
import { DatabaseNodeData } from "../../../../types/flow/nodeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import { getSubTypeOptions } from "../../../../utils/flow/nodeUtils";
import PropertyToggle from "../common/PropertyToggle";
import PropertySlider from "../common/PropertySlider";

interface DatabaseNodePropertiesProps {
  data: DatabaseNodeData;
  onChange: (path: string, value: string | number | boolean) => void;
}

const DatabaseNodeProperties: React.FC<DatabaseNodePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Configuration Section */}
      <PropertySection
        title="Basic configuration"
        defaultOpen={false}
        collapsible
      >
        {/* Database Type field */}
        <PropertySelect
          label="Database Type"
          value={data.dbType || "SQL"}
          options={[
            { value: "SQL", label: "SQL" },
            { value: "NoSQL", label: "NoSQL" },
            { value: "Cache", label: "Cache" },
            { value: "Other", label: "Other" },
          ]}
          onChange={(value) => onChange("data.dbType", value)}
          path="data.dbType"
        />

        {/* Database Subtype field - shows different options based on main type */}
        <PropertySelect
          label="Database Subtype"
          value={data.dbSubType || ""}
          options={getSubTypeOptions(data.dbType)}
          onChange={(value) => onChange("data.dbSubType", value)}
          path="data.dbSubType"
          description="Specific database technology category"
        />
      </PropertySection>

      {/* Capacity and Performance Section */}
      <PropertySection
        title="capacity & performance"
        defaultOpen={false}
        collapsible
      >
        {/* Storage Capacity with unit selector */}
        <div className="mb-3 flex space-x-2">
          <PropertyNumberInput
            label="Storage Capacity"
            value={data.storageCapacity || 100}
            onChange={(value) => onChange("data.storageCapacity", value)}
            path="data.storageCapacity"
            min={1}
          />
        </div>

        {/* Maximum Connections */}
        <PropertyNumberInput
          label="Maximum Connections"
          value={data.maxConnections || 100}
          onChange={(value) => onChange("data.maxConnections", value)}
          path="data.maxConnections"
          min={1}
        />

        {/* Performance metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <PropertyNumberInput
            label="Read IOPS"
            value={data.readIOPS || 1000}
            onChange={(value) => onChange("data.readIOPS", value)}
            path="data.readIOPS"
            min={1}
          />
          <PropertyNumberInput
            label="Write IOPS"
            value={data.writeIOPS || 500}
            onChange={(value) => onChange("data.writeIOPS", value)}
            path="data.writeIOPS"
            min={1}
          />
        </div>

        {/* Average Latency */}
        <PropertyNumberInput
          label="Average Latency"
          value={data.averageLatency || 5}
          onChange={(value) => onChange("data.averageLatency", value)}
          path="data.averageLatency"
          min={0}
          step={0.1}
          unit="ms"
        />
      </PropertySection>

      {/* Reliability and Scaling Section */}
      <PropertySection
        title="reliability & scaling"
        defaultOpen={false}
        collapsible
      >
        {/* Replication toggle and related fields */}
        <PropertyToggle
          label="Replication"
          checked={!!data.replication}
          onChange={(checked) => onChange("data.replication", checked)}
          path="data.replication"
          description="Enable replication for data redundancy"
        />

        {/* Show replication options only if replication is enabled */}
        {data.replication && (
          <div className="pl-6 mt-2 space-y-3">
            <PropertySelect
              label="Replication Type"
              value={data.replicationType || "Master-Slave"}
              options={[
                { value: "Master-Slave", label: "Master-Slave" },
                { value: "Multi-Master", label: "Multi-Master" },
                { value: "Sharded", label: "Sharded" },
              ]}
              onChange={(value) => onChange("data.replicationType", value)}
              path="data.replicationType"
            />

            <PropertyNumberInput
              label="Replication Factor"
              value={data.replicationFactor || 3}
              onChange={(value) => onChange("data.replicationFactor", value)}
              path="data.replicationFactor"
              min={2}
              max={10}
            />
          </div>
        )}

        {/* Backup Strategy */}
        <PropertySelect
          label="Backup Strategy"
          value={data.backupStrategy || "Daily"}
          options={[
            { value: "None", label: "None" },
            { value: "Daily", label: "Daily" },
            { value: "Continuous", label: "Continuous" },
          ]}
          onChange={(value) => onChange("data.backupStrategy", value)}
          path="data.backupStrategy"
        />

        {/* Auto Scaling */}
        <PropertyToggle
          label="Auto Scaling"
          checked={!!data.autoScaling}
          onChange={(checked) => onChange("data.autoScaling", checked)}
          path="data.autoScaling"
        />
      </PropertySection>

      {/* Workload Characteristics Section */}
      <PropertySection
        title="Workload Characteristics"
        defaultOpen={false}
        collapsible
      >
        {/* Read/Write Ratio slider */}
        <PropertySlider
          label="Read/Write Ratio"
          value={data.readWriteRatio || 70}
          onChange={(value) => onChange("data.readWriteRatio", value)}
          path="data.readWriteRatio"
          min={0}
          max={100}
          step={1}
          formatValue={(value) => `${value}% Reads / ${100 - value}% Writes`}
          description="Distribution between read and write operations"
        />

        {/* Query Complexity */}
        <PropertySelect
          label="Query Complexity"
          value={data.queryComplexity || "Moderate"}
          options={[
            { value: "Simple", label: "Simple (Basic CRUD)" },
            { value: "Moderate", label: "Moderate (Joins, Aggregations)" },
            { value: "Complex", label: "Complex (Analytics, Complex Queries)" },
          ]}
          onChange={(value) => onChange("data.queryComplexity", value)}
          path="data.queryComplexity"
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
          step={0.001}
          formatValue={(value) => `${(value * 100).toFixed(3)}%`}
          description="Chance of this server failing during simulation"
        />
      </PropertySection>
    </div>
  );
};

export default DatabaseNodeProperties;
