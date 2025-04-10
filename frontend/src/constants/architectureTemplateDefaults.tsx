// src/constants/architectureTemplates.ts
import { ArchitectureTemplate } from "../types/flow/architectureTypes";
import { NodeType } from "../types/flow/nodeTypes";
import { EdgeType } from "../types/flow/edgeTypes";
import {
  defaultClientNodeData,
  defaultServerNodeData,
  defaultDatabaseNodeData,
  defaultLoadBalancerNodeData,
  defaultCacheNodeData,
} from "./nodeDefaults";

/**
 * Collection of predefined architecture templates
 */

// Three-Tier Architecture: Client → Server → Database
export const threeTierArchitecture: ArchitectureTemplate = {
  id: "three-tier",
  nodes: [
    {
      type: NodeType.Client,
      data: {
        label: "Web Client",
        description: "User-facing frontend application",
        ...defaultClientNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Application Server",
        description: "Business logic and API endpoints",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Database",
        description: "Persistent data storage",
        ...defaultDatabaseNodeData,
      },
    },
  ],
  edges: [
    {
      source: 0, // Client
      target: 1, // Server
      type: EdgeType.HTTP,
    },
    {
      source: 1, // Server
      target: 2, // Database
      type: EdgeType.Database,
    },
  ],
};

// Microservices Architecture
export const microservicesArchitecture: ArchitectureTemplate = {
  id: "microservices",

  nodes: [
    {
      type: NodeType.Client,
      data: {
        label: "Web Client",
        description: "Frontend application",
        ...defaultClientNodeData,
      },
    },
    {
      type: NodeType.LoadBalancer,
      data: {
        label: "API Gateway",
        description: "Entry point for all client requests",
        ...defaultLoadBalancerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "User Service",
        description: "Handles user authentication and profiles",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Product Service",
        description: "Manages product catalog and inventory",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Order Service",
        description: "Processes customer orders",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "User DB",
        description: "User data storage",
        ...defaultDatabaseNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Product DB",
        description: "Product data storage",
        ...defaultDatabaseNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Order DB",
        description: "Order data storage",
        ...defaultDatabaseNodeData,
      },
    },
  ],
  edges: [
    { source: 0, target: 1, type: EdgeType.HTTP },
    { source: 1, target: 2, type: EdgeType.HTTP },
    { source: 1, target: 3, type: EdgeType.HTTP },
    { source: 1, target: 4, type: EdgeType.HTTP },
    { source: 2, target: 5, type: EdgeType.Database },
    { source: 3, target: 6, type: EdgeType.Database },
    { source: 4, target: 7, type: EdgeType.Database },
    { source: 2, target: 3, type: EdgeType.HTTP },
    { source: 3, target: 4, type: EdgeType.HTTP },
  ],
};

// Web Application with Caching
export const webAppWithCaching: ArchitectureTemplate = {
  id: "web-app-caching",

  nodes: [
    {
      type: NodeType.Client,
      data: {
        label: "Web Client",
        description: "User-facing application",
        ...defaultClientNodeData,
      },
    },
    {
      type: NodeType.LoadBalancer,
      data: {
        label: "Load Balancer",
        description: "Distributes traffic across servers",
        ...defaultLoadBalancerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Web Server 1",
        description: "Handles HTTP requests",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Web Server 2",
        description: "Handles HTTP requests",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Cache,
      data: {
        label: "Redis Cache",
        description: "In-memory data store",
        ...defaultCacheNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Database",
        description: "Persistent data storage",
        ...defaultDatabaseNodeData,
      },
    },
  ],
  edges: [
    { source: 0, target: 1, type: EdgeType.HTTP },
    { source: 1, target: 2, type: EdgeType.HTTP },
    { source: 1, target: 3, type: EdgeType.HTTP },
    { source: 2, target: 4, type: EdgeType.HTTP },
    { source: 3, target: 4, type: EdgeType.HTTP },
    { source: 2, target: 5, type: EdgeType.Database },
    { source: 3, target: 5, type: EdgeType.Database },
  ],
};

// Event-Driven Architecture
export const eventDrivenArchitecture: ArchitectureTemplate = {
  id: "event-driven",

  nodes: [
    {
      type: NodeType.Client,
      data: {
        label: "Web Client",
        description: "Frontend application",
        ...defaultClientNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "API Gateway",
        description: "Entry point for client requests",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Event Broker",
        description: "Kafka/RabbitMQ message broker",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Order Service",
        description: "Processes orders",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Payment Service",
        description: "Handles payments",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Server,
      data: {
        label: "Notification Service",
        description: "Sends notifications",
        ...defaultServerNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Order DB",
        description: "Order storage",
        ...defaultDatabaseNodeData,
      },
    },
    {
      type: NodeType.Database,
      data: {
        label: "Payment DB",
        description: "Payment records",
        ...defaultDatabaseNodeData,
      },
    },
  ],
  edges: [
    { source: 0, target: 1, type: EdgeType.HTTP },
    { source: 1, target: 2, type: EdgeType.Kafka },
    { source: 2, target: 3, type: EdgeType.Kafka },
    { source: 2, target: 4, type: EdgeType.Kafka },
    { source: 2, target: 5, type: EdgeType.Kafka },
    { source: 3, target: 6, type: EdgeType.Database },
    { source: 4, target: 7, type: EdgeType.Database },
  ],
};

// Collection of all templates
export const architectureTemplates: ArchitectureTemplate[] = [
  threeTierArchitecture,
  microservicesArchitecture,
  webAppWithCaching,
  eventDrivenArchitecture,
];
