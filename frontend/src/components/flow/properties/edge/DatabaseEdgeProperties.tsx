// src/components/canvas/properties/DatabaseEdgeProperties.tsx
import React from "react";
import { DatabaseEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";

interface DatabaseEdgePropertiesProps {
  data: DatabaseEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const DatabaseEdgeProperties: React.FC<DatabaseEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Database Connection Properties */}
      <PropertySection
        title="Database Connection"
        defaultOpen={true}
        collapsible
      >
        {/* Connection Type */}
        <PropertySelect
          label="Connection Type"
          value={data.connectionType || "Read-Write"}
          options={[
            { value: "Read", label: "Read Only" },
            { value: "Write", label: "Write Only" },
            { value: "Read-Write", label: "Read-Write" },
            { value: "Admin", label: "Administrative" },
          ]}
          onChange={(value) => onChange("data.connectionType", value)}
          path="data.connectionType"
          description="Type of database access"
        />

        {/* Read Only (quick toggle) */}
        <PropertyToggle
          label="Read Only"
          checked={!!data.readOnly || data.connectionType === "Read"}
          onChange={(checked) => {
            onChange("data.readOnly", checked);
            if (checked && data.connectionType !== "Read") {
              onChange("data.connectionType", "Read");
            } else if (!checked && data.connectionType === "Read") {
              onChange("data.connectionType", "Read-Write");
            }
          }}
          path="data.readOnly"
          description="Connection is read-only"
        />

        {/* Prepared Statements */}
        <PropertyToggle
          label="Use Prepared Statements"
          checked={!!data.preparedStatements}
          onChange={(checked) => onChange("data.preparedStatements", checked)}
          path="data.preparedStatements"
          description="Use prepared statements for queries"
        />
      </PropertySection>

      {/* Connection Pooling */}
      <PropertySection
        title="Connection Pooling"
        defaultOpen={false}
        collapsible
      >
        {/* Pooling Enabled */}
        <PropertyToggle
          label="Enable Connection Pooling"
          checked={!!data.connectionPooling}
          onChange={(checked) => onChange("data.connectionPooling", checked)}
          path="data.connectionPooling"
          description="Reuse database connections"
        />

        {data.connectionPooling && (
          <>
            {/* Min Connections */}
            <PropertyNumberInput
              label="Minimum Connections"
              value={data.minConnections || 5}
              onChange={(value) => onChange("data.minConnections", value)}
              path="data.minConnections"
              min={1}
              className="pl-6"
              description="Minimum connections to maintain in pool"
            />

            {/* Max Connections */}
            <PropertyNumberInput
              label="Maximum Connections"
              value={data.maxConnections || 20}
              onChange={(value) => onChange("data.maxConnections", value)}
              path="data.maxConnections"
              min={data.minConnections || 1}
              className="pl-6"
              description="Maximum connections allowed in pool"
            />
          </>
        )}
      </PropertySection>

      {/* Transaction Settings */}
      <PropertySection
        title="Transaction Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Transactional */}
        <PropertyToggle
          label="Transactional"
          checked={!!data.transactional}
          onChange={(checked) => onChange("data.transactional", checked)}
          path="data.transactional"
          description="Connections use transactions"
        />

        {data.transactional && (
          <>
            {/* Isolation Level */}
            <PropertySelect
              label="Isolation Level"
              value={data.isolationLevel || "Read Committed"}
              options={[
                {
                  value: "Read Uncommitted",
                  label: "Read Uncommitted (Lowest)",
                },
                { value: "Read Committed", label: "Read Committed" },
                { value: "Repeatable Read", label: "Repeatable Read" },
                { value: "Serializable", label: "Serializable (Highest)" },
              ]}
              onChange={(value) => onChange("data.isolationLevel", value)}
              path="data.isolationLevel"
              className="pl-6"
              description="Transaction isolation level"
            />
          </>
        )}
      </PropertySection>

      {/* Performance Settings */}
      <PropertySection
        title="Performance Settings"
        defaultOpen={false}
        collapsible
      >
        {/* Query Timeout */}
        <PropertyNumberInput
          label="Query Timeout"
          value={data.queryTimeout || 30000}
          onChange={(value) => onChange("data.queryTimeout", value)}
          path="data.queryTimeout"
          min={100}
          unit="ms"
          description="Maximum time a query can run"
        />

        {/* Latency */}
        <PropertyNumberInput
          label="Latency"
          value={data.latencyMs || 20}
          onChange={(value) => onChange("data.latencyMs", value)}
          path="data.latencyMs"
          min={1}
          unit="ms"
          description="Expected query response time"
        />

        {/* Communication Pattern */}
        <PropertySelect
          label="Communication Pattern"
          value={data.communicationPattern || "Request-Reply"}
          options={[
            { value: "Request-Reply", label: "Request-Reply" },
            { value: "Sync", label: "Synchronous" },
            { value: "Async", label: "Asynchronous" },
          ]}
          onChange={(value) => onChange("data.communicationPattern", value)}
          path="data.communicationPattern"
          description="Pattern of database communication"
        />
      </PropertySection>

      {/* Reliability Settings */}
      <PropertySection title="Reliability" defaultOpen={false} collapsible>
        {/* Reliability Level */}
        <PropertySelect
          label="Reliability Level"
          value={data.reliability || "ACID"}
          options={[
            { value: "ACID", label: "ACID Transactions" },
            { value: "At-Least-Once", label: "At-Least-Once" },
            { value: "Exactly-Once", label: "Exactly-Once" },
            { value: "Best-Effort", label: "Best-Effort" },
          ]}
          onChange={(value) => onChange("data.reliability", value)}
          path="data.reliability"
          description="Data reliability guarantee"
        />

        {/* Retry Enabled */}
        <PropertyToggle
          label="Retry Failed Queries"
          checked={!!data.retryEnabled}
          onChange={(checked) => onChange("data.retryEnabled", checked)}
          path="data.retryEnabled"
          description="Automatically retry failed queries"
        />

        {data.retryEnabled && (
          <PropertyNumberInput
            label="Max Retries"
            value={data.maxRetries || 3}
            onChange={(value) => onChange("data.maxRetries", value)}
            path="data.maxRetries"
            min={1}
            max={10}
            className="pl-6"
            description="Maximum number of retry attempts"
          />
        )}
      </PropertySection>

      {/* Security Settings */}
      <PropertySection title="Security" defaultOpen={false} collapsible>
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
          value={data.authentication || "Basic"}
          options={[
            { value: "None", label: "None" },
            { value: "Basic", label: "Username/Password" },
            { value: "OAuth", label: "OAuth" },
            { value: "API Key", label: "API Key" },
            { value: "Client Certificate", label: "Client Certificate" },
          ]}
          onChange={(value) => onChange("data.authentication", value)}
          path="data.authentication"
          description="Authentication method"
        />
      </PropertySection>
    </div>
  );
};

export default DatabaseEdgeProperties;
