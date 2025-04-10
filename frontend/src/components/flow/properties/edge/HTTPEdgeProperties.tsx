// src/components/canvas/properties/HTTPEdgeProperties.tsx
import React from "react";
import { HTTPEdgeData } from "../../../../types/flow/edgeTypes";
import PropertySection from "../common/PropertySection";
import PropertyNumberInput from "../common/PropertyNumberInput";
import PropertySelect from "../common/PropertySelect";
import PropertyToggle from "../common/PropertyToggle";
import { EdgePropertyValue } from "../../../../utils/flow/edgeUtils";
import PropertyTextInput from "../common/PropertyTextInput";

interface HTTPEdgePropertiesProps {
  data: HTTPEdgeData;
  onChange: (path: string, value: EdgePropertyValue) => void;
}

const HTTPEdgeProperties: React.FC<HTTPEdgePropertiesProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic HTTP Properties Section */}
      <PropertySection
        className="mt-3"
        title="HTTP Properties"
        defaultOpen={true}
        collapsible
      >
        {/* HTTP Method */}
        <PropertySelect
          label="HTTP Method"
          value={data.method || "GET"}
          options={[
            { value: "GET", label: "GET" },
            { value: "POST", label: "POST" },
            { value: "PUT", label: "PUT" },
            { value: "PATCH", label: "PATCH" },
            { value: "DELETE", label: "DELETE" },
            { value: "HEAD", label: "HEAD" },
            { value: "OPTIONS", label: "OPTIONS" },
          ]}
          onChange={(value) => onChange("data.method", value)}
          path="data.method"
        />

        {/* HTTP Version */}
        <PropertySelect
          label="HTTP Version"
          value={data.httpVersion || "HTTP/1.1"}
          options={[
            { value: "HTTP/1.1", label: "HTTP/1.1" },
            { value: "HTTP/2", label: "HTTP/2" },
            { value: "HTTP/3", label: "HTTP/3" },
          ]}
          onChange={(value) => onChange("data.httpVersion", value)}
          path="data.httpVersion"
        />

        {/* TLS Enabled */}
        <PropertyToggle
          label="Use TLS (HTTPS)"
          checked={!!data.useTLS}
          onChange={(checked) => onChange("data.useTLS", checked)}
          path="data.useTLS"
          description="Enable secure HTTPS connection"
        />
      </PropertySection>

      {/* Caching Section */}
      <PropertySection title="Caching" defaultOpen={false} collapsible>
        {/* Cache Enabled */}
        <PropertyToggle
          label="Enable Caching"
          checked={!!data.cacheEnabled}
          onChange={(checked) => onChange("data.cacheEnabled", checked)}
          path="data.cacheEnabled"
        />

        {data.cacheEnabled && (
          <>
            {/* Cache Control */}
            <PropertySelect
              label="Cache Control"
              value={data.cacheControl || "No-Cache"}
              options={[
                { value: "No-Cache", label: "No-Cache" },
                { value: "Private", label: "Private" },
                { value: "Public", label: "Public" },
                { value: "Must-Revalidate", label: "Must-Revalidate" },
              ]}
              onChange={(value) => onChange("data.cacheControl", value)}
              path="data.cacheControl"
              className="pl-6"
            />

            {/* Cache TTL */}
            <PropertyNumberInput
              label="Cache TTL"
              value={data.cacheTTLSeconds || 300}
              onChange={(value) => onChange("data.cacheTTLSeconds", value)}
              path="data.cacheTTLSeconds"
              min={0}
              unit="sec"
              description="Time to live for cached content"
              className="pl-6"
            />
          </>
        )}
      </PropertySection>

      {/* Performance Controls Section */}
      <PropertySection
        title="Performance Controls"
        defaultOpen={false}
        collapsible
      >
        {/* Rate Limit */}
        <PropertyNumberInput
          label="Rate Limit"
          value={data.rateLimit || 100}
          onChange={(value) => onChange("data.rateLimit", value)}
          path="data.rateLimit"
          min={0}
          description="Maximum requests per minute"
          unit="req/min"
        />

        {/* Rate Limit Burst */}
        <PropertyNumberInput
          label="Burst Capacity"
          value={data.rateLimitBurst || 20}
          onChange={(value) => onChange("data.rateLimitBurst", value)}
          path="data.rateLimitBurst"
          min={0}
          description="Additional requests allowed in burst"
        />

        {/* CORS Enabled */}
        <PropertyToggle
          label="Enable CORS"
          checked={!!data.corsEnabled}
          onChange={(checked) => onChange("data.corsEnabled", checked)}
          path="data.corsEnabled"
          description="Cross-Origin Resource Sharing"
        />
      </PropertySection>

      {/* Routing & Load Balancing */}
      <PropertySection
        title="Routing & Load Balancing"
        defaultOpen={false}
        collapsible
      >
        {/* Proxy Enabled */}
        <PropertyToggle
          label="Use Proxy"
          checked={!!data.proxyEnabled}
          onChange={(checked) => onChange("data.proxyEnabled", checked)}
          path="data.proxyEnabled"
        />

        {data.proxyEnabled && (
          <PropertyTextInput
            label="Proxy Address"
            value={data.proxyAddress || ""}
            onChange={(value) => onChange("data.proxyAddress", value)}
            path="data.proxyAddress"
            placeholder="e.g., proxy.example.com:8080"
            className="pl-6"
          />
        )}

        {/* Load Balanced */}
        <PropertyToggle
          label="Load Balanced"
          checked={!!data.loadBalanced}
          onChange={(checked) => onChange("data.loadBalanced", checked)}
          path="data.loadBalanced"
          description="Connection passes through a load balancer"
        />

        {/* API Gateway */}
        <PropertyToggle
          label="Use API Gateway"
          checked={!!data.useApiGateway}
          onChange={(checked) => onChange("data.useApiGateway", checked)}
          path="data.useApiGateway"
          description="Connection passes through an API gateway"
        />
      </PropertySection>
    </div>
  );
};

export default HTTPEdgeProperties;
