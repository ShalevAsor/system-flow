/**
 * Streamlined types for backend storage of the flow simulation data
 */

// Define basic enums that we need for type safety
export enum NodeType {
  Server = "server",
  Database = "database",
  LoadBalancer = "loadBalancer",
  Client = "client",
  Cache = "cache",
}

export enum EdgeType {
  Default = "default",
  HTTP = "http",
  WebSocket = "websocket",
  gRPC = "grpc",
  TCP = "tcp",
  UDP = "udp",
  MQTT = "mqtt",
  AMQP = "amqp",
  Kafka = "kafka",
  EventStream = "eventStream",
  Database = "database",
}

// Node position type
export interface NodePosition {
  x: number;
  y: number;
}

// node/edge data
export type dataType = string | string[] | number | number[] | boolean;

// Generic node data interface - we'll use Record<string, any> for flexibility
// This allows MongoDB to store all the different node types without strict validation
export interface SystemDesignNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: Record<string, dataType>; // Stores any node-specific properties
}

// Generic edge interface
export interface SystemDesignEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  sourceHandle?: string;
  targetHandle?: string;
  data: Record<string, dataType>; // Stores any edge-specific properties
}

export interface FlowItem {
  id: string;
  name: string;
  description: string;
  nodes: number;
  edges: number;
  updatedAt: Date;
}
